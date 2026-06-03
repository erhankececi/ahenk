-- =====================================================================
--  AHENK — Şema v28 (PARA ÇEKME — cash-out, admin onaylı manuel ödeme)
--  ADDITIVE + idempotent.
--  GÜVENLİK/HUKUK: otomatik payout YOK. Kullanıcı talep eder, jetonu
--  anında düşülür (çift-çekim engeli), admin KYC+IBAN inceleyip öder
--  veya reddeder (red = jeton iadesi). Kur ve min eşik sunucuda sabit.
-- =====================================================================

-- Çekim oranı: 1 jeton = 0.10 TL (satış fiyatının altında — arbitraj engeli).
-- Min çekim: 500 jeton (50 TL). Aynı anda yalnız 1 bekleyen talep.

create table if not exists withdrawals (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references profiles(id) on delete cascade,
  jeton        int  not null,
  amount_try   numeric(10,2) not null,
  iban         text not null,
  full_name    text not null,
  status       text not null default 'pending',   -- pending | paid | rejected
  note         text,
  created_at   timestamptz default now(),
  processed_at timestamptz
);
create index if not exists idx_withdraw_status on withdrawals (status, created_at);
create index if not exists idx_withdraw_user on withdrawals (user_id, created_at desc);

alter table withdrawals enable row level security;
drop policy if exists p_withdraw_read on withdrawals;
create policy p_withdraw_read on withdrawals for select using (auth.uid() = user_id);
-- Yazma yalnız sunucu (security definer fn / service_role).

-- ---- Talep oluştur (atomik): bakiye düş + defter + talep satırı ----
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
    values (p_user, 'withdraw:' || uuid_generate_v4()::text, -p_jeton, 'Para çekme talebi');
  insert into withdrawals(user_id, jeton, amount_try, iban, full_name)
    values (p_user, p_jeton, amt, clean_iban, trim(p_name));

  return jsonb_build_object('ok', true, 'amount_try', amt);
end;
$$ language plpgsql security definer set search_path = public;
revoke all on function request_withdraw(uuid, int, text, text) from anon, authenticated;

-- ---- Admin işle: paid (ödendi) | rejected (iade) ----
create or replace function process_withdraw(p_id uuid, p_status text, p_note text default null)
returns jsonb as $$
declare w withdrawals;
begin
  if p_status not in ('paid', 'rejected') then
    return jsonb_build_object('ok', false, 'error', 'status');
  end if;
  select * into w from withdrawals where id = p_id for update;
  if not found then return jsonb_build_object('ok', false, 'error', 'notfound'); end if;
  if w.status <> 'pending' then return jsonb_build_object('ok', false, 'error', 'done'); end if;

  if p_status = 'rejected' then
    update profiles set jeton = coalesce(jeton,0) + w.jeton where id = w.user_id;
    insert into jeton_ledger(user_id, key, amount, reason)
      values (w.user_id, 'withdraw_refund:' || w.id::text, w.jeton, 'Para çekme reddedildi — jeton iadesi');
  end if;

  update withdrawals set status = p_status, note = p_note, processed_at = now() where id = p_id;
  return jsonb_build_object('ok', true);
end;
$$ language plpgsql security definer set search_path = public;
revoke all on function process_withdraw(uuid, text, text) from anon, authenticated;
