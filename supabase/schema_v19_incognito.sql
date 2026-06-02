-- =====================================================================
--  AHENK — Şema v19 (GİZLİ MOD / incognito — premium)
--  ADDITIVE + idempotent. Gizli moddaki kullanıcı profilleri görüntülerken
--  "kim baktı" izi BIRAKMAZ (profile_visits'e yazılmaz). Sunucu-enforce.
-- =====================================================================

alter table profiles add column if not exists incognito boolean not null default false;

create or replace function fn_skip_incognito_visit() returns trigger as $$
begin
  -- Ziyaretçi gizli moddaysa ziyareti hiç kaydetme (insert'i iptal et).
  if exists (select 1 from profiles where id = new.visitor_id and incognito) then
    return null;
  end if;
  return new;
end;
$$ language plpgsql set search_path = public;

drop trigger if exists trg_skip_incognito_visit on profile_visits;
create trigger trg_skip_incognito_visit before insert on profile_visits
  for each row execute function fn_skip_incognito_visit();
