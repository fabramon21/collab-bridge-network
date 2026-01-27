-- Notifications table to surface connection acceptance and housing contact events
-- Run with: supabase db push (or deploy via your CI)

-- Ensure UUID generation is available
create extension if not exists "pgcrypto";

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  type text not null,
  content text not null,
  related_id uuid,
  is_read boolean not null default false,
  created_at timestamptz not null default timezone('utc'::text, now())
);

-- RLS
alter table public.notifications enable row level security;

-- Policies
create policy "Users can view their notifications"
  on public.notifications
  for select
  using (auth.uid() = user_id);

create policy "Users can mark their notifications read"
  on public.notifications
  for update
  using (auth.uid() = user_id);

-- Allow any authenticated user to insert a notification (app logic chooses target user)
create policy "Any authenticated user can create notifications"
  on public.notifications
  for insert
  with check (auth.role() = 'authenticated');

-- Helpful indexes
create index if not exists notifications_user_id_idx on public.notifications(user_id);
create index if not exists notifications_created_at_idx on public.notifications(created_at desc);
