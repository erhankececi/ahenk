-- =====================================================================
--  AHENK — Şema v3 (Retention + Viral büyüme)
--  ADDITIVE: mevcut tabloları/akışları bozmaz. schema.sql ve schema_v2.sql
--  çalıştırıldıktan sonra bunu çalıştır.
-- =====================================================================

-- ---------- profiles: streak + referans kolonları ----------
alter table profiles add column if not exists streak_count   int default 0;
alter table profiles add column if not exists streak_last     date;
alter table profiles add column if not exists referral_code   text;
alter table profiles add column if not exists referred_by     uuid references profiles(id) on delete set null;

create unique index if not exists idx_profiles_refcode on profiles (referral_code)
  where referral_code is not null;

-- ---------- davet / referans kayıtları ----------
create table if not exists referrals (
  id          uuid primary key default uuid_generate_v4(),
  referrer_id uuid not null references profiles(id) on delete cascade,
  referred_id uuid references profiles(id) on delete cascade,
  code        text not null,
  rewarded    boolean default false,
  created_at  timestamptz default now(),
  unique (referrer_id, referred_id)
);
create index if not exists idx_referrals_referrer on referrals (referrer_id);

alter table referrals enable row level security;
drop policy if exists p_referrals_read on referrals;
create policy p_referrals_read on referrals for select
  using (auth.uid() = referrer_id or auth.uid() = referred_id);
drop policy if exists p_referrals_write on referrals;
create policy p_referrals_write on referrals for insert
  with check (auth.uid() = referrer_id);

-- ---------- günlük aktivite logu (DAU/streak/retention analitiği) ----------
create table if not exists activity_log (
  user_id    uuid not null references profiles(id) on delete cascade,
  day        date not null default current_date,
  events     int  default 1,
  primary key (user_id, day)
);

alter table activity_log enable row level security;
drop policy if exists p_activity_rw on activity_log;
create policy p_activity_rw on activity_log for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
