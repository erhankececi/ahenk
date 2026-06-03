-- =====================================================================
--  AHENK — Şema v41 (genel jeton harcama — ücretli görüntülü görüşme vb.)
-- =====================================================================
create or replace function spend_jeton(p_amount int, p_reason text) returns jsonb as $$
declare uid uuid := auth.uid(); bal int;
begin
  if uid is null or p_amount <= 0 then return jsonb_build_object('ok', false, 'error', 'bad'); end if;
  select coalesce(jeton, 0) into bal from profiles where id = uid for update;
  if bal < p_amount then return jsonb_build_object('ok', false, 'error', 'insufficient', 'balance', bal); end if;
  update profiles set jeton = jeton - p_amount where id = uid;
  insert into jeton_ledger(user_id, key, amount, reason)
    values (uid, 'spend:' || gen_random_uuid()::text, -p_amount, p_reason);
  return jsonb_build_object('ok', true, 'balance', bal - p_amount);
end;
$$ language plpgsql security definer set search_path = public;
revoke all on function spend_jeton(int, text) from anon;
grant execute on function spend_jeton(int, text) to authenticated;
