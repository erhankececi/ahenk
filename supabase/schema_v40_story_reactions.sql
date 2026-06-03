-- =====================================================================
--  AHENK — Şema v40 (Stories etkileşimleri — beğeni/emoji)
--  Görüntülemeler story_views'da (mevcut). Tepkiler yeni story_reactions'da.
--  Sahip, izleyen+tepkileri /api/stories/viewers (admin) ile görür.
-- =====================================================================

create table if not exists story_reactions (
  story_id   uuid references stories(id) on delete cascade,
  user_id    uuid references profiles(id) on delete cascade,
  emoji      text not null,
  created_at timestamptz default now(),
  primary key (story_id, user_id)
);
create index if not exists idx_story_react on story_reactions (story_id);

alter table story_reactions enable row level security;
drop policy if exists p_sr_rw on story_reactions;
create policy p_sr_rw on story_reactions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
