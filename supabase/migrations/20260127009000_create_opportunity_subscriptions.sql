-- Create subscription table for opportunity alerts
create table if not exists public.opportunity_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  email text not null,
  categories text[] not null default '{}',
  created_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.opportunity_subscriptions enable row level security;

drop policy if exists "subs_select_own" on public.opportunity_subscriptions;
create policy "subs_select_own"
  on public.opportunity_subscriptions
  for select
  using (auth.uid() = user_id or user_id is null);

drop policy if exists "subs_insert_self" on public.opportunity_subscriptions;
create policy "subs_insert_self"
  on public.opportunity_subscriptions
  for insert
  with check (auth.uid() = user_id or user_id is null);

create index if not exists opportunity_subscriptions_email_idx on public.opportunity_subscriptions(email);
