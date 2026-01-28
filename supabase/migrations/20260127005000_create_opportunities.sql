-- Opportunities board (separate from events)
create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  location text,
  apply_url text,
  role_type text, -- internship | newgrad | other
  created_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.opportunities enable row level security;

drop policy if exists "opps_select_auth" on public.opportunities;
create policy "opps_select_auth"
  on public.opportunities
  for select
  to authenticated
  using (true);

drop policy if exists "opps_insert_self" on public.opportunities;
create policy "opps_insert_self"
  on public.opportunities
  for insert
  to authenticated
  with check (auth.uid() = creator_id);

drop policy if exists "opps_update_self" on public.opportunities;
create policy "opps_update_self"
  on public.opportunities
  for update
  to authenticated
  using (auth.uid() = creator_id)
  with check (auth.uid() = creator_id);

drop policy if exists "opps_delete_self" on public.opportunities;
create policy "opps_delete_self"
  on public.opportunities
  for delete
  to authenticated
  using (auth.uid() = creator_id);

create index if not exists opportunities_creator_idx on public.opportunities(creator_id);
create index if not exists opportunities_created_at_idx on public.opportunities(created_at desc);
