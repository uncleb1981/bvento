-- Bvento schema — run this in the Supabase SQL editor when ready to move off mock/localStorage data.
-- Mirrors the shapes used by src/lib/store.js and src/lib/mockData.js.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text, -- null until the user sets it themselves on their profile
  city text,
  completed_trades int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists bikes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  type text not null,
  condition text not null,
  estimated_value numeric not null,
  description text,
  city text,
  photo_url text,
  poster_name text, -- first name the poster typed in on this specific listing
  status text not null default 'active', -- active | traded | removed
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists trade_proposals (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references profiles(id) on delete cascade,
  to_user_id uuid not null references profiles(id) on delete cascade,
  my_bike_id uuid references bikes(id) on delete set null, -- null = cash-only offer, or the offered bike was later removed
  target_bike_id uuid references bikes(id) on delete set null, -- null once the listing is removed/traded; proposal history is kept
  cash_amount numeric not null default 0,
  cash_direction text not null default 'even', -- i_pay | they_pay | even (relative to from_user)
  message text,
  status text not null default 'pending', -- pending | accepted | declined
  created_at timestamptz not null default now()
);

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid references trade_proposals(id) on delete set null,
  user_1_id uuid not null references profiles(id) on delete cascade,
  user_2_id uuid not null references profiles(id) on delete cascade,
  my_bike_id uuid references bikes(id) on delete set null,
  target_bike_id uuid references bikes(id) on delete set null,
  cash_amount numeric not null default 0,
  cash_direction text not null default 'even',
  trade_complete boolean not null default false,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid references profiles(id) on delete cascade, -- null = system message
  message text not null,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;
alter table bikes enable row level security;
alter table trade_proposals enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;

create policy "profiles are viewable by everyone" on profiles for select using (true);
create policy "users create their own profile" on profiles for insert with check (auth.uid() = id);
create policy "users manage their own profile" on profiles for update using (auth.uid() = id);

create policy "bikes are viewable by everyone" on bikes for select using (true);
create policy "users manage their own bikes" on bikes for all using (auth.uid() = owner_id);

create policy "users see proposals they sent or received" on trade_proposals for select
  using (auth.uid() = from_user_id or auth.uid() = to_user_id);
create policy "users create proposals as themselves" on trade_proposals for insert
  with check (auth.uid() = from_user_id);
create policy "recipient can update proposal status" on trade_proposals for update
  using (auth.uid() = to_user_id or auth.uid() = from_user_id);
create policy "proposer can delete their declined proposals" on trade_proposals for delete
  using (auth.uid() = from_user_id and status = 'declined');

create policy "users see their own conversations" on conversations for select
  using (auth.uid() = user_1_id or auth.uid() = user_2_id);
create policy "users create conversations they're part of" on conversations for insert
  with check (auth.uid() = user_1_id or auth.uid() = user_2_id);
create policy "users update their own conversations" on conversations for update
  using (auth.uid() = user_1_id or auth.uid() = user_2_id);

create policy "users see messages in their conversations" on messages for select
  using (exists (
    select 1 from conversations c
    where c.id = conversation_id and (c.user_1_id = auth.uid() or c.user_2_id = auth.uid())
  ));
-- sender_id must be the caller's own uid — system messages (sender_id null) are
-- inserted only by the SECURITY DEFINER functions below, which bypass RLS, so a
-- regular user can never spoof a message as coming from "the system."
create policy "users send messages in their conversations" on messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from conversations c
      where c.id = conversation_id and (c.user_1_id = auth.uid() or c.user_2_id = auth.uid())
    )
  );

-- ── Migration (2026-07-23): close three gaps found in a backend review ─────────
-- 1. "only the listing owner can mark a trade complete" was only checked in
--    app code — the conversations UPDATE policy above lets *either* participant
--    update the row, so a proposer could call the API directly and flip
--    trade_complete themselves. Moving the write into a SECURITY DEFINER
--    function (which checks ownership itself) plus revoking direct column
--    access closes that off at the database level.
-- 2. Deleting a bike (trade completed, or owner removes a listing) used to
--    cascade-delete every trade_proposals row referencing it — including other
--    users' still-pending offers, which just silently vanished. The FK changes
--    above (on delete set null) plus these functions explicitly declining
--    those proposals first mean they're marked "Declined" and kept, not erased.
-- 3. The messages insert policy allowed any participant to set sender_id to
--    null, i.e. impersonate a system message. Tightened above; the real system
--    message (the "It's a match!" line) now comes from
--    accept_proposal_and_match(), which runs with elevated privileges.

alter table trade_proposals alter column target_bike_id drop not null;

alter table trade_proposals drop constraint if exists trade_proposals_target_bike_id_fkey;
alter table trade_proposals add constraint trade_proposals_target_bike_id_fkey
  foreign key (target_bike_id) references bikes(id) on delete set null;

alter table trade_proposals drop constraint if exists trade_proposals_my_bike_id_fkey;
alter table trade_proposals add constraint trade_proposals_my_bike_id_fkey
  foreign key (my_bike_id) references bikes(id) on delete set null;

-- Only the RPCs below may delete a bike or flip trade_complete now.
revoke delete on bikes from authenticated;
revoke update (trade_complete) on conversations from authenticated;

-- ── Completed trade log (2026-07-24) ────────────────────────────────────────
-- A permanent record of every completed trade, since mark_trade_complete()
-- below deletes the bikes/conversation/proposals entirely. RLS is enabled
-- with NO policies at all — regular users (anon or authenticated) can never
-- read or write this table. Only the SECURITY DEFINER function (which runs
-- as the table owner and bypasses RLS) can insert into it, and only the
-- project owner via the Supabase dashboard/Table Editor can read it.
create table if not exists completed_trades (
  id uuid primary key default gen_random_uuid(),
  listing_owner_email text,
  listing_owner_name text,
  proposer_email text,
  proposer_name text,
  target_bike_title text,
  target_bike_type text,
  target_bike_value numeric,
  offered_bike_title text,
  offered_bike_type text,
  offered_bike_value numeric,
  cash_amount numeric,
  cash_direction text,
  completed_at timestamptz not null default now()
);

alter table completed_trades enable row level security;

create or replace function mark_trade_complete(p_conversation_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conv conversations%rowtype;
  v_owner_id uuid;
  v_owner_email text;
  v_owner_name text;
  v_proposer_email text;
  v_proposer_name text;
  v_target_bike_title text;
  v_target_bike_type text;
  v_target_bike_value numeric;
  v_offered_bike_title text;
  v_offered_bike_type text;
  v_offered_bike_value numeric;
begin
  select * into v_conv from conversations where id = p_conversation_id;

  if v_conv.id is null or v_conv.target_bike_id is null then
    raise exception 'This trade was already completed or the listing was removed.';
  end if;

  select owner_id into v_owner_id from bikes where id = v_conv.target_bike_id;

  if v_owner_id is null then
    raise exception 'This trade was already completed or the listing was removed.';
  end if;

  if auth.uid() is distinct from v_owner_id then
    raise exception 'Only the listing owner can mark this trade complete.';
  end if;

  -- Record who traded what before any of it gets deleted below.
  select email into v_owner_email from auth.users where id = v_owner_id;
  select coalesce(name, 'Rider') into v_owner_name from profiles where id = v_owner_id;
  select email into v_proposer_email from auth.users where id = v_conv.user_1_id;
  select coalesce(name, 'Rider') into v_proposer_name from profiles where id = v_conv.user_1_id;

  select title, type, estimated_value into v_target_bike_title, v_target_bike_type, v_target_bike_value
    from bikes where id = v_conv.target_bike_id;

  if v_conv.my_bike_id is not null then
    select title, type, estimated_value into v_offered_bike_title, v_offered_bike_type, v_offered_bike_value
      from bikes where id = v_conv.my_bike_id;
  end if;

  insert into completed_trades (
    listing_owner_email, listing_owner_name, proposer_email, proposer_name,
    target_bike_title, target_bike_type, target_bike_value,
    offered_bike_title, offered_bike_type, offered_bike_value,
    cash_amount, cash_direction
  ) values (
    v_owner_email, v_owner_name, v_proposer_email, v_proposer_name,
    v_target_bike_title, v_target_bike_type, v_target_bike_value,
    v_offered_bike_title, v_offered_bike_type, v_offered_bike_value,
    v_conv.cash_amount, v_conv.cash_direction
  );

  -- Now remove every record tied to this listing: the winning conversation
  -- (messages cascade with it), every proposal ever made on it (accepted or
  -- still pending), and the bike itself.
  delete from conversations where target_bike_id = v_conv.target_bike_id;
  delete from trade_proposals where target_bike_id = v_conv.target_bike_id or my_bike_id = v_conv.target_bike_id;
  delete from bikes where id = v_conv.target_bike_id;
end;
$$;

grant execute on function mark_trade_complete(uuid) to authenticated;

create or replace function delete_bike(p_bike_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner_id uuid;
begin
  select owner_id into v_owner_id from bikes where id = p_bike_id;

  if v_owner_id is null then
    raise exception 'Bike not found.';
  end if;

  if auth.uid() is distinct from v_owner_id then
    raise exception 'Only the owner can delete this listing.';
  end if;

  -- Remove every record tied to this listing: any chat it's part of
  -- (messages cascade with it), every proposal ever made on it (sent or
  -- received, any status), and the bike itself.
  delete from conversations where target_bike_id = p_bike_id or my_bike_id = p_bike_id;
  delete from trade_proposals where target_bike_id = p_bike_id or my_bike_id = p_bike_id;
  delete from bikes where id = p_bike_id;
end;
$$;

grant execute on function delete_bike(uuid) to authenticated;

create or replace function accept_proposal_and_match(p_proposal_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_proposal trade_proposals%rowtype;
  v_conversation_id uuid;
  v_from_name text;
  v_to_name text;
  v_my_bike_title text;
  v_target_bike_title text;
  v_payer_name text;
  v_deal_description text;
begin
  select * into v_proposal from trade_proposals where id = p_proposal_id;

  if v_proposal.id is null then
    raise exception 'Proposal not found.';
  end if;

  if auth.uid() is distinct from v_proposal.to_user_id then
    raise exception 'Only the recipient can accept this proposal.';
  end if;

  if v_proposal.status is distinct from 'pending' then
    raise exception 'This proposal is no longer pending.';
  end if;

  update trade_proposals set status = 'accepted' where id = p_proposal_id;

  insert into conversations (proposal_id, user_1_id, user_2_id, my_bike_id, target_bike_id, cash_amount, cash_direction)
  values (p_proposal_id, v_proposal.from_user_id, v_proposal.to_user_id, v_proposal.my_bike_id, v_proposal.target_bike_id, v_proposal.cash_amount, v_proposal.cash_direction)
  returning id into v_conversation_id;

  select coalesce(name, 'Rider') into v_from_name from profiles where id = v_proposal.from_user_id;
  select coalesce(name, 'Rider') into v_to_name from profiles where id = v_proposal.to_user_id;
  select title into v_target_bike_title from bikes where id = v_proposal.target_bike_id;
  if v_proposal.my_bike_id is not null then
    select title into v_my_bike_title from bikes where id = v_proposal.my_bike_id;
  end if;

  v_payer_name := case when v_proposal.cash_direction = 'i_pay' then v_from_name else v_to_name end;

  if v_proposal.my_bike_id is null then
    v_deal_description := 'Cash offer for ' || v_target_bike_title || ' — $' || to_char(v_proposal.cash_amount, 'FM999,999,999') || '.';
  elsif v_proposal.cash_amount = 0 or v_proposal.cash_direction = 'even' then
    v_deal_description := v_my_bike_title || ' ⇄ ' || v_target_bike_title || ' — straight trade, no cash.';
  else
    v_deal_description := v_my_bike_title || ' ⇄ ' || v_target_bike_title || ' — plus $' || to_char(v_proposal.cash_amount, 'FM999,999,999') || ' cash from ' || v_payer_name || '.';
  end if;

  insert into messages (conversation_id, sender_id, message)
  values (v_conversation_id, null, 'It''s a match! ' || v_deal_description);

  return v_conversation_id;
end;
$$;

grant execute on function accept_proposal_and_match(uuid) to authenticated;

-- ── Site feedback (2026-07-24) ──────────────────────────────────────────────
-- Backup log for the homepage feedback form — the form's primary delivery is
-- an email via /api/feedback, this table just means a submission isn't lost
-- if that email ever fails to send. Public can insert (anonymous feedback is
-- fine), but nobody except the project owner (via the Supabase dashboard,
-- which uses the service role and bypasses RLS) can read it back.
create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  contact text,
  created_at timestamptz not null default now()
);

alter table feedback enable row level security;

create policy "anyone can submit feedback" on feedback for insert with check (true);
