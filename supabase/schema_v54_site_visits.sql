-- Ahenk v54 — Site ziyaret kaydı (kaç kişi siteye girdi — saatlik/günlük/aylık).
-- Anonim dahil. Insert yalnız sunucudan (service_role, /api/track); okuma yalnız admin API.
create table if not exists site_visits (
  id         bigint generated always as identity primary key,
  user_id    uuid references profiles(id) on delete set null,
  path       text,
  ref        text,        -- referrer / kaynak
  created_at timestamptz default now()
);
create index if not exists idx_site_visits_created on site_visits(created_at);

alter table site_visits enable row level security;
-- Politika yok → yalnız service_role (admin client) erişir. anon/authenticated göremez/yazamaz.
