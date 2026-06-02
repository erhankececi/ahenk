-- =====================================================================
--  AHENK — Şema v7 (MAĞAZA ABONELİKLERİ — App Store / Google Play)
--  ADDITIVE + idempotent. v6_store sonrası çalıştır.
--  Receipt doğrulaması RevenueCat'te yapılır; bu katman SAĞLAYICI-BAĞIMSIZ:
--  webhook -> apply_subscription_event() -> subscriptions + profiles.premium_*.
--  Plan eşlemesi: entitlement 'plus' -> plus, 'premium_plus' -> platinum.
-- =====================================================================

-- 1) Abonelik durumu (mağaza aboneliğinin kaydı; profiles türetilmiş entitlement'ı tutar)
create table if not exists subscriptions (
  id              bigint generated always as identity primary key,
  user_id         uuid not null references profiles(id) on delete cascade,
  store           text not null,                 -- 'app_store' | 'play_store' | 'stripe'
  product_id      text not null,                 -- mağaza ürün kimliği
  entitlement     text,                          -- 'plus' | 'premium_plus'
  plan            text not null default 'free',  -- türetilmiş: free | plus | platinum
  status          text not null,                 -- active | cancelled | expired | billing_issue | paused
  period_end      timestamptz,                   -- abonelik bitiş/yenileme zamanı
  environment     text,                          -- 'production' | 'sandbox'
  last_event_id   text,
  last_event_type text,
  raw             jsonb,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  unique (user_id, product_id)
);
create index if not exists idx_subs_user on subscriptions(user_id);

alter table subscriptions enable row level security;
-- Sahibi kendi aboneliğini okur; yazma YOK (yalnız server / service_role / security definer fn).
drop policy if exists p_subs_read on subscriptions;
create policy p_subs_read on subscriptions for select using (auth.uid() = user_id);

-- 2) İşlenen olaylar (idempotency + denetim). İstemci erişimi yok.
create table if not exists subscription_events (
  event_id   text primary key,
  user_id    uuid references profiles(id) on delete set null,
  type       text,
  created_at timestamptz default now(),
  raw        jsonb
);
alter table subscription_events enable row level security;
-- politika yok -> yalnız service_role / security definer fn erişir.

-- 3) Olay uygulama: idempotent; subscriptions upsert + profiles entitlement yazımı.
--    Aktif sayılır: status='active' AND period_end>now AND plan in (plus,platinum).
--    Bitiş/iptal -> yalnız ABONELİK planını free'ye düşür (jeton 'gold' perk'ine dokunma).
create or replace function apply_subscription_event(
  p_user uuid, p_store text, p_product text, p_entitlement text, p_plan text,
  p_status text, p_period_end timestamptz, p_event_id text, p_event_type text,
  p_env text, p_raw jsonb default null
) returns jsonb as $$
declare grants boolean;
begin
  -- idempotency: aynı event iki kez işlenmez
  insert into public.subscription_events(event_id, user_id, type, raw)
  values (p_event_id, p_user, p_event_type, p_raw)
  on conflict (event_id) do nothing;
  if not found then
    return jsonb_build_object('ok', true, 'duplicate', true);
  end if;

  insert into public.subscriptions(user_id, store, product_id, entitlement, plan, status,
                                   period_end, environment, last_event_id, last_event_type, raw, updated_at)
  values (p_user, p_store, p_product, p_entitlement, coalesce(p_plan,'free'), p_status,
          p_period_end, p_env, p_event_id, p_event_type, p_raw, now())
  on conflict (user_id, product_id) do update set
    entitlement = excluded.entitlement, plan = excluded.plan, status = excluded.status,
    period_end = excluded.period_end, environment = excluded.environment,
    last_event_id = excluded.last_event_id, last_event_type = excluded.last_event_type,
    raw = excluded.raw, updated_at = now();

  grants := (p_status = 'active' and p_period_end is not null and p_period_end > now()
             and p_plan in ('plus','platinum'));

  if grants then
    update public.profiles set premium_plan = p_plan::premium_plan, premium_until = p_period_end
      where id = p_user;
  else
    update public.profiles set premium_plan = 'free', premium_until = p_period_end
      where id = p_user and premium_plan in ('plus','platinum');
  end if;

  return jsonb_build_object('ok', true, 'granted', grants, 'plan', coalesce(p_plan,'free'));
end;
$$ language plpgsql security definer set search_path = public;

revoke all on function apply_subscription_event(uuid,text,text,text,text,text,timestamptz,text,text,text,jsonb)
  from anon, authenticated;
