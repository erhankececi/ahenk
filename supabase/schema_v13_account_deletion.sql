-- =====================================================================
--  AHENK — Şema v13 (HESAP SİLME — App Store 5.1.1(v) / Google Play / KVKK)
--  ADDITIVE + idempotent. v12 sonrası. Supabase SQL Editor'da çalıştır.
--
--  MODEL:
--   * profiles.id -> auth.users(id) ON DELETE CASCADE (schema.sql).
--   * Tüm kullanıcı tabloları -> profiles(id) ON DELETE CASCADE.
--     => auth.users satırını silmek TÜM bağlı veriyi (photos, matches,
--        messages, moments, stories, calls, jeton_ledger, subscriptions,
--        blocks, reports, notifications, referrals, activity_log, ...) siler.
--   * İSTİSNALAR (ON DELETE SET NULL, silmeyi engellemez):
--       - subscription_events.user_id  (raw JSONB kullanıcı id'si içerir)
--       - profiles.referred_by         (başka kullanıcıya işaret, PII değil)
--     subscription_events bu fonksiyonda AÇIKÇA silinir (KVKK: artık PII kalmaz).
--   * STORAGE (photos/previews/media/voice) SQL cascade ile silinmez;
--     uygulama tarafında temizlenir -> app/api/account/delete + lib/storage.ts
--     (purgeUserStorage). Burada SADECE veritabanı + auth silinir.
-- =====================================================================

-- ---------------------------------------------------------------------
--  delete_account: oturum sahibinin tüm DB verisini + auth kaydını atomik,
--  GERİ DÖNÜŞSÜZ siler. YALNIZ sunucu (service_role / security definer) çağırır;
--  çağrılmadan ÖNCE API katmanı sahipliği (auth.getUser) doğrular ve kendi
--  id'sini geçirir. p_user istemciden ASLA alınmaz.
-- ---------------------------------------------------------------------
create or replace function delete_account(p_user uuid)
returns jsonb as $$
begin
  if p_user is null then
    return jsonb_build_object('ok', false, 'error', 'no_user');
  end if;

  -- 1) Artık PII bırakmamak için set-null denetim kayıtlarını da temizle.
  delete from public.subscription_events where user_id = p_user;

  -- 2) Ana silme: auth.users -> profiles (cascade) -> tüm bağlı satırlar
  --    + auth.identities/sessions/refresh_tokens (auth şeması cascade).
  delete from auth.users where id = p_user;

  return jsonb_build_object('ok', true);
end;
$$ language plpgsql security definer set search_path = public;

-- Normal kullanıcı bu fonksiyonu çağırıp hesap silemesin (yalnız server).
revoke all on function delete_account(uuid) from anon, authenticated;
