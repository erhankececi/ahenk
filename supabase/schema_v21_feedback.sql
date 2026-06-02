-- =====================================================================
--  AHENK — Şema v21 (ÖNERİ / GERİ BİLDİRİM kutusu)
--  ADDITIVE + idempotent. Kullanıcı öneri/geri bildirim yazar; admin okur.
-- =====================================================================

create table if not exists feedback (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references profiles(id) on delete set null,
  message    text not null,
  handled    boolean not null default false,
  created_at timestamptz default now()
);
create index if not exists idx_feedback_open on feedback (handled, created_at desc);

alter table feedback enable row level security;
-- Kullanıcı yalnız KENDİ adına yazar; okuma yok (admin service_role ile okur).
drop policy if exists p_feedback_insert on feedback;
create policy p_feedback_insert on feedback for insert
  with check (auth.uid() = user_id);

-- Flood koruması: 5 / saat (generic fn_rate_limit — v15).
drop trigger if exists trg_rl_feedback on feedback;
create trigger trg_rl_feedback before insert on feedback
  for each row execute function fn_rate_limit('user_id', '5', '3600');
