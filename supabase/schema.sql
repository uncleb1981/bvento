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
  my_bike_id uuid references bikes(id) on delete cascade, -- null = cash-only offer, no bike traded in
  target_bike_id uuid not null references bikes(id) on delete cascade,
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
create policy "users send messages in their conversations" on messages for insert
  with check (
    (sender_id = auth.uid() or sender_id is null)
    and exists (
      select 1 from conversations c
      where c.id = conversation_id and (c.user_1_id = auth.uid() or c.user_2_id = auth.uid())
    )
  );
