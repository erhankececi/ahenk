-- =====================================================================
--  AHENK — Şema v44 (Moments 2.0 — albüm/carousel + yönetim + yorumlar)
-- =====================================================================

-- Albüm/carousel medyaları (bir moment'e birden çok foto/video)
create table if not exists moment_media (
  id         uuid primary key default uuid_generate_v4(),
  moment_id  uuid references moments(id) on delete cascade,
  type       text not null,          -- 'photo' | 'video'
  media_path text not null,
  position   int default 0
);
create index if not exists idx_moment_media on moment_media (moment_id, position);
alter table moment_media enable row level security;
drop policy if exists p_mm_read on moment_media;
create policy p_mm_read on moment_media for select using (auth.role() = 'authenticated');
drop policy if exists p_mm_write on moment_media;
create policy p_mm_write on moment_media for all
  using (auth.uid() = (select user_id from moments m where m.id = moment_id))
  with check (auth.uid() = (select user_id from moments m where m.id = moment_id));

-- Paylaşım yönetimi
alter table moments add column if not exists archived boolean default false;
alter table moments add column if not exists comments_off boolean default false;
alter table moments add column if not exists gifts_off boolean default false;

-- Yorumlar: yanıt + sabitleme + beğeni
alter table moment_comments add column if not exists parent_id uuid references moment_comments(id) on delete cascade;
alter table moment_comments add column if not exists pinned boolean default false;

create table if not exists moment_comment_likes (
  comment_id uuid references moment_comments(id) on delete cascade,
  user_id    uuid references profiles(id) on delete cascade,
  primary key (comment_id, user_id)
);
alter table moment_comment_likes enable row level security;
drop policy if exists p_mcl_rw on moment_comment_likes;
create policy p_mcl_rw on moment_comment_likes for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
