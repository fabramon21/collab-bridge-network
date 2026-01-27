create table if not exists public.connections (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.connections enable row level security;

create policy if not exists "connections_select_auth"
on public.connections for select
to authenticated
using (true);

create policy if not exists "connections_insert_self"
on public.connections for insert
to authenticated
with check (sender_id = auth.uid());

create policy if not exists "connections_update_self"
on public.connections for update
to authenticated
using (sender_id = auth.uid() or recipient_id = auth.uid())
with check (sender_id = auth.uid() or recipient_id = auth.uid());

create policy if not exists "connections_delete_self"
on public.connections for delete
to authenticated
using (sender_id = auth.uid() or recipient_id = auth.uid());

create index if not exists connections_sender_idx on public.connections(sender_id);
create index if not exists connections_recipient_idx on public.connections(recipient_id);
create index if not exists connections_status_idx on public.connections(status);
