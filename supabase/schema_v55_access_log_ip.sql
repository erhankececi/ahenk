-- Ahenk v55 — Yasal erişim logu (5651/KVKK): IP + kullanıcı + zaman.
-- site_visits'e IP eklenir; talep halinde adli makamlara trafik logu verilebilir.
alter table site_visits add column if not exists ip text;
create index if not exists idx_site_visits_user on site_visits(user_id, created_at desc);
-- Not: erişim hâlâ yalnız service_role (admin API). anon/authenticated göremez.
