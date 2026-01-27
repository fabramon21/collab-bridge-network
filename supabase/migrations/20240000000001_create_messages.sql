-- Create messages table
create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references profiles(id) on delete cascade not null,
  receiver_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  read_at timestamp with time zone
);

-- Enable RLS
alter table messages enable row level security;

-- Create policies
drop policy if exists "Users can view their own messages." on messages;
create policy "Users can view their own messages."
  on messages for select
  using ( auth.uid() = sender_id or auth.uid() = receiver_id );

drop policy if exists "Users can insert their own messages." on messages;
create policy "Users can insert their own messages."
  on messages for insert
  with check ( auth.uid() = sender_id );

drop policy if exists "Users can update their own messages." on messages;
create policy "Users can update their own messages."
  on messages for update
  using ( auth.uid() = sender_id );

-- Create indexes
create index messages_sender_id_idx on messages (sender_id);
create index messages_receiver_id_idx on messages (receiver_id);
create index messages_created_at_idx on messages (created_at); 
