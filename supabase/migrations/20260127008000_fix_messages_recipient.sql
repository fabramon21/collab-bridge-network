-- Ensure recipient_id column exists and policies use it
alter table public.messages
add column if not exists recipient_id uuid references public.profiles(id) on delete cascade;

-- Backfill from receiver_id if present
update public.messages
set recipient_id = coalesce(recipient_id, receiver_id)
where recipient_id is null;

-- Align RLS policies to recipient_id
drop policy if exists "Users can view their own messages." on public.messages;
create policy "Users can view their own messages."
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

drop policy if exists "Users can insert their own messages." on public.messages;
create policy "Users can insert their own messages."
  on public.messages for insert
  with check (auth.uid() = sender_id);

drop policy if exists "Users can update their own messages." on public.messages;
create policy "Users can update their own messages."
  on public.messages for update
  using (auth.uid() = sender_id);

create index if not exists messages_recipient_id_idx on public.messages(recipient_id);
