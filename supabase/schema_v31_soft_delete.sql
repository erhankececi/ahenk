-- =====================================================================
--  AHENK — Şema v31 (HESAP SOFT-DELETE + geri yükleme)
--  Hesap KALICI silinmez: profiles.deleted_at işaretlenir. Tüm veriler
--  (profil, mesaj, eşleşme, foto…) korunur. Kullanıcı erişimi kapanır ve
--  keşfette görünmez. Admin veya kullanıcının kendisi geri yükleyebilir.
--  Kalıcı silme yalnız admin'in açık talebiyle (delete_account RPC) yapılır.
-- =====================================================================

alter table profiles add column if not exists deleted_at timestamptz;
create index if not exists idx_profiles_deleted on profiles (deleted_at) where deleted_at is not null;

-- ---- Soft delete: kullanıcı kendi hesabını siler (veriler korunur) ----
create or replace function soft_delete_account(p_user uuid) returns jsonb as $$
begin
  update profiles set deleted_at = now() where id = p_user and deleted_at is null;
  return jsonb_build_object('ok', true);
end;
$$ language plpgsql security definer set search_path = public;
revoke all on function soft_delete_account(uuid) from anon, authenticated;

-- ---- Geri yükle: admin veya kullanıcının kendisi ----
create or replace function restore_account(p_user uuid) returns jsonb as $$
begin
  update profiles set deleted_at = null where id = p_user;
  return jsonb_build_object('ok', true);
end;
$$ language plpgsql security definer set search_path = public;
revoke all on function restore_account(uuid) from anon, authenticated;

-- =====================================================================
--  Keşfet: silinmiş hesapları da hariç tut (banned gibi).
--  (v22 gövdesi + 'and pr.deleted_at is null')
-- =====================================================================
create or replace function discover_candidates(
  p_user   uuid,
  p_max_km int     default null,
  p_cities text[]  default null,
  p_limit  int     default 40,
  p_offset int     default 0
) returns table (
  id uuid, name text, birthdate date, gender gender_t, city text,
  profession text, bio text, interests text[], hobbies text[], music text[], movies text[],
  zodiac text, is_verified boolean, activity_score int, behavior_score int, energy_score int,
  vibe text, vibe_at timestamptz, voice_card_path text, last_active timestamptz,
  premium_plan premium_plan, boost_until timestamptz,
  distance_km int, same_city boolean
) as $$
declare me_lat double precision; me_lon double precision; me_city text; me_looking gender_t[];
begin
  select coalesce(p.lat, c.lat), coalesce(p.lon, c.lon), p.city, p.looking_for
    into me_lat, me_lon, me_city, me_looking
  from profiles p left join city_coords c on c.city = p.city
  where p.id = p_user;

  return query
  select pr.id, pr.name, pr.birthdate, pr.gender, pr.city, pr.profession, pr.bio,
         pr.interests, pr.hobbies, pr.music, pr.movies, pr.zodiac, pr.is_verified,
         pr.activity_score, pr.behavior_score, pr.energy_score, pr.vibe, pr.vibe_at,
         pr.voice_card_path, pr.last_active, pr.premium_plan, pr.boost_until,
         km_between(me_lat, me_lon, coalesce(pr.lat, cc.lat), coalesce(pr.lon, cc.lon)) as distance_km,
         (pr.city is not null and pr.city = me_city) as same_city
  from profiles pr
  left join city_coords cc on cc.city = pr.city
  where pr.id <> p_user
    and pr.onboarded = true
    and coalesce(pr.banned, false) = false
    and pr.deleted_at is null
    and not exists (select 1 from interactions i where i.from_user = p_user and i.to_user = pr.id)
    and not exists (select 1 from blocks b
                    where (b.blocker_id = p_user and b.blocked_id = pr.id)
                       or (b.blocker_id = pr.id and b.blocked_id = p_user))
    and (p_cities is null or array_length(p_cities, 1) is null or pr.city = any(p_cities))
    and (
      p_max_km is null or me_lat is null
      or km_between(me_lat, me_lon, coalesce(pr.lat, cc.lat), coalesce(pr.lon, cc.lon)) <= p_max_km
    )
  order by
    (pr.boost_until is not null and pr.boost_until > now()) desc,
    (me_looking is not null and pr.gender = any(me_looking)) desc,
    (pr.city is not null and pr.city = me_city) desc,
    km_between(me_lat, me_lon, coalesce(pr.lat, cc.lat), coalesce(pr.lon, cc.lon)) asc nulls last,
    pr.last_active desc
  limit greatest(1, p_limit) offset greatest(0, p_offset);
end;
$$ language plpgsql security definer set search_path = public stable;
revoke all on function discover_candidates(uuid, int, text[], int, int) from anon, authenticated;

create or replace function discover_count(p_user uuid, p_max_km int default null, p_cities text[] default null)
returns int as $$
declare me_lat double precision; me_lon double precision; n int;
begin
  select coalesce(p.lat, c.lat), coalesce(p.lon, c.lon)
    into me_lat, me_lon
  from profiles p left join city_coords c on c.city = p.city where p.id = p_user;

  select count(*) into n
  from profiles pr left join city_coords cc on cc.city = pr.city
  where pr.id <> p_user and pr.onboarded = true
    and coalesce(pr.banned, false) = false
    and pr.deleted_at is null
    and not exists (select 1 from interactions i where i.from_user = p_user and i.to_user = pr.id)
    and not exists (select 1 from blocks b
                    where (b.blocker_id = p_user and b.blocked_id = pr.id)
                       or (b.blocker_id = pr.id and b.blocked_id = p_user))
    and (p_cities is null or array_length(p_cities, 1) is null or pr.city = any(p_cities))
    and (p_max_km is null or me_lat is null
         or km_between(me_lat, me_lon, coalesce(pr.lat, cc.lat), coalesce(pr.lon, cc.lon)) <= p_max_km);
  return n;
end;
$$ language plpgsql security definer set search_path = public stable;
revoke all on function discover_count(uuid, int, text[]) from anon, authenticated;
