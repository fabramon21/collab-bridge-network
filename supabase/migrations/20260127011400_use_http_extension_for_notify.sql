-- Use http extension (not pg_net) for opportunity email webhook
create extension if not exists http;

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

  perform http_post(
      current_setting('supabase.edge_functions_url', true) || '/opportunity-email',
      jsonb_build_object(
        'record', to_jsonb(new),
        'subscribers', coalesce(subs, '[]'::jsonb),
        'category', new.category
      )::text,
      'application/json',
      null,
      ARRAY[
        http_header('Authorization', 'Bearer ' || current_setting('supabase.service_role_key', true)),
        http_header('Content-Type', 'application/json')
      ]
    );
  return new;
end;
$$;

drop trigger if exists trg_opportunity_email on public.opportunities;
create trigger trg_opportunity_email
after insert on public.opportunities
for each row execute procedure public.notify_new_opportunity();
