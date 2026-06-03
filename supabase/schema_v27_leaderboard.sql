-- =====================================================================
--  AHENK — Şema v27 (LİDERLİK — en çok hediye kazananlar + davet edenler)
--  ADDITIVE + idempotent. Server (admin) ile çağrılır.
-- =====================================================================

create or replace function top_gift_earners(p_limit int default 10)
returns table (id uuid, name text, total int) as $$
  select g.to_user as id, p.name, sum(g.earned)::int as total
  from gift_sends g join profiles p on p.id = g.to_user
  group by g.to_user, p.name
  order by total desc
  limit greatest(1, p_limit);
$$ language sql security definer set search_path = public stable;
revoke all on function top_gift_earners(int) from anon, authenticated;

create or replace function top_inviters(p_limit int default 10)
returns table (id uuid, name text, davet int) as $$
  select p.referred_by as id, pp.name, count(*)::int as davet
  from profiles p join profiles pp on pp.id = p.referred_by
  where p.referred_by is not null
  group by p.referred_by, pp.name
  order by davet desc
  limit greatest(1, p_limit);
$$ language sql security definer set search_path = public stable;
revoke all on function top_inviters(int) from anon, authenticated;
