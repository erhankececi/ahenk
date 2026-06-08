-- Ahenk v57 — Açık rıza/onay kaydı (KVKK + sözleşme ispatı).
-- Kullanıcının Koşullar+Gizlilik+KVKK+18 onayını zaman+IP ile saklar.
-- "Kullanıcı kabul etti, içerikten kullanıcı sorumlu" zincirinin ispatı.
create table if not exists consents (
  id          bigint generated always as identity primary key,
  user_id     uuid references profiles(id) on delete cascade,
  docs        text not null,         -- ör: 'terms+privacy+kvkk+age18'
  version     text not null,         -- ör: '2026-06-09'
  ip          text,
  accepted_at timestamptz default now()
);
create index if not exists idx_consents_user on consents(user_id, accepted_at desc);

alter table consents enable row level security;
-- Kullanıcı yalnız KENDİ onay kaydını ekleyebilir/okuyabilir; değiştiremez/silemez.
drop policy if exists p_consents_ins on consents;
create policy p_consents_ins on consents for insert with check (auth.uid() = user_id);
drop policy if exists p_consents_sel on consents;
create policy p_consents_sel on consents for select using (auth.uid() = user_id);
