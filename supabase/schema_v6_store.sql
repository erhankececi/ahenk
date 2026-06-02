-- =====================================================================
--  AHENK — Şema v6 (JETON MAĞAZASI — harcama tarafı)
--  ADDITIVE + idempotent. v5_jeton sonrası çalıştır.
--  Jeton harcanarak: Profil Boost (24s), 1 Gün Premium, 1 Hafta Premium.
-- =====================================================================

-- Boost: aktifken kullanıcı diğerlerinin keşfinde en üstte çıkar (discover route okur).
alter table profiles add column if not exists boost_until timestamptz;

-- Atomik satın alma: bakiye kontrolü + düş + defter kaydı (negatif) + etki uygulama.
-- security definer + server-only (anon/authenticated execute edemez; API admin client ile çağırır).
create or replace function buy_item(p_user uuid, p_item text)
returns jsonb as $$
declare cur int; cost int; lbl text;
begin
  cost := case p_item
            when 'boost'        then 200
            when 'premium_day'  then 300
            when 'premium_week' then 1500
            else null end;
  lbl := case p_item
            when 'boost'        then 'Profil Boost (24 saat)'
            when 'premium_day'  then '1 Gün Premium'
            when 'premium_week' then '1 Hafta Premium'
            else null end;
  if cost is null then
    return jsonb_build_object('ok', false, 'error', 'bad_item');
  end if;

  -- satırı kilitle (eşzamanlı çift harcama yarışını önler)
  select coalesce(jeton, 0) into cur from public.profiles where id = p_user for update;
  if cur is null then
    return jsonb_build_object('ok', false, 'error', 'no_user');
  end if;
  if cur < cost then
    return jsonb_build_object('ok', false, 'error', 'insufficient', 'balance', cur, 'cost', cost);
  end if;

  update public.profiles set jeton = jeton - cost where id = p_user;
  insert into public.jeton_ledger(user_id, key, amount, reason)
  values (p_user, 'buy:' || p_item || ':' || gen_random_uuid()::text, -cost, lbl);

  if p_item = 'boost' then
    update public.profiles
      set boost_until = greatest(coalesce(boost_until, now()), now()) + interval '24 hours'
      where id = p_user;
  elsif p_item = 'premium_day' then
    update public.profiles
      set premium_plan  = case when premium_plan = 'free' then 'gold'::premium_plan else premium_plan end,
          premium_until = greatest(coalesce(premium_until, now()), now()) + interval '1 day'
      where id = p_user;
  elsif p_item = 'premium_week' then
    update public.profiles
      set premium_plan  = case when premium_plan = 'free' then 'gold'::premium_plan else premium_plan end,
          premium_until = greatest(coalesce(premium_until, now()), now()) + interval '7 days'
      where id = p_user;
  end if;

  return jsonb_build_object('ok', true, 'balance', cur - cost, 'item', p_item, 'spent', cost);
end;
$$ language plpgsql security definer set search_path = public;

revoke all on function buy_item(uuid, text) from anon, authenticated;
