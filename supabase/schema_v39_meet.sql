-- =====================================================================
--  AHENK — Şema v39 (GERÇEK BULUŞMA — kahve/yemek/sinema/yürüyüş/müze/konser)
--  Eşleşme sonrası buluşma önerisi → karşı taraf kabul/red. Kabulde kimya artar.
-- =====================================================================

create table if not exists meet_requests (
  id         uuid primary key default uuid_generate_v4(),
  match_id   uuid references matches(id) on delete cascade,
  from_user  uuid references profiles(id) on delete cascade,
  kind       text not null,
  status     text not null default 'bekliyor',  -- bekliyor | kabul | red
  created_at timestamptz default now()
);
create index if not exists idx_meet_match on meet_requests (match_id, created_at desc);

alter table meet_requests enable row level security;
drop policy if exists p_meet_read on meet_requests;
create policy p_meet_read on meet_requests for select using (
  exists (select 1 from matches m where m.id = match_id and (m.user_a = auth.uid() or m.user_b = auth.uid()))
);

create or replace function propose_meet(p_match uuid, p_kind text) returns jsonb as $$
declare uid uuid := auth.uid(); ok boolean;
begin
  if p_kind not in ('kahve','yemek','sinema','yuruyus','muze','konser') then
    return jsonb_build_object('ok', false, 'error', 'bad');
  end if;
  select (m.user_a = uid or m.user_b = uid) into ok from matches m where m.id = p_match;
  if not coalesce(ok, false) then return jsonb_build_object('ok', false, 'error', 'yasak'); end if;
  insert into meet_requests(match_id, from_user, kind) values (p_match, uid, p_kind);
  return jsonb_build_object('ok', true);
end;
$$ language plpgsql security definer set search_path = public;
revoke all on function propose_meet(uuid, text) from anon;
grant execute on function propose_meet(uuid, text) to authenticated;

create or replace function respond_meet(p_match uuid, p_status text) returns jsonb as $$
declare uid uuid := auth.uid(); ok boolean; rid uuid;
begin
  if p_status not in ('kabul','red') then return jsonb_build_object('ok', false, 'error', 'bad'); end if;
  select (m.user_a = uid or m.user_b = uid) into ok from matches m where m.id = p_match;
  if not coalesce(ok, false) then return jsonb_build_object('ok', false, 'error', 'yasak'); end if;
  select id into rid from meet_requests
    where match_id = p_match and status = 'bekliyor' and from_user <> uid
    order by created_at desc limit 1;
  if rid is null then return jsonb_build_object('ok', false, 'error', 'yok'); end if;
  update meet_requests set status = p_status where id = rid;
  if p_status = 'kabul' then perform add_chemistry(p_match, 12); end if;
  return jsonb_build_object('ok', true);
end;
$$ language plpgsql security definer set search_path = public;
revoke all on function respond_meet(uuid, text) from anon;
grant execute on function respond_meet(uuid, text) to authenticated;
