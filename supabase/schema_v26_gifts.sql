-- =====================================================================
--  AHENK — Şema v26 (HEDİYE / BAHŞİŞ — kullanıcı kazancı, SUGO modeli)
--  ADDITIVE + idempotent. Kullanıcı jetonla hediye gönderir; ALICI hediyenin
--  %70'ini jeton olarak KAZANIR (%30 platform payı). Gerçek para değil → yasal
--  sorun yok; jeton satışından gelir + güçlü etkileşim.
-- =====================================================================

create table if not exists gift_sends (
  id         uuid primary key default uuid_generate_v4(),
  from_user  uuid references profiles(id) on delete set null,
  to_user    uuid references profiles(id) on delete cascade,
  gift_key   text not null,
  jeton      int  not null,        -- gönderenin ödediği
  earned     int  not null default 0, -- alıcının kazandığı (%70)
  created_at timestamptz default now()
);
create index if not exists idx_gift_to on gift_sends (to_user);
create index if not exists idx_gift_from on gift_sends (from_user);

alter table gift_sends enable row level security;
drop policy if exists p_gift_read on gift_sends;
create policy p_gift_read on gift_sends for select
  using (auth.uid() = from_user or auth.uid() = to_user);

-- Atomik hediye: gönderenden düş, alıcıya %70 ekle, defter + kayıt. Server-only.
create or replace function send_gift(p_from uuid, p_to uuid, p_gift text) returns jsonb as $$
declare cost int; lbl text; bal int; earn int;
begin
  cost := case p_gift
    when 'ates'  then 10  when 'gul'   then 20  when 'kalp' then 50
    when 'elmas' then 150 when 'tac'   then 500 else null end;
  lbl := case p_gift
    when 'ates'  then 'Ateş 🔥' when 'gul'  then 'Gül 🌹' when 'kalp' then 'Kalp 💖'
    when 'elmas' then 'Elmas 💎' when 'tac' then 'Taç 👑' else null end;
  if cost is null then return jsonb_build_object('ok', false, 'error', 'bad_gift'); end if;
  if p_from = p_to then return jsonb_build_object('ok', false, 'error', 'self'); end if;

  select coalesce(jeton, 0) into bal from profiles where id = p_from for update;
  if bal < cost then
    return jsonb_build_object('ok', false, 'error', 'insufficient', 'cost', cost, 'balance', bal);
  end if;

  earn := floor(cost * 0.7);
  update profiles set jeton = jeton - cost where id = p_from;
  update profiles set jeton = jeton + earn where id = p_to;
  insert into jeton_ledger(user_id, key, amount, reason) values
    (p_from, 'gift_out:' || gen_random_uuid()::text, -cost, lbl || ' gönderildi'),
    (p_to,   'gift_in:'  || gen_random_uuid()::text,  earn, lbl || ' alındı (hediye kazancı)');
  insert into gift_sends(from_user, to_user, gift_key, jeton, earned)
    values (p_from, p_to, p_gift, cost, earn);

  return jsonb_build_object('ok', true, 'cost', cost, 'earned', earn, 'label', lbl);
end;
$$ language plpgsql security definer set search_path = public;
revoke all on function send_gift(uuid, uuid, text) from anon, authenticated;
