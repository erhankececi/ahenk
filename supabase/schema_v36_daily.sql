-- =====================================================================
--  AHENK — Şema v36 (GÜNÜN SORUSU — günlük etkileşim)
--  Kullanıcı her gün bir soruyu yanıtlar, jeton kazanır (award_jeton, idempotent).
-- =====================================================================

create table if not exists daily_answers (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references profiles(id) on delete cascade,
  day        date not null,
  answer     text,
  created_at timestamptz default now(),
  unique (user_id, day)
);
create index if not exists idx_daily_user on daily_answers (user_id, day desc);

alter table daily_answers enable row level security;
drop policy if exists p_daily_rw on daily_answers;
create policy p_daily_rw on daily_answers for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
