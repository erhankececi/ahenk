-- =====================================================================
--  AHENK — Şema v37 ("Yüz yüze görüştük" onayı → görüşüldü rozeti)
--  İki taraf da onaylarsa güven + kimya artar. Server-only RPC (auth.uid()).
-- =====================================================================

create table if not exists met_confirmations (
  match_id   uuid references matches(id) on delete cascade,
  user_id    uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (match_id, user_id)
);

alter table met_confirmations enable row level security;
drop policy if exists p_met_read on met_confirmations;
create policy p_met_read on met_confirmations for select using (
  exists (select 1 from matches m where m.id = match_id and (m.user_a = auth.uid() or m.user_b = auth.uid()))
);

create or replace function confirm_met(p_match uuid) returns jsonb as $$
declare uid uuid := auth.uid(); cnt int; is_party boolean;
begin
  select (m.user_a = uid or m.user_b = uid) into is_party from matches m where m.id = p_match;
  if not coalesce(is_party, false) then return jsonb_build_object('ok', false, 'error', 'yasak'); end if;
  insert into met_confirmations(match_id, user_id) values (p_match, uid) on conflict do nothing;
  select count(*) into cnt from met_confirmations where match_id = p_match;
  if cnt >= 2 then perform add_chemistry(p_match, 10); end if;
  return jsonb_build_object('ok', true, 'both', cnt >= 2);
end;
$$ language plpgsql security definer set search_path = public;
revoke all on function confirm_met(uuid) from anon;
grant execute on function confirm_met(uuid) to authenticated;
