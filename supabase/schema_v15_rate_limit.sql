-- =====================================================================
--  AHENK — Şema v15 (RATE LIMIT — abuse/flood koruması)
--  ADDITIVE + idempotent. İstemciden doğrudan yazılan tablolara (messages,
--  reports, interactions) sunucu-seviyesi hız sınırı. RLS bypass edilemez.
--
--  Generic: trigger argümanları (kullanıcı_kolonu, limit, saniye). Pencere
--  içinde aynı kullanıcının N'den fazla satırı reddedilir.
-- =====================================================================

create or replace function fn_rate_limit() returns trigger as $$
declare
  uid uuid;
  cnt int;
  lim int := TG_ARGV[1]::int;
  secs int := TG_ARGV[2]::int;
begin
  uid := (row_to_json(new) ->> TG_ARGV[0])::uuid;
  if uid is null then
    return new;
  end if;
  execute format(
    'select count(*) from public.%I where %I = $1 and created_at > now() - ($2 || '' seconds'')::interval',
    TG_TABLE_NAME, TG_ARGV[0]
  ) into cnt using uid, secs;
  if cnt >= lim then
    raise exception 'Çok hızlısın, biraz yavaşla.' using errcode = 'check_violation';
  end if;
  return new;
end;
$$ language plpgsql set search_path = public;

-- Mesaj flood: 20 / 10 sn
drop trigger if exists trg_rl_messages on messages;
create trigger trg_rl_messages before insert on messages
  for each row execute function fn_rate_limit('sender_id', '20', '10');

-- Şikayet spam: 5 / saat
drop trigger if exists trg_rl_reports on reports;
create trigger trg_rl_reports before insert on reports
  for each row execute function fn_rate_limit('reporter_id', '5', '3600');

-- Etkileşim flood: 60 / dk
drop trigger if exists trg_rl_interactions on interactions;
create trigger trg_rl_interactions before insert on interactions
  for each row execute function fn_rate_limit('from_user', '60', '60');
