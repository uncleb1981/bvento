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

create or replace function mark_trade_complete(p_conversation_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_target_bike_id uuid;
  v_owner_id uuid;
begin
  select c.target_bike_id, b.owner_id
    into v_target_bike_id, v_owner_id
    from conversations c
    join bikes b on b.id = c.target_bike_id
   where c.id = p_conversation_id;

  if v_target_bike_id is null then
    raise exception 'This trade was already completed or the listing was removed.';
  end if;

  if auth.uid() is distinct from v_owner_id then
    raise exception 'Only the listing owner can mark this trade complete.';
  end if;

  update conversations set trade_complete = true where id = p_conversation_id;

  -- This bike can no longer be traded — decline any other still-pending
  -- proposals that reference it, instead of letting the delete below erase
  -- them silently.
  update trade_proposals
     set status = 'declined'
   where (target_bike_id = v_target_bike_id or my_bike_id = v_target_bike_id)
     and status = 'pending';

  delete from bikes where id = v_target_bike_id;
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

  update trade_proposals
     set status = 'declined'
   where (target_bike_id = p_bike_id or my_bike_id = p_bike_id)
     and status = 'pending';

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
