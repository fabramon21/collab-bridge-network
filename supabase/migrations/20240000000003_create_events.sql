-- Create events table
create table events (
  id uuid default gen_random_uuid() primary key,
  creator_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text,
  event_type text not null check (event_type in ('social', 'roommate', 'professional')),
  location text,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  max_participants integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create event_participants table
create table event_participants (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references events(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  status text not null check (status in ('interested', 'attending', 'not_attending')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(event_id, user_id)
);

-- Enable RLS
alter table events enable row level security;
alter table event_participants enable row level security;

-- Create policies for events
create policy "Events are viewable by everyone."
  on events for select
  using ( true );

create policy "Users can create events."
  on events for insert
  with check ( auth.uid() = creator_id );

create policy "Users can update their own events."
  on events for update
  using ( auth.uid() = creator_id );

-- Create policies for event_participants
create policy "Event participants are viewable by everyone."
  on event_participants for select
  using ( true );

create policy "Users can manage their own event participation."
  on event_participants for all
  using ( auth.uid() = user_id );

-- Create indexes
create index events_creator_id_idx on events (creator_id);
create index events_event_type_idx on events (event_type);
create index events_start_time_idx on events (start_time);
create index event_participants_event_id_idx on event_participants (event_id);
create index event_participants_user_id_idx on event_participants (user_id); 