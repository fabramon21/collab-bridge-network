-- Ensure messages table has receiver_id column for direct messaging
alter table public.messages
add column if not exists receiver_id uuid references public.profiles(id) on delete cascade;

-- Backfill from any legacy columns if present
do $$
begin
  if exists(select 1 from information_schema.columns where table_name='messages' and column_name='recipient_id') then
    update public.messages
      set receiver_id = coalesce(receiver_id, recipient_id)
      where receiver_id is null;
  end if;
  if exists(select 1 from information_schema.columns where table_name='messages' and column_name='reciver_id') then
    update public.messages
      set receiver_id = coalesce(receiver_id, reciver_id)
      where receiver_id is null;
  end if;
end $$;

-- Recreate policies to reference receiver_id
drop policy if exists "Users can view their own messages." on public.messages;
create policy "Users can view their own messages."
  on public.messages for select
  using ( auth.uid() = sender_id or auth.uid() = receiver_id );

drop policy if exists "Users can insert their own messages." on public.messages;
create policy "Users can insert their own messages."
  on public.messages for insert
  with check ( auth.uid() = sender_id );

drop policy if exists "Users can update their own messages." on public.messages;
create policy "Users can update their own messages."
  on public.messages for update
  using ( auth.uid() = sender_id );

create index if not exists messages_receiver_id_idx on public.messages (receiver_id);
