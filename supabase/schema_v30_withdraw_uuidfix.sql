-- =====================================================================
--  AHENK — Şema v30 (para çekme uuid düzeltmesi)
--  HATA: request_withdraw içindeki açık uuid_generate_v4() çağrısı,
--  fonksiyonun search_path=public olması yüzünden bulunamıyordu
--  (Supabase'de uuid_generate_v4 'extensions' şemasında).
--  ÇÖZÜM: core gen_random_uuid() (her zaman pg_catalog'da, search_path'ten
--  bağımsız). send_gift zaten bunu kullanıyordu; aynı desene getirildi.
-- =====================================================================

create or replace function request_withdraw(p_user uuid, p_jeton int, p_iban text, p_name text)
returns jsonb as $$
declare
  bal   int;
  rate  numeric := 0.10;
  min_j int := 500;
  amt   numeric;
  pend  int;
  clean_iban text;
begin
  if p_jeton is null or p_jeton < min_j then
    return jsonb_build_object('ok', false, 'error', 'min', 'min', min_j);
  end if;
  clean_iban := upper(regexp_replace(coalesce(p_iban,''), '\s', '', 'g'));
  if length(clean_iban) <> 26 or clean_iban !~ '^TR[0-9]{24}$' then
    return jsonb_build_object('ok', false, 'error', 'iban');
  end if;
  if p_name is null or length(trim(p_name)) < 5 then
    return jsonb_build_object('ok', false, 'error', 'name');
  end if;

  select count(*) into pend from withdrawals where user_id = p_user and status = 'pending';
  if pend > 0 then
    return jsonb_build_object('ok', false, 'error', 'pending');
  end if;

  select coalesce(jeton,0) into bal from profiles where id = p_user for update;
  if bal < p_jeton then
    return jsonb_build_object('ok', false, 'error', 'balance', 'balance', bal);
  end if;

  amt := round(p_jeton * rate, 2);
  update profiles set jeton = jeton - p_jeton where id = p_user;
  insert into jeton_ledger(user_id, key, amount, reason)
    values (p_user, 'withdraw:' || gen_random_uuid()::text, -p_jeton, 'Para çekme talebi');
  insert into withdrawals(user_id, jeton, amount_try, iban, full_name)
    values (p_user, p_jeton, amt, clean_iban, trim(p_name));

  return jsonb_build_object('ok', true, 'amount_try', amt);
end;
$$ language plpgsql security definer set search_path = public;
revoke all on function request_withdraw(uuid, int, text, text) from anon, authenticated;
