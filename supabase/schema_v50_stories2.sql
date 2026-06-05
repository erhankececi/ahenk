-- =====================================================================
--  AHENK — Şema v50 (Hikayeler 2.0: arşiv + kalıcı highlights)
--  - stories.archived: kullanıcı erken arşivleyebilir
--  - Süresi dolan hikaye SİLİNMEZ → arşivde kalır (sadece sahibi görür)
--  - highlights + highlight_items: profilde kalıcı hikaye baloncukları
-- =====================================================================

alter table stories add column if not exists archived boolean default false;

-- Kalıcı koleksiyonlar (Instagram Highlights)
create table if not exists highlights (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  title      text not null,
  cover_path text,
  created_at timestamptz default now()
);
create index if not exists idx_highlights_user on highlights(user_id, created_at desc);

create table if not exists highlight_items (
  highlight_id uuid references highlights(id) on delete cascade,
  story_id     uuid references stories(id) on delete cascade,
  position     int default 0,
  primary key (highlight_id, story_id)
);

alter table highlights enable row level security;
alter table highlight_items enable row level security;

-- Herkes highlight'ları görebilir (profilde gösterilir); sadece sahibi yazar.
drop policy if exists p_hl_read on highlights;
create policy p_hl_read on highlights for select using (true);
drop policy if exists p_hl_write on highlights;
create policy p_hl_write on highlights for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists p_hli_read on highlight_items;
create policy p_hli_read on highlight_items for select using (true);
drop policy if exists p_hli_write on highlight_items;
create policy p_hli_write on highlight_items for all
  using (exists (select 1 from highlights h where h.id = highlight_id and h.user_id = auth.uid()))
  with check (exists (select 1 from highlights h where h.id = highlight_id and h.user_id = auth.uid()));

-- Süresi dolan hikaye artık SİLİNMEZ (arşive düşer). Sadece çok eski (1 yıl+)
-- ve hiçbir highlight'ta olmayanları temizle. Moments aynı kalır.
create or replace function cleanup_expired() returns void as $$
begin
  delete from stories s
   where s.created_at < now() - interval '365 days'
     and not exists (select 1 from highlight_items hi where hi.story_id = s.id);
  delete from moments where expires_at < now() and highlighted = false and coalesce(archived,false) = false;
end;
$$ language plpgsql security definer set search_path = public;
