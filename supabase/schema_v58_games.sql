-- Ahenk v58 — Oyun lobisi (101 Okey foundation). Masalar + koltuklar + istatistik.
-- Faz 1: sosyal kabuk (masa kur/otur/kalk, canlı koltuklar). Oyun motoru Faz 2.

create table if not exists game_tables (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  host_id     uuid not null references profiles(id) on delete cascade,
  game        text not null default '101',          -- şimdilik 101
  capacity    int  not null default 4,              -- 2 | 3 | 4
  kind        text not null default 'acik',         -- acik | sifreli | vip
  pass_hash   text,                                 -- sifreli masa için (sha256)
  voice       boolean default true,
  video       boolean default false,
  status      text not null default 'bekliyor',     -- bekliyor | oynuyor | bitti
  created_at  timestamptz default now()
);
create index if not exists idx_game_tables_status on game_tables(status, created_at desc);

create table if not exists game_seats (
  table_id  uuid references game_tables(id) on delete cascade,
  seat_no   int not null,
  user_id   uuid references profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (table_id, seat_no),
  unique (table_id, user_id)
);
create index if not exists idx_game_seats_user on game_seats(user_id);

create table if not exists game_stats (
  user_id uuid primary key references profiles(id) on delete cascade,
  games   int default 0,
  wins    int default 0,
  points  int default 0
);

alter table game_tables enable row level security;
alter table game_seats  enable row level security;
alter table game_stats  enable row level security;

-- Masaları herkes görür; oluşturma yalnız sahibi adına.
drop policy if exists p_gt_read on game_tables;
create policy p_gt_read on game_tables for select using (true);
drop policy if exists p_gt_ins on game_tables;
create policy p_gt_ins on game_tables for insert with check (host_id = auth.uid());
drop policy if exists p_gt_upd on game_tables;
create policy p_gt_upd on game_tables for update using (host_id = auth.uid());
drop policy if exists p_gt_del on game_tables;
create policy p_gt_del on game_tables for delete using (host_id = auth.uid());

-- Koltukları herkes görür; kişi yalnız KENDİ koltuğunu açar/kapatır.
drop policy if exists p_gs_read on game_seats;
create policy p_gs_read on game_seats for select using (true);
drop policy if exists p_gs_ins on game_seats;
create policy p_gs_ins on game_seats for insert with check (user_id = auth.uid());
drop policy if exists p_gs_del on game_seats;
create policy p_gs_del on game_seats for delete using (user_id = auth.uid());

-- İstatistik: herkes okur (liderlik); yazma yalnız service_role (RPC).
drop policy if exists p_gst_read on game_stats;
create policy p_gst_read on game_stats for select using (true);

-- Realtime
do $$ begin alter publication supabase_realtime add table game_seats; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table game_tables; exception when duplicate_object then null; end $$;
