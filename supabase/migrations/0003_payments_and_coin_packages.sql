-- =====================================================================
--  Ahenk Live — Faz 4: Jeton paketleri + ödeme kayıtları (iyzico hazır)
--  Uygula: Supabase SQL Editor (0001 ve 0002'den SONRA).
--  Jeton yükleme YALNIZ service-role + credit_coin_order RPC ile (idempotent).
-- =====================================================================

-- ---------- coin_transactions: purchase_credit tipini ekle ----------
alter table public.coin_transactions drop constraint if exists coin_transactions_type_check;
alter table public.coin_transactions add constraint coin_transactions_type_check
  check (type in ('spend_question','spend_priority','teacher_earning','refund','admin_adjustment','purchase_credit'));

-- ---------- tablolar ----------
create table if not exists public.coin_packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  coins integer not null,
  price_try integer not null,
  bonus_coins integer not null default 0,
  badge text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  package_id uuid references public.coin_packages(id),
  provider text not null default 'iyzico',
  provider_conversation_id text unique not null,
  provider_payment_id text,
  status text not null default 'pending' check (status in ('pending','paid','failed','canceled','refunded')),
  amount_try integer not null,
  coins integer not null,
  bonus_coins integer not null default 0,
  total_coins integer not null,
  raw_request jsonb,
  raw_response jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists payment_orders_user_idx on public.payment_orders(user_id, created_at desc);

create table if not exists public.payment_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_id text,
  conversation_id text,
  payment_id text,
  status text,
  payload jsonb not null,
  processed boolean not null default false,
  processing_error text,
  created_at timestamptz not null default now()
);

create trigger trg_coin_packages_updated before update on public.coin_packages for each row execute function public.set_updated_at();
create trigger trg_payment_orders_updated before update on public.payment_orders for each row execute function public.set_updated_at();

-- ---------- varsayılan paketler (yalnız tablo boşsa) ----------
insert into public.coin_packages (name, coins, price_try, bonus_coins, badge, sort_order)
select * from (values
  ('100 Jeton', 100, 49, 0, null::text, 1),
  ('250 Jeton', 250, 99, 0, 'Popüler', 2),
  ('500 Jeton', 500, 179, 0, null::text, 3),
  ('1000 Jeton', 1000, 299, 0, 'En Avantajlı', 4)
) as v(name, coins, price_try, bonus_coins, badge, sort_order)
where not exists (select 1 from public.coin_packages);

-- ---------- RLS ----------
alter table public.coin_packages enable row level security;
alter table public.payment_orders enable row level security;
alter table public.payment_webhook_events enable row level security;

create policy "cp_select_active" on public.coin_packages for select using (active = true or public.is_admin());
create policy "cp_admin_all" on public.coin_packages for all using (public.is_admin()) with check (public.is_admin());

create policy "po_select_own" on public.payment_orders for select using (auth.uid() = user_id);
create policy "po_select_admin" on public.payment_orders for select using (public.is_admin());
create policy "po_insert_own" on public.payment_orders for insert with check (auth.uid() = user_id and status = 'pending');
-- status değişikliği için client UPDATE politikası YOK → sadece service role / RPC.

create policy "pwe_admin_select" on public.payment_webhook_events for select using (public.is_admin());
-- INSERT/UPDATE politikası YOK → sadece service role yazar.

-- =====================================================================
--  Güvenli RPC fonksiyonları
-- =====================================================================

-- ---------- sipariş oluştur (öğrenci) ----------
create or replace function public.create_coin_order(p_package_id uuid)
returns public.payment_orders
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_pkg public.coin_packages%rowtype;
  v_order public.payment_orders;
  v_conv text;
begin
  if v_user is null then raise exception 'Yetkisiz işlem.'; end if;
  if not exists (select 1 from profiles where id = v_user and role = 'student') then
    raise exception 'Sadece öğrenciler jeton satın alabilir.';
  end if;
  select * into v_pkg from coin_packages where id = p_package_id and active = true;
  if not found then raise exception 'Paket bulunamadı.'; end if;

  v_conv := 'al_' || replace(gen_random_uuid()::text, '-', '');
  insert into payment_orders (user_id, package_id, provider, provider_conversation_id, status, amount_try, coins, bonus_coins, total_coins)
  values (v_user, v_pkg.id, 'iyzico', v_conv, 'pending', v_pkg.price_try, v_pkg.coins, v_pkg.bonus_coins, v_pkg.coins + coalesce(v_pkg.bonus_coins, 0))
  returning * into v_order;
  return v_order;
end; $$;

-- ---------- siparişi öde/kredile (YALNIZ service role; idempotent) ----------
create or replace function public.credit_coin_order(
  p_provider_conversation_id text,
  p_provider_payment_id text default null,
  p_payload jsonb default null
) returns public.payment_orders
language plpgsql security definer set search_path = public as $$
declare v_order public.payment_orders;
begin
  select * into v_order from payment_orders where provider_conversation_id = p_provider_conversation_id for update;
  if not found then raise exception 'Sipariş bulunamadı.'; end if;

  -- idempotent: zaten ödenmişse tekrar kredileme yapma
  if v_order.status = 'paid' then
    return v_order;
  end if;
  if v_order.status <> 'pending' then
    raise exception 'Sipariş işlenemez durumda: %', v_order.status;
  end if;

  update student_profiles set coin_balance = coin_balance + v_order.total_coins where user_id = v_order.user_id;

  update payment_orders
    set status = 'paid', paid_at = now(), provider_payment_id = p_provider_payment_id, raw_response = p_payload
    where id = v_order.id
    returning * into v_order;

  insert into coin_transactions (user_id, question_id, amount, type, description)
  values (v_order.user_id, null, v_order.total_coins, 'purchase_credit', 'Jeton paketi satın alımı');

  return v_order;
end; $$;

-- credit_coin_order yalnız service role ile çağrılabilir
revoke execute on function public.credit_coin_order(text, text, jsonb) from public, anon, authenticated;
grant execute on function public.credit_coin_order(text, text, jsonb) to service_role;
