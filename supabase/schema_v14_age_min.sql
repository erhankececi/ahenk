-- =====================================================================
--  AHENK — Şema v14 (18+ YAŞ ALT SINIRI — sunucu enforcement)
--  ADDITIVE + idempotent. Onboarding client gating'inin DB karşılığı:
--  doğum tarihi 18 yıldan yeni olan insert/update reddedilir (defense in depth).
--  Not: trigger yalnız yeni yazımlarda çalışır; mevcut satırlar doğrulanmaz.
--  (Eski adı schema_v13_age_min.sql idi; v13 hesap-silmeye verildi → v14'e taşındı.)
-- =====================================================================

create or replace function fn_enforce_min_age() returns trigger as $$
begin
  if new.birthdate is not null
     and new.birthdate > (current_date - interval '18 years') then
    raise exception 'Ahenk 18 yaş ve üzeri içindir (yaş sınırı).'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$ language plpgsql set search_path = public;

-- Yalnız birthdate yazıldığında çalışır (diğer kolon güncellemeleri etkilenmez).
drop trigger if exists trg_enforce_min_age on profiles;
create trigger trg_enforce_min_age
  before insert or update of birthdate on profiles
  for each row execute function fn_enforce_min_age();
