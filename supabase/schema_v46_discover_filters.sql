-- =====================================================================
--  AHENK — Şema v46 (Keşfet: YAŞ + DOĞRULANMIŞ filtresi)
--  v35 gövdesi + p_min_age / p_max_age / p_verified. ADDITIVE.
-- =====================================================================

drop function if exists discover_candidates(uuid, int, text[], int, int, text);

create or replace function discover_candidates(
  p_user   uuid,
  p_max_km int     default null,
  p_cities text[]  default null,
  p_limit  int     default 40,
  p_offset int     default 0,
  p_sort   text    default 'smart',
  p_min_age int    default null,
  p_max_age int    default null,
  p_verified boolean default false
) returns table (
  id uuid, name text, birthdate date, gender gender_t, city text,
  profession text, bio text, interests text[], hobbies text[], music text[], movies text[],
  zodiac text, is_verified boolean, activity_score int, behavior_score int, energy_score int,
  vibe text, vibe_at timestamptz, voice_card_path text, last_active timestamptz,
  premium_plan premium_plan, boost_until timestamptz,
  distance_km int, same_city boolean, created_at timestamptz
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
         (pr.city is not null and pr.city = me_city) as same_city,
         pr.created_at
  from profiles pr
  left join city_coords cc on cc.city = pr.city
  where pr.id <> p_user
    and pr.onboarded = true
    and coalesce(pr.banned, false) = false
    and pr.deleted_at is null
    and (not p_verified or coalesce(pr.is_verified, false) = true)
    and (p_min_age is null or pr.birthdate is null or pr.birthdate <= (current_date - (p_min_age || ' years')::interval))
    and (p_max_age is null or pr.birthdate is null or pr.birthdate >= (current_date - ((p_max_age + 1) || ' years')::interval))
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
    case when p_sort = 'near'   then km_between(me_lat, me_lon, coalesce(pr.lat, cc.lat), coalesce(pr.lon, cc.lon)) end asc nulls last,
    case when p_sort = 'active' then pr.last_active end desc,
    case when p_sort = 'new'    then pr.created_at end desc,
    (me_looking is not null and pr.gender = any(me_looking)) desc,
    (pr.city is not null and pr.city = me_city) desc,
    km_between(me_lat, me_lon, coalesce(pr.lat, cc.lat), coalesce(pr.lon, cc.lon)) asc nulls last,
    pr.last_active desc
  limit greatest(1, p_limit) offset greatest(0, p_offset);
end;
$$ language plpgsql security definer set search_path = public stable;
revoke all on function discover_candidates(uuid, int, text[], int, int, text, int, int, boolean) from anon, authenticated;
