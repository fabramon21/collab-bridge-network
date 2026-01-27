-- Fix duplicate housing policy error when rerunning migrations
-- Drop and recreate the read policy so db push is idempotent

drop policy if exists "read housing listings" on public.housing_listings;

create policy "read housing listings"
on public.housing_listings
for select
to authenticated
using (true);
