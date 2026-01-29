-- Clean out any legacy triggers/functions for opportunity notifications
drop trigger if exists trg_opportunity_email on public.opportunities;
drop function if exists public.notify_new_opportunity;
