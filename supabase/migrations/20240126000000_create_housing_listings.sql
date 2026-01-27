-- Create housing listings table
create table if not exists public.housing_listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,

  title text not null,
  description text not null,
  location text not null,
  price integer not null,

  move_in_date date,
  bedrooms integer,
  bathrooms numeric,

  image_urls text[] not null default '{}'::text[],
  is_available boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.housing_listings enable row level security;

-- Read: any logged-in user can view listings
drop policy if exists "read housing listings" on public.housing_listings;
create policy "read housing listings"
on public.housing_listings
for select
to authenticated
using (true);

-- Insert: users can only create listings they own
drop policy if exists "create own housing listings" on public.housing_listings;
create policy "create own housing listings"
on public.housing_listings
for insert
to authenticated
with check (owner_id = auth.uid());

-- Update: users can only update their own listings
drop policy if exists "update own housing listings" on public.housing_listings;
create policy "update own housing listings"
on public.housing_listings
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

-- Delete: users can only delete their own listings
drop policy if exists "delete own housing listings" on public.housing_listings;
create policy "delete own housing listings"
on public.housing_listings
for delete
to authenticated
using (owner_id = auth.uid());
