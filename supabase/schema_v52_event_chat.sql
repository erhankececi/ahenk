-- Ahenk v52 — Etkinlik sohbet odası. Her etkinliğin kendi sohbeti; yalnız
-- organizatör + RSVP veren katılımcılar okur/yazar.
create table if not exists event_messages (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references events(id) on delete cascade,
  sender_id  uuid not null references profiles(id) on delete cascade,
  body       text not null,
  created_at timestamptz default now()
);
create index if not exists idx_event_messages_event on event_messages(event_id, created_at);

alter table event_messages enable row level security;

-- katılımcı mı? (organizatör veya RSVP veren)
create or replace function fn_is_event_member(p_event uuid, p_user uuid) returns boolean as $$
  select exists(select 1 from events e where e.id = p_event and e.host_id = p_user)
      or exists(select 1 from event_requests r where r.event_id = p_event and r.user_id = p_user);
$$ language sql stable security definer set search_path = public;

drop policy if exists p_evmsg_read on event_messages;
create policy p_evmsg_read on event_messages for select
  using (fn_is_event_member(event_id, auth.uid()));

drop policy if exists p_evmsg_send on event_messages;
create policy p_evmsg_send on event_messages for insert
  with check (sender_id = auth.uid() and fn_is_event_member(event_id, auth.uid()));

-- Realtime
do $$ begin
  alter publication supabase_realtime add table event_messages;
exception when duplicate_object then null; end $$;
