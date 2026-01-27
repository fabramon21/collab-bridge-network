-- Discussion rooms
create table if not exists public.discussions_rooms (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  tags text[] default '{}'::text[],
  icon text default 'general',
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.discussions_rooms enable row level security;

create policy "rooms_select_auth" on public.discussions_rooms
for select to authenticated using (true);

create policy "rooms_insert_self" on public.discussions_rooms
for insert to authenticated
with check (created_by = auth.uid());

create policy "rooms_update_self" on public.discussions_rooms
for update to authenticated
using (created_by = auth.uid())
with check (created_by = auth.uid());

create policy "rooms_delete_self" on public.discussions_rooms
for delete to authenticated
using (created_by = auth.uid());

create index if not exists discussions_rooms_created_by_idx on public.discussions_rooms(created_by);
create index if not exists discussions_rooms_created_at_idx on public.discussions_rooms(created_at);

-- Discussion messages
create table if not exists public.discussions_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.discussions_rooms(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.discussions_messages enable row level security;

create policy "messages_select_auth" on public.discussions_messages
for select to authenticated using (true);

create policy "messages_insert_self" on public.discussions_messages
for insert to authenticated
with check (sender_id = auth.uid());

create policy "messages_update_self" on public.discussions_messages
for update to authenticated
using (sender_id = auth.uid())
with check (sender_id = auth.uid());

create policy "messages_delete_self" on public.discussions_messages
for delete to authenticated
using (sender_id = auth.uid());

create index if not exists discussions_messages_room_idx on public.discussions_messages(room_id);
create index if not exists discussions_messages_room_created_idx on public.discussions_messages(room_id, created_at);
