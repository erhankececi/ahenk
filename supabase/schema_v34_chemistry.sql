-- =====================================================================
--  AHENK — Şema v34 (KİMYA / UYUM — chemistry_score)
--  ADDITIVE. Her eşleşmede 0-100 kimya puanı. Mesajlaştıkça artar (trigger),
--  hediye gönderiminde ekstra artar (route). İki taraf da görür (matches satırı).
-- =====================================================================

alter table matches add column if not exists chemistry_score int not null default 0;

-- Her mesajda kimya +2 (tavan 100).
create or replace function fn_bump_chemistry() returns trigger as $$
begin
  update matches set chemistry_score = least(100, coalesce(chemistry_score, 0) + 2)
   where id = new.match_id;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_bump_chemistry on messages;
create trigger trg_bump_chemistry after insert on messages
  for each row execute function fn_bump_chemistry();

-- Kimya ekleme yardımcı RPC (hediye/arama gibi olaylar için, server-only).
create or replace function add_chemistry(p_match uuid, p_amount int) returns void as $$
begin
  update matches set chemistry_score = least(100, greatest(0, coalesce(chemistry_score, 0) + p_amount))
   where id = p_match;
end;
$$ language plpgsql security definer set search_path = public;
revoke all on function add_chemistry(uuid, int) from anon, authenticated;
