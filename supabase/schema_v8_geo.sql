-- =====================================================================
--  AHENK — Şema v8 (KEŞFET: SQL-seviyesi mesafe/şehir + proximity sıralama)
--  ADDITIVE + idempotent. v7 sonrası. Frontend filtreleme YOK -> SQL'de.
--  GPS (lat/lon) yoksa şehir merkezine (city_coords) düşülür.
-- =====================================================================

-- 1) İl merkez koordinatları (GPS yokken fallback). lib/constants.ts CITIES ile aynı.
create table if not exists city_coords (
  city text primary key,
  lat  double precision not null,
  lon  double precision not null
);

insert into city_coords (city, lat, lon) values
 ('Adana',37.0,35.32),('Adıyaman',37.76,38.28),('Afyonkarahisar',38.76,30.54),
 ('Ağrı',39.72,43.05),('Amasya',40.65,35.83),('Ankara',39.93,32.85),
 ('Antalya',36.9,30.7),('Artvin',41.18,41.82),('Aydın',37.85,27.84),
 ('Balıkesir',39.65,27.88),('Bilecik',40.15,29.98),('Bingöl',38.88,40.5),
 ('Bitlis',38.4,42.11),('Bolu',40.74,31.61),('Burdur',37.72,30.29),
 ('Bursa',40.19,29.06),('Çanakkale',40.15,26.41),('Çankırı',40.6,33.62),
 ('Çorum',40.55,34.95),('Denizli',37.78,29.09),('Diyarbakır',37.91,40.24),
 ('Edirne',41.68,26.56),('Elazığ',38.68,39.22),('Erzincan',39.75,39.5),
 ('Erzurum',39.9,41.27),('Eskişehir',39.78,30.52),('Gaziantep',37.07,37.38),
 ('Giresun',40.91,38.39),('Gümüşhane',40.46,39.48),('Hakkari',37.58,43.74),
 ('Hatay',36.4,36.35),('Isparta',37.76,30.55),('Mersin',36.81,34.64),
 ('İstanbul',41.01,28.98),('İzmir',38.42,27.14),('Kars',40.6,43.1),
 ('Kastamonu',41.39,33.78),('Kayseri',38.73,35.49),('Kırklareli',41.74,27.22),
 ('Kırşehir',39.15,34.16),('Kocaeli',40.85,29.88),('Konya',37.87,32.48),
 ('Kütahya',39.42,29.98),('Malatya',38.35,38.31),('Manisa',38.61,27.43),
 ('Kahramanmaraş',37.58,36.93),('Mardin',37.31,40.74),('Muğla',37.22,28.36),
 ('Muş',38.74,41.49),('Nevşehir',38.62,34.71),('Niğde',37.97,34.68),
 ('Ordu',40.98,37.88),('Rize',41.02,40.52),('Sakarya',40.78,30.4),
 ('Samsun',41.29,36.33),('Siirt',37.93,41.94),('Sinop',42.03,35.15),
 ('Sivas',39.75,37.02),('Tekirdağ',40.98,27.51),('Tokat',40.31,36.55),
 ('Trabzon',41.0,39.72),('Tunceli',39.11,39.55),('Şanlıurfa',37.17,38.79),
 ('Uşak',38.68,29.41),('Van',38.49,43.41),('Yozgat',39.82,34.81),
 ('Zonguldak',41.45,31.79),('Aksaray',38.37,34.03),('Bayburt',40.26,40.22),
 ('Karaman',37.18,33.22),('Kırıkkale',39.85,33.51),('Batman',37.88,41.13),
 ('Şırnak',37.52,42.46),('Bartın',41.64,32.34),('Ardahan',41.11,42.7),
 ('Iğdır',39.92,44.04),('Yalova',40.65,29.28),('Karabük',41.2,32.62),
 ('Kilis',36.72,37.12),('Osmaniye',37.07,36.25),('Düzce',40.84,31.16)
on conflict (city) do update set lat = excluded.lat, lon = excluded.lon;

-- 2) Haversine (km) — SQL, immutable.
create or replace function km_between(lat1 double precision, lon1 double precision,
                                      lat2 double precision, lon2 double precision)
returns int as $$
  select case
    when lat1 is null or lon1 is null or lat2 is null or lon2 is null then null
    else round(6371 * 2 * asin(sqrt(
         power(sin(radians(lat2 - lat1) / 2), 2) +
         cos(radians(lat1)) * cos(radians(lat2)) * power(sin(radians(lon2 - lon1) / 2), 2)
    )))::int
  end;
$$ language sql immutable;

-- 3) Performans indeksleri
create index if not exists idx_profiles_city on profiles (city);
create index if not exists idx_interactions_from on interactions (from_user);

-- 4) Keşfet adayları — SQL-seviyesi filtre + proximity sıralama + sayfalama.
--    Sıra: boost > aynı şehir > mesafe artan > son aktif. lat/lon DÖNMEZ.
create or replace function discover_candidates(
  p_user   uuid,
  p_max_km int     default null,   -- null = Türkiye geneli (mesafe sınırı yok)
  p_cities text[]  default null,   -- null/boş = tüm şehirler
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
    and (me_looking is null or array_length(me_looking, 1) is null or pr.gender = any(me_looking))
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
    (pr.city is not null and pr.city = me_city) desc,
    km_between(me_lat, me_lon, coalesce(pr.lat, cc.lat), coalesce(pr.lon, cc.lon)) asc nulls last,
    pr.last_active desc
  limit greatest(1, p_limit) offset greatest(0, p_offset);
end;
$$ language plpgsql security definer set search_path = public stable;

-- Yalnız server (admin/service_role) çağırır; kullanıcı doğrudan çağıramaz.
revoke all on function discover_candidates(uuid, int, text[], int, int) from anon, authenticated;

-- 5) Toplam eşleşen aday sayısı (UI: "kaç kişi bulundu"). Aynı filtreler.
create or replace function discover_count(p_user uuid, p_max_km int default null, p_cities text[] default null)
returns int as $$
declare me_lat double precision; me_lon double precision; me_looking gender_t[]; n int;
begin
  select coalesce(p.lat, c.lat), coalesce(p.lon, c.lon), p.looking_for
    into me_lat, me_lon, me_looking
  from profiles p left join city_coords c on c.city = p.city where p.id = p_user;

  select count(*) into n
  from profiles pr left join city_coords cc on cc.city = pr.city
  where pr.id <> p_user and pr.onboarded = true
    and (me_looking is null or array_length(me_looking, 1) is null or pr.gender = any(me_looking))
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
