-- =====================================================================
--  AHENK — Şema v20 (PUSH BİLDİRİM abonelikleri)
--  ADDITIVE + idempotent. Web (VAPID/WebPush) + native (FCM/APNs token).
--  Kullanıcı kendi aboneliklerini yazar/siler; sunucu (service_role) gönderim
--  için tümünü okur.
-- =====================================================================

create table if not exists push_subscriptions (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references profiles(id) on delete cascade,
  endpoint   text not null,             -- web: push endpoint URL · native: FCM/APNs token
  p256dh     text,                       -- web only
  auth       text,                       -- web only
  platform   text not null default 'web',-- 'web' | 'ios' | 'android'
  created_at timestamptz default now(),
  unique (endpoint)
);
create index if not exists idx_push_sub_user on push_subscriptions (user_id);

alter table push_subscriptions enable row level security;
drop policy if exists p_push_rw on push_subscriptions;
create policy p_push_rw on push_subscriptions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
