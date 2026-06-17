-- =====================================================================
--  AHENK — Şema v63 (GRANÜLER EVENT TRACKING / analytics)
--  ADDITIVE + idempotent. NOT: "events" tablosu ETKİNLİKLER için kullanımda;
--  analitik için ayrı tablo: analytics_events.
--  KVKK: metadata SADE (plan/kaynak/anahtar); mesaj içeriği / hassas veri YOK.
-- =====================================================================
create table if not exists public.analytics_events (
  id          bigint generated always as identity primary key,
  user_id     uuid references auth.users(id) on delete set null,
  event_name  text not null,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists idx_analytics_events_name_time on public.analytics_events (event_name, created_at desc);
create index if not exists idx_analytics_events_user on public.analytics_events (user_id);

alter table public.analytics_events enable row level security;

-- Yalnız oturumlu kullanıcı KENDİ adına event ekleyebilir.
drop policy if exists p_analytics_events_insert on public.analytics_events;
create policy p_analytics_events_insert on public.analytics_events for insert to authenticated
  with check (user_id = auth.uid());

-- Okuma yok (admin yalnız service_role/admin client ile aggregate okur).
revoke select on public.analytics_events from anon, authenticated;
