-- =====================================================================
--  AHENK — Şema v63 (GRANÜLER EVENT TRACKING / analytics)
--  ADDITIVE + idempotent. Aktivasyon/dönüşüm hunisi için hafif event log.
--  KVKK: metadata SADE tutulur (plan/kaynak/anahtar gibi); mesaj içeriği,
--  özel profil detayı veya hassas veri KAYDEDİLMEZ. API tarafında allowlist + sanitize.
-- =====================================================================
create table if not exists public.events (
  id          bigint generated always as identity primary key,
  user_id     uuid references auth.users(id) on delete set null,
  event_name  text not null,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists idx_events_name_time on public.events (event_name, created_at desc);
create index if not exists idx_events_user on public.events (user_id);

alter table public.events enable row level security;

-- Yalnız oturumlu kullanıcı KENDİ adına event ekleyebilir.
drop policy if exists p_events_insert on public.events;
create policy p_events_insert on public.events for insert to authenticated
  with check (user_id = auth.uid());

-- Okuma yok (admin yalnız service_role/admin client ile aggregate okur).
revoke select on public.events from anon, authenticated;
