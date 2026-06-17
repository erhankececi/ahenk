-- =====================================================================
--  AHENK — Şema v62 (BİLDİRİM TERCİHLERİ)
--  ADDITIVE + idempotent. profiles.notif_prefs jsonb — kullanıcı hangi
--  bildirimleri istediğini saklar. Eksik anahtar = AÇIK (opt-out modeli).
--  Örn: { "daily": false } → günlük soru hatırlatması kapalı.
--  notif_prefs guard listesinde DEĞİL → kullanıcı kendi tercihini PATCH'leyebilir.
-- =====================================================================
alter table public.profiles
  add column if not exists notif_prefs jsonb not null default '{}'::jsonb;
