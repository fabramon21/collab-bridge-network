-- Recreate notify trigger now that http extension is ensured
create or replace function public.notify_new_opportunity()
returns trigger
language plpgsql
as $$
declare
  subs json;
begin
  select json_agg(json_build_object('email', email)) into subs
  from public.opportunity_subscriptions s
  where cardinality(categories) = 0
     or exists (select 1 from unnest(s.categories) c where c = new.category);

  perform
    net.http_post(
      url := current_setting('supabase.edge_functions_url', true) || '/opportunity-email',
      headers := json_build_object(
        'Content-Type','application/json',
        'Authorization','Bearer ' || current_setting('supabase.service_role_key', true)
      ),
      body := json_build_object(
        'record', to_json(new),
        'subscribers', subs,
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
