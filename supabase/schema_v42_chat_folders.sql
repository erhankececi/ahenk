-- =====================================================================
--  AHENK — Şema v42 (sohbet durumu: arşiv / gizli klasör + PIN)
--  Her kullanıcı KENDİ görünümünü yönetir (chat_states). Gizli klasör PIN'le açılır.
-- =====================================================================

create table if not exists chat_states (
  user_id    uuid references profiles(id) on delete cascade,
  match_id   uuid references matches(id) on delete cascade,
  state      text not null default 'normal',  -- normal | archived | hidden | deleted
  updated_at timestamptz default now(),
  primary key (user_id, match_id)
);

alter table chat_states enable row level security;
drop policy if exists p_cs_rw on chat_states;
create policy p_cs_rw on chat_states for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Gizli klasör PIN'i (server tarafında hash'lenir).
alter table profiles add column if not exists chat_pin_hash text;
