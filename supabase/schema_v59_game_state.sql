-- Ahenk v59 — Oyun durumu (sunucu-otoriter). Gizli el içerdiği için yalnız
-- service_role erişir; istemci /api/games/state ile yalnız kendi elini görür.
create table if not exists game_state (
  table_id   uuid primary key references game_tables(id) on delete cascade,
  state      jsonb not null,
  updated_at timestamptz default now()
);
alter table game_state enable row level security;
-- Politika yok → yalnız service_role.
