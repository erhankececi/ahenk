-- =====================================================================
--  AHENK — Şema v4 (GÜVENLİK & MAHREMİYET sertleştirme — KVKK/GDPR beta)
--  ADDITIVE + politika revizyonu. schema.sql, _v2, _v3 sonrası çalıştır.
--  Idempotent. P0 düzeltmeleri:
--   1) Foto: photos bucket PRIVATE + signed URL; public 'previews' (blur) bucket.
--   2) Profil veri ayrıştırması: base 'profiles' SELECT owner-only,
--      güvenli 'profiles_card' view (lat/lon ve hassas alanlar HARİÇ).
--   3) RLS sızıntı kapatma.
-- =====================================================================

-- ---------------------------------------------------------------------
--  1) FOTO: önizleme kolonu + bucket gizliliği
-- ---------------------------------------------------------------------
alter table photos add column if not exists preview_path text;

-- Orijinal fotoğraflar artık PRIVATE (yalnız signed URL ile sunulur)
update storage.buckets set public = false where id = 'photos';

-- Güvenli, düşük çözünürlüklü BULANIK önizleme kovası (public ama tanınmaz)
insert into storage.buckets (id, name, public)
values ('previews','previews', true)
on conflict (id) do update set public = true;

-- photos: PUBLIC okuma politikasını kaldır -> yalnız SAHİBİ okuyabilir.
-- (Eşleşmiş kullanıcının orijinaline erişim sunucuda service_role signed URL ile,
--  RLS'i bypass ederek, are_matched yetki kontrolünden sonra verilir.)
drop policy if exists s_photos_read on storage.objects;
create policy s_photos_read on storage.objects for select
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);

-- photos yazma/silme yalnız sahibi (idempotent yeniden tanım)
drop policy if exists s_photos_write on storage.objects;
create policy s_photos_write on storage.objects for insert
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists s_photos_del on storage.objects;
create policy s_photos_del on storage.objects for delete
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);

-- previews: herkes (giriş yapan) okur, sahibi yazar/siler
drop policy if exists s_prev_read on storage.objects;
create policy s_prev_read on storage.objects for select
  using (bucket_id = 'previews');
drop policy if exists s_prev_write on storage.objects;
create policy s_prev_write on storage.objects for insert
  with check (bucket_id = 'previews' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists s_prev_del on storage.objects;
create policy s_prev_del on storage.objects for delete
  using (bucket_id = 'previews' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------------------------------------------------------------------
--  2) PROFİL VERİ AYRIŞTIRMASI
--     base 'profiles': SELECT yalnız SAHİBİ (tüm kolonlar dahil)
--     'profiles_card' view: diğer kullanıcıların görebileceği GÜVENLİ alt küme
--     (lat/lon, birthdate, behavior/fraud_score, premium, referral,
--      streak, looking_for, is_admin, hidden_mode HARİÇ)
-- ---------------------------------------------------------------------
drop policy if exists p_profiles_read on profiles;
create policy p_profiles_read on profiles for select
  using (auth.uid() = id);
-- update politikası (owner) schema.sql'den aynen geçerli: p_profiles_upd

-- drop+create (create-or-replace view kolon çıkaramaz; v9 tier eklediği için
-- bu göç tekrar çalışınca çakışmasın diye önce düşürülür).
drop view if exists profiles_card;
create view profiles_card as
  select
    id, name, gender, city, profession, bio,
    interests, hobbies, music, movies, languages, zodiac, smoking, pets,
    is_verified, activity_score, energy_score,
    vibe, vibe_at, voice_card_path, onboarded, last_active,
    case when birthdate is null then null
         else date_part('year', age(birthdate))::int end as age
  from profiles;

-- View, sahibi (postgres) yetkisiyle çalışır -> RLS'i bypass eder ve yalnız
-- yukarıdaki güvenli kolonları açar. Erişimi yalnız giriş yapan role ver.
-- security_invoker AÇIKÇA false: Supabase/PG default'u değişse bile view sahibi
-- yetkisiyle çalışmaya devam etsin (true olsaydı profiles owner-only RLS'i
-- uygulanır, başka kullanıcının kartı boş dönerdi -> isimler kırılırdı).
alter view profiles_card set (security_invoker = false);
revoke all on profiles_card from anon;
grant select on profiles_card to authenticated;

-- ---------------------------------------------------------------------
--  3) RLS SIZINTI KAPATMA (diğer tablolar)
-- ---------------------------------------------------------------------

-- ziyaret kaydını ziyaret edilen okuyabiliyordu; ziyaretçi kimliği premium
-- UI'da gösterilir. Yazma yalnız ziyaretçi (schema.sql ile uyumlu, teyit).
drop policy if exists p_visits_read on profile_visits;
create policy p_visits_read on profile_visits for select
  using (auth.uid() = visited_id or auth.uid() = visitor_id);

-- moment_ai_tags: herkese açık INSERT (with check true) -> yalnız moment sahibi
-- kendi momentine etiket ekleyebilsin (spam/etiket kirliliği önlenir).
drop policy if exists p_mt_write on moment_ai_tags;
create policy p_mt_write on moment_ai_tags for insert
  with check (auth.uid() = (select user_id from moments mo where mo.id = moment_id));

-- match_icebreakers: INSERT (with check true) -> yalnız eşleşmenin tarafı yazsın.
drop policy if exists p_ice_write on match_icebreakers;
create policy p_ice_write on match_icebreakers for insert
  with check (exists(select 1 from matches m where m.id = match_id
               and (m.user_a = auth.uid() or m.user_b = auth.uid())));

-- ---------------------------------------------------------------------
--  4) PHOTOS TABLO METADATA SIZINTISI KAPATMA
--     schema.sql'deki p_photos_read 'using (true)' idi -> herhangi bir
--     authenticated kullanıcı BAŞKASININ foto satırını (path/preview_path)
--     okuyabiliyordu. İçerik private bucket ile korunsa da yol/metadata
--     sızıyordu. Artık SELECT yalnız SAHİBİ. Cross-user foto okumaları
--     (keşif, sohbet) zaten service_role/admin client ile RLS bypass ederek
--     yapılıyor; bu değişiklik hiçbir ekranı kırmaz.
-- ---------------------------------------------------------------------
drop policy if exists p_photos_read on photos;
create policy p_photos_read on photos for select
  using (auth.uid() = user_id);

-- =====================================================================
--  NOT (kodla birlikte geçerli):
--   * Diğer kullanıcıların profili artık yalnız 'profiles_card' üzerinden
--     (lat/lon ASLA dönmez). Keşif mesafesi sunucuda service_role ile
--     hesaplanıp yalnız 'mesafe' (km) olarak döner.
--   * Keşifte foto = PUBLIC 'previews' (bulanık varyant). Orijinal yalnız
--     eşleşme + reveal_level=100 olunca service_role signed URL ile.
--   * photos tablosundaki 'path' okunabilir kalır ama private bucket +
--     signed URL nedeniyle içerik erişimi yetkisiz mümkün değildir.
-- =====================================================================
