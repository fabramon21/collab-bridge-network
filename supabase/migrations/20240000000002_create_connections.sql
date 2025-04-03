-- Create connections table
create table connections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  connected_user_id uuid references profiles(id) on delete cascade not null,
  status text not null check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, connected_user_id)
);

-- Enable RLS
alter table connections enable row level security;

-- Create policies
create policy "Users can view their own connections."
  on connections for select
  using ( auth.uid() = user_id or auth.uid() = connected_user_id );

create policy "Users can insert their own connection requests."
  on connections for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own connection requests."
  on connections for update
  using ( auth.uid() = user_id or auth.uid() = connected_user_id );

-- Create indexes
create index connections_user_id_idx on connections (user_id);
create index connections_connected_user_id_idx on connections (connected_user_id);
create index connections_status_idx on connections (status); 