-- =====================================================================
--  AHENK — Şema v38 (ziyaret sayacı — Premium Plus "kim tekrar baktı")
--  profile_visits.visit_count + record_visit RPC (artımlı upsert).
-- =====================================================================

alter table profile_visits add column if not exists visit_count int not null default 1;

create or replace function record_visit(p_visited uuid) returns void as $$
declare uid uuid := auth.uid();
begin
  if uid is null or uid = p_visited then return; end if;
  insert into profile_visits(visitor_id, visited_id, visited_at, visit_count)
    values (uid, p_visited, now(), 1)
  on conflict (visitor_id, visited_id)
    do update set visited_at = now(), visit_count = profile_visits.visit_count + 1;
end;
$$ language plpgsql security definer set search_path = public;
revoke all on function record_visit(uuid) from anon;
grant execute on function record_visit(uuid) to authenticated;
