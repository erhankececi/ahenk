-- =====================================================================
--  AHENK — Şema v18 (PROFİL KOLON KORUMASI + doğrulama alanları)
--  ADDITIVE + idempotent.
--
--  KRİTİK GÜVENLİK: p_profiles_upd RLS'i satır-bazlı (kendi satırını
--  güncelleyebilir) ama KOLON bazlı kısıt yok → kullanıcı kendi
--  premium_plan / jeton / is_verified / banned ... değerlerini PostgREST
--  ile doğrudan değiştirebilir. Bu trigger, hassas kolonların YALNIZ
--  service_role (sunucu/admin/webhook/SECURITY DEFINER RPC) tarafından
--  değiştirilmesine izin verir. authenticated kullanıcı denerse reddedilir.
-- =====================================================================

-- Doğrulama (selfie) akışı alanları — verification_status istemciden yalnız
-- 'pending' yapılabilir; is_verified KORUNUR (sahte rozet engellenir).
alter table profiles add column if not exists verification_status text not null default 'none';
alter table profiles add column if not exists verification_path text;

create or replace function fn_protect_profile_cols() returns trigger as $$
begin
  -- YALNIZ herkese açık PostgREST rolleri (authenticated/anon) kısıtlanır.
  -- Diğer her bağlam ayrıcalıklıdır ve serbesttir:
  --   * service_role (admin client)          → current_user = 'service_role'
  --   * SECURITY DEFINER RPC (award_jeton,    → current_user = fonksiyon sahibi (postgres)
  --     buy_item, apply_subscription_event,
  --     fn_handle_new_user signup trigger…)
  -- Böylece referral/jeton/premium/webhook akışları KIRILMAZ; sadece kullanıcının
  -- kendi profilini doğrudan PATCH'leyip hassas alan değiştirmesi engellenir.
  -- (Trigger SECURITY INVOKER — definer YAPILMAMALI, yoksa current_user hep owner olur.)
  if current_user not in ('authenticated', 'anon') then
    return new;
  end if;

  if new.premium_plan   is distinct from old.premium_plan
  or new.premium_until  is distinct from old.premium_until
  or new.is_verified    is distinct from old.is_verified
  or new.banned         is distinct from old.banned
  or new.banned_at      is distinct from old.banned_at
  or new.jeton          is distinct from old.jeton
  or new.behavior_score is distinct from old.behavior_score
  or new.activity_score is distinct from old.activity_score
  or new.energy_score   is distinct from old.energy_score
  or new.streak_count   is distinct from old.streak_count
  or new.member_no      is distinct from old.member_no
  or new.is_admin       is distinct from old.is_admin
  or new.referred_by    is distinct from old.referred_by
  then
    raise exception 'Bu alan istemciden değiştirilemez.' using errcode = 'insufficient_privilege';
  end if;

  return new;
end;
$$ language plpgsql set search_path = public;

drop trigger if exists trg_protect_profile_cols on profiles;
create trigger trg_protect_profile_cols before update on profiles
  for each row execute function fn_protect_profile_cols();
