-- Ensure pg_net is available
create extension if not exists pg_net;

-- Recreate notify function using net.http_post (pg_net) with correct argument types
create or replace function public.notify_new_opportunity()
returns trigger
language plpgsql
as $$
declare
  subs jsonb;
begin
  select jsonb_agg(jsonb_build_object('email', email)) into subs
  from public.opportunity_subscriptions s
  where cardinality(categories) = 0
     or exists (select 1 from unnest(s.categories) c where c = new.category);

  perform net.http_post(
      url := current_setting('supabase.edge_functions_url', true) || '/opportunity-email',
      headers := jsonb_build_object(
        'Content-Type','application/json',
        'Authorization','Bearer ' || current_setting('supabase.service_role_key', true)
      ),
      body := jsonb_build_object(
        'record', to_jsonb(new),
        'subscribers', coalesce(subs, '[]'::jsonb),
        'category', new.category
      )::text
    );
  return new;
end;
$$;

drop trigger if exists trg_opportunity_email on public.opportunities;
create trigger trg_opportunity_email
after insert on public.opportunities
for each row execute procedure public.notify_new_opportunity();
