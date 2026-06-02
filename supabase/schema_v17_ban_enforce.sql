-- =====================================================================
--  AHENK — Şema v17 (YASAK ENFORCEMENT — DB seviyesi tam kilit)
--  ADDITIVE + idempotent. Yasaklı kullanıcı geçerli oturumla bile mesaj /
--  etkileşim YAZAMAZ (UI engeli yetmez; API doğrudan çağrılsa da DB reddeder).
-- =====================================================================

create or replace function fn_block_banned() returns trigger as $$
declare uid uuid; isban boolean;
begin
  uid := (row_to_json(new) ->> TG_ARGV[0])::uuid;
  if uid is null then return new; end if;
  select banned into isban from public.profiles where id = uid;
  if coalesce(isban, false) then
    raise exception 'Hesabın askıya alındı.' using errcode = 'check_violation';
  end if;
  return new;
end;
$$ language plpgsql set search_path = public;

drop trigger if exists trg_ban_messages on messages;
create trigger trg_ban_messages before insert on messages
  for each row execute function fn_block_banned('sender_id');

drop trigger if exists trg_ban_interactions on interactions;
create trigger trg_ban_interactions before insert on interactions
  for each row execute function fn_block_banned('from_user');
