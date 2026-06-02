-- =====================================================================
--  AHENK — Şema v2 (YENİ ÖZELLİKLER, additive — mevcut şemayı bozmaz)
--  schema.sql çalıştırıldıktan SONRA bunu SQL Editor'da çalıştır.
--  Idempotent: tekrar çalıştırılabilir.
-- =====================================================================

-- ---------- profiles'a yeni kolonlar ----------
alter table profiles add column if not exists vibe            text;
alter table profiles add column if not exists vibe_at         timestamptz;
alter table profiles add column if not exists voice_card_path text;
alter table profiles add column if not exists energy_score    int default 50;
alter table profiles add column if not exists fraud_score     int default 0;

-- Premium Plus seviyesi (mevcut enum'a değer ekle)
alter type premium_plan add value if not exists 'platinum';
-- LEGEND seviyesi (Premium Plus üstü, en üst paket). Erken eklenir ki sonraki
-- göçler (start_call, profiles_card) güvenle 'legend' enum değerini kullanabilsin.
alter type premium_plan add value if not exists 'legend';

-- ---------- yeni enum tipleri ----------
do $$ begin
  create type story_t      as enum ('photo','video','text');
  create type event_t      as enum ('kahve','yuruyus','film','konser','diger');
  create type req_status_t  as enum ('bekliyor','kabul','red');
  create type mod_status_t  as enum ('acik','temiz','engelli');
  create type moment_t      as enum ('photo','video','text','photo_text');
  create type moment_react_t as enum ('begen','ilginc','kaydet');
exception when duplicate_object then null; end $$;

-- =====================================================================
--  1) HİKAYELER (24 saat)
-- =====================================================================
create table if not exists stories (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  type        story_t not null,
  media_path  text,
  text        text,
  created_at  timestamptz default now(),
  expires_at  timestamptz default now() + interval '24 hours'
);
create index if not exists idx_stories_user on stories (user_id, created_at desc);
create index if not exists idx_stories_exp on stories (expires_at);

create table if not exists story_views (
  story_id  uuid references stories(id) on delete cascade,
  viewer_id uuid references profiles(id) on delete cascade,
  viewed_at timestamptz default now(),
  primary key (story_id, viewer_id)
);

-- =====================================================================
--  2) ETKİNLİKLER + KATILIM İSTEKLERİ
-- =====================================================================
create table if not exists events (
  id          uuid primary key default uuid_generate_v4(),
  host_id     uuid not null references profiles(id) on delete cascade,
  title       text not null,
  type        event_t default 'diger',
  description text,
  city        text,
  lat         double precision,
  lon         double precision,
  starts_at   timestamptz,
  created_at  timestamptz default now()
);
create index if not exists idx_events_geo on events (lat, lon);

create table if not exists event_requests (
  id         uuid primary key default uuid_generate_v4(),
  event_id   uuid references events(id) on delete cascade,
  user_id    uuid references profiles(id) on delete cascade,
  status     req_status_t default 'bekliyor',
  created_at timestamptz default now(),
  unique (event_id, user_id)
);

-- =====================================================================
--  3) MODERASYON KUYRUĞU (sahte hesap / yüksek risk)
-- =====================================================================
create table if not exists moderation_queue (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references profiles(id) on delete cascade,
  risk_score int not null,
  reasons    jsonb default '[]',
  status     mod_status_t default 'acik',
  created_at timestamptz default now(),
  unique (user_id)
);

-- =====================================================================
--  4) BUZ KIRICI SORULAR (eşleşme başına)
-- =====================================================================
create table if not exists match_icebreakers (
  match_id   uuid primary key references matches(id) on delete cascade,
  questions  text[] not null,
  created_at timestamptz default now()
);

-- =====================================================================
--  5) MOMENTS (canlı anlar, 24 saat)
-- =====================================================================
create table if not exists moments (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  type        moment_t not null,
  media_path  text,
  text        text,
  highlighted boolean default false,           -- premium öne çıkarma
  created_at  timestamptz default now(),
  expires_at  timestamptz default now() + interval '24 hours'
);
create index if not exists idx_moments_feed on moments (expires_at desc, created_at desc);
create index if not exists idx_moments_user on moments (user_id);

create table if not exists moment_views (
  moment_id uuid references moments(id) on delete cascade,
  viewer_id uuid references profiles(id) on delete cascade,
  viewed_at timestamptz default now(),
  primary key (moment_id, viewer_id)
);

create table if not exists moment_reactions (
  moment_id  uuid references moments(id) on delete cascade,
  user_id    uuid references profiles(id) on delete cascade,
  type       moment_react_t not null,
  created_at timestamptz default now(),
  primary key (moment_id, user_id, type)
);

create table if not exists moment_comments (
  id         uuid primary key default uuid_generate_v4(),
  moment_id  uuid references moments(id) on delete cascade,
  user_id    uuid references profiles(id) on delete cascade,
  text       text not null,
  created_at timestamptz default now()
);

create table if not exists moment_ai_tags (
  moment_id uuid references moments(id) on delete cascade,
  tag       text not null,
  primary key (moment_id, tag)
);

-- =====================================================================
--  6) AFFINITIES (moment tepkisi -> keşifte daha sık gösterim)
-- =====================================================================
create table if not exists affinities (
  user_a uuid references profiles(id) on delete cascade,
  user_b uuid references profiles(id) on delete cascade,
  score  int default 0,
  primary key (user_a, user_b)
);

-- moment tepkisi gelince ortak ilgi/affinity puanını artır
create or replace function fn_moment_affinity() returns trigger as $$
declare owner uuid;
begin
  select user_id into owner from moments where id = new.moment_id;
  if owner is not null and owner <> new.user_id then
    insert into affinities (user_a, user_b, score) values (new.user_id, owner, 5)
      on conflict (user_a, user_b) do update set score = affinities.score + 5;
    insert into affinities (user_a, user_b, score) values (owner, new.user_id, 5)
      on conflict (user_a, user_b) do update set score = affinities.score + 5;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_moment_affinity on moment_reactions;
create trigger trg_moment_affinity after insert on moment_reactions
  for each row execute function fn_moment_affinity();

-- =====================================================================
--  RLS
-- =====================================================================
alter table stories          enable row level security;
alter table story_views      enable row level security;
alter table events           enable row level security;
alter table event_requests   enable row level security;
alter table match_icebreakers enable row level security;
alter table moments          enable row level security;
alter table moment_views     enable row level security;
alter table moment_reactions enable row level security;
alter table moment_comments  enable row level security;
alter table moment_ai_tags   enable row level security;
alter table affinities       enable row level security;
alter table moderation_queue enable row level security;

-- Hikayeler: giriş yapan okur, sahibi yazar
drop policy if exists p_stories_read on stories;
create policy p_stories_read on stories for select using (auth.role() = 'authenticated');
drop policy if exists p_stories_write on stories;
create policy p_stories_write on stories for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists p_sv_rw on story_views;
create policy p_sv_rw on story_views for all
  using (auth.uid() = viewer_id) with check (auth.uid() = viewer_id);

-- Etkinlikler: herkes okur, host yazar; istekler: kullanıcı kendi isteğini, host görür
drop policy if exists p_events_read on events;
create policy p_events_read on events for select using (auth.role() = 'authenticated');
drop policy if exists p_events_write on events;
create policy p_events_write on events for all
  using (auth.uid() = host_id) with check (auth.uid() = host_id);

drop policy if exists p_er_read on event_requests;
create policy p_er_read on event_requests for select
  using (auth.uid() = user_id or auth.uid() = (select host_id from events e where e.id = event_id));
drop policy if exists p_er_write on event_requests;
create policy p_er_write on event_requests for insert with check (auth.uid() = user_id);
drop policy if exists p_er_upd on event_requests;
create policy p_er_upd on event_requests for update
  using (auth.uid() = (select host_id from events e where e.id = event_id));

-- Icebreakers: eşleşmenin tarafları okur; sunucu (security definer) yazar
drop policy if exists p_ice_read on match_icebreakers;
create policy p_ice_read on match_icebreakers for select
  using (exists(select 1 from matches m where m.id = match_id
               and (m.user_a = auth.uid() or m.user_b = auth.uid())));
drop policy if exists p_ice_write on match_icebreakers;
create policy p_ice_write on match_icebreakers for insert with check (true);

-- Moments: giriş yapan okur, sahibi yazar
drop policy if exists p_moments_read on moments;
create policy p_moments_read on moments for select using (auth.role() = 'authenticated');
drop policy if exists p_moments_write on moments;
create policy p_moments_write on moments for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists p_mv_rw on moment_views;
create policy p_mv_rw on moment_views for all
  using (auth.uid() = viewer_id) with check (auth.uid() = viewer_id);
-- moment sahibi kendi momentinin görüntüleyenlerini görebilsin (premium UI'da filtre)
drop policy if exists p_mv_owner_read on moment_views;
create policy p_mv_owner_read on moment_views for select
  using (auth.uid() = (select user_id from moments mo where mo.id = moment_id));

drop policy if exists p_mr_rw on moment_reactions;
create policy p_mr_rw on moment_reactions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists p_mr_owner_read on moment_reactions;
create policy p_mr_owner_read on moment_reactions for select
  using (auth.uid() = (select user_id from moments mo where mo.id = moment_id));

drop policy if exists p_mc_read on moment_comments;
create policy p_mc_read on moment_comments for select using (auth.role() = 'authenticated');
drop policy if exists p_mc_write on moment_comments;
create policy p_mc_write on moment_comments for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists p_mt_read on moment_ai_tags;
create policy p_mt_read on moment_ai_tags for select using (true);
drop policy if exists p_mt_write on moment_ai_tags;
create policy p_mt_write on moment_ai_tags for insert with check (true);

drop policy if exists p_aff_read on affinities;
create policy p_aff_read on affinities for select using (auth.uid() = user_a);

drop policy if exists p_modq_read on moderation_queue;
create policy p_modq_read on moderation_queue for select using (false); -- sadece service_role (admin)

-- =====================================================================
--  STORAGE: public 'media' kovası (ses kartı, story, moment medyası)
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('media','media', true)
on conflict (id) do nothing;

drop policy if exists s_media_read on storage.objects;
create policy s_media_read on storage.objects for select using (bucket_id = 'media');
drop policy if exists s_media_write on storage.objects;
create policy s_media_write on storage.objects for insert
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists s_media_del on storage.objects;
create policy s_media_del on storage.objects for delete
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);

-- =====================================================================
--  TEMİZLİK: süresi dolan story/moment'ları silen fonksiyon
--  (Supabase -> Database -> Cron ile 'select cleanup_expired();' zamanla)
-- =====================================================================
create or replace function cleanup_expired() returns void as $$
begin
  delete from stories where expires_at < now();
  delete from moments where expires_at < now() and highlighted = false;
end;
$$ language plpgsql security definer;
