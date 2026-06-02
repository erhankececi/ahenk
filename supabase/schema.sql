-- =====================================================================
--  AHENK — Veritabanı Şeması (PostgreSQL / Supabase)
--  "Önce ruh, sonra yüz."
--  Supabase SQL Editor'a yapıştırıp çalıştır. Idempotent yazıldı.
-- =====================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "postgis";          -- konum mesafesi için (opsiyonel ama önerilir)

-- ---------- ENUM tipleri ----------
do $$ begin
  create type gender_t       as enum ('kadin','erkek','diger');
  create type smoking_t      as enum ('hayir','sosyal','evet');
  create type pets_t         as enum ('yok','kedi','kopek','diger','seviyorum');
  create type interaction_t  as enum ('ilginc','tanis','ortak','daha_fazla','gec');
  create type message_t      as enum ('text','voice','image');
  create type report_status  as enum ('acik','inceleniyor','kapandi');
  create type premium_plan   as enum ('free','plus','gold');
exception when duplicate_object then null; end $$;

-- =====================================================================
--  PROFILLER
-- =====================================================================
create table if not exists profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  name            text not null,
  birthdate       date,
  gender          gender_t,
  looking_for     gender_t[],                 -- ilgilendiği cinsiyet(ler)
  city            text,
  lat             double precision,
  lon             double precision,
  profession      text,
  bio             text,
  interests       text[] default '{}',        -- ilgi alanları (ortak % için)
  hobbies         text[] default '{}',
  music           text[] default '{}',
  movies          text[] default '{}',
  languages       text[] default '{}',
  zodiac          text,
  smoking         smoking_t,
  pets            pets_t,
  is_verified     boolean default false,      -- doğrulama rozeti
  is_admin        boolean default false,
  hidden_mode     boolean default false,      -- premium: gizli mod
  premium_plan    premium_plan default 'free',
  premium_until   timestamptz,
  activity_score  int default 50,             -- aktivite düzeyi (0-100)
  behavior_score  int default 100,            -- davranış puanı (spam/şikayet ile düşer)
  onboarded       boolean default false,
  created_at      timestamptz default now(),
  last_active     timestamptz default now()
);

create index if not exists idx_profiles_geo on profiles (lat, lon);
create index if not exists idx_profiles_active on profiles (last_active desc);

-- yaş hesaplayan yardımcı view
create or replace view profile_public as
  select id, name, gender, city, profession, bio, interests, hobbies, music,
         movies, languages, zodiac, smoking, pets, is_verified, activity_score,
         hidden_mode,
         case when birthdate is null then null
              else date_part('year', age(birthdate))::int end as age
  from profiles;

-- =====================================================================
--  FOTOĞRAFLAR  (Supabase Storage 'photos' kovasındaki dosyaya işaret eder)
-- =====================================================================
create table if not exists photos (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  path        text not null,                  -- storage path
  position    int  default 0,
  created_at  timestamptz default now()
);
create index if not exists idx_photos_user on photos (user_id, position);

-- =====================================================================
--  MİNİ SORULAR (prompt) + CEVAPLAR
-- =====================================================================
create table if not exists prompts (
  id     serial primary key,
  text   text not null,
  active boolean default true
);

create table if not exists prompt_answers (
  user_id    uuid references profiles(id) on delete cascade,
  prompt_id  int  references prompts(id) on delete cascade,
  answer     text not null,
  created_at timestamptz default now(),
  primary key (user_id, prompt_id)
);

-- =====================================================================
--  ETKİLEŞİMLER  (klasik swipe yerine zengin niyet sinyalleri)
-- =====================================================================
create table if not exists interactions (
  id          uuid primary key default uuid_generate_v4(),
  from_user   uuid not null references profiles(id) on delete cascade,
  to_user     uuid not null references profiles(id) on delete cascade,
  type        interaction_t not null,
  created_at  timestamptz default now(),
  unique (from_user, to_user)
);
create index if not exists idx_interactions_to on interactions (to_user);

-- =====================================================================
--  EŞLEŞMELER
-- =====================================================================
create table if not exists matches (
  id              uuid primary key default uuid_generate_v4(),
  user_a          uuid not null references profiles(id) on delete cascade,
  user_b          uuid not null references profiles(id) on delete cascade,
  reveal_level    int default 0,              -- 0-100, sohbet ilerledikçe fotoğraf netleşir
  created_at      timestamptz default now(),
  last_message_at timestamptz,
  unique (user_a, user_b)
);
create index if not exists idx_matches_users on matches (user_a, user_b);

-- =====================================================================
--  MESAJLAR + REAKSİYONLAR
-- =====================================================================
create table if not exists messages (
  id          uuid primary key default uuid_generate_v4(),
  match_id    uuid not null references matches(id) on delete cascade,
  sender_id   uuid not null references profiles(id) on delete cascade,
  type        message_t default 'text',
  body        text,
  media_path  text,                           -- voice/image storage path
  created_at  timestamptz default now(),
  read_at     timestamptz
);
create index if not exists idx_messages_match on messages (match_id, created_at);

create table if not exists message_reactions (
  message_id  uuid references messages(id) on delete cascade,
  user_id     uuid references profiles(id) on delete cascade,
  emoji       text not null,
  primary key (message_id, user_id)
);

-- =====================================================================
--  ZİYARETLER (premium: kimler profilime baktı) / ENGELLEME / ŞİKAYET
-- =====================================================================
create table if not exists profile_visits (
  visitor_id  uuid references profiles(id) on delete cascade,
  visited_id  uuid references profiles(id) on delete cascade,
  visited_at  timestamptz default now(),
  primary key (visitor_id, visited_id)
);

create table if not exists blocks (
  blocker_id  uuid references profiles(id) on delete cascade,
  blocked_id  uuid references profiles(id) on delete cascade,
  created_at  timestamptz default now(),
  primary key (blocker_id, blocked_id)
);

create table if not exists reports (
  id           uuid primary key default uuid_generate_v4(),
  reporter_id  uuid references profiles(id) on delete cascade,
  reported_id  uuid references profiles(id) on delete cascade,
  reason       text not null,
  details      text,
  status       report_status default 'acik',
  created_at   timestamptz default now()
);

-- =====================================================================
--  BİLDİRİMLER
-- =====================================================================
create table if not exists notifications (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references profiles(id) on delete cascade,
  type        text not null,                  -- 'match' | 'message' | 'visit' | 'system'
  payload     jsonb default '{}',
  is_read     boolean default false,
  created_at  timestamptz default now()
);
create index if not exists idx_notif_user on notifications (user_id, is_read);

-- =====================================================================
--  TETİKLEYİCİLER
-- =====================================================================

-- (1) Karşılıklı olumlu etkileşim -> otomatik eşleşme + bildirim
create or replace function fn_create_match() returns trigger as $$
declare
  reciprocal interactions;
  a uuid; b uuid;
begin
  if new.type = 'gec' then
    return new;
  end if;

  select * into reciprocal from interactions
   where from_user = new.to_user and to_user = new.from_user and type <> 'gec';

  if reciprocal.id is not null then
    a := least(new.from_user, new.to_user);
    b := greatest(new.from_user, new.to_user);

    insert into matches (user_a, user_b)
    values (a, b)
    on conflict (user_a, user_b) do nothing;

    insert into notifications (user_id, type, payload) values
      (new.from_user, 'match', jsonb_build_object('with', new.to_user)),
      (new.to_user,   'match', jsonb_build_object('with', new.from_user));
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_create_match on interactions;
create trigger trg_create_match after insert on interactions
  for each row execute function fn_create_match();

-- (2) Mesaj geldikçe eşleşmenin reveal_level'ını artır (foto netleşmesi)
create or replace function fn_bump_reveal() returns trigger as $$
begin
  update matches
     set reveal_level = least(100, reveal_level + 7),
         last_message_at = now()
   where id = new.match_id;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_bump_reveal on messages;
create trigger trg_bump_reveal after insert on messages
  for each row execute function fn_bump_reveal();

-- (3) Şikayet gelince davranış puanını düşür
create or replace function fn_report_penalty() returns trigger as $$
begin
  update profiles set behavior_score = greatest(0, behavior_score - 10)
   where id = new.reported_id;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_report_penalty on reports;
create trigger trg_report_penalty after insert on reports
  for each row execute function fn_report_penalty();

-- (4) Yeni kullanıcı kaydında profil satırı oluştur
create or replace function fn_handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_new_user on auth.users;
create trigger trg_new_user after insert on auth.users
  for each row execute function fn_handle_new_user();

-- =====================================================================
--  ROW LEVEL SECURITY
-- =====================================================================
alter table profiles          enable row level security;
alter table photos            enable row level security;
alter table prompt_answers    enable row level security;
alter table interactions      enable row level security;
alter table matches           enable row level security;
alter table messages          enable row level security;
alter table message_reactions enable row level security;
alter table profile_visits    enable row level security;
alter table blocks            enable row level security;
alter table reports           enable row level security;
alter table notifications     enable row level security;

-- yardımcı: iki kişi eşleşmiş mi?
create or replace function are_matched(u1 uuid, u2 uuid) returns boolean as $$
  select exists(
    select 1 from matches
     where (user_a = least(u1,u2) and user_b = greatest(u1,u2))
  );
$$ language sql stable security definer;

-- PROFİLLER: herkes (giriş yapmış) okur, kişi kendininkini günceller
drop policy if exists p_profiles_read on profiles;
create policy p_profiles_read on profiles for select
  using (auth.role() = 'authenticated');
drop policy if exists p_profiles_upd on profiles;
create policy p_profiles_upd on profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

-- FOTOĞRAFLAR: herkes okur, sahibi yazar
drop policy if exists p_photos_read on photos;
create policy p_photos_read on photos for select using (true);
drop policy if exists p_photos_write on photos;
create policy p_photos_write on photos for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- PROMPT CEVAPLARI
drop policy if exists p_pa_read on prompt_answers;
create policy p_pa_read on prompt_answers for select using (true);
drop policy if exists p_pa_write on prompt_answers;
create policy p_pa_write on prompt_answers for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ETKİLEŞİMLER: sadece kendi gönderdiğini yazar/okur
drop policy if exists p_int_rw on interactions;
create policy p_int_rw on interactions for all
  using (auth.uid() = from_user) with check (auth.uid() = from_user);

-- EŞLEŞMELER: sadece taraflar görür
drop policy if exists p_matches_read on matches;
create policy p_matches_read on matches for select
  using (auth.uid() = user_a or auth.uid() = user_b);

-- MESAJLAR: sadece eşleşmenin tarafları
drop policy if exists p_msg_read on messages;
create policy p_msg_read on messages for select
  using (exists(select 1 from matches m where m.id = match_id
               and (m.user_a = auth.uid() or m.user_b = auth.uid())));
drop policy if exists p_msg_send on messages;
create policy p_msg_send on messages for insert
  with check (auth.uid() = sender_id and exists(
    select 1 from matches m where m.id = match_id
      and (m.user_a = auth.uid() or m.user_b = auth.uid())));
drop policy if exists p_msg_upd on messages;
create policy p_msg_upd on messages for update
  using (exists(select 1 from matches m where m.id = match_id
               and (m.user_a = auth.uid() or m.user_b = auth.uid())));

-- REAKSİYONLAR
drop policy if exists p_react_rw on message_reactions;
create policy p_react_rw on message_reactions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ZİYARETLER: ziyaret edilen kişi görebilir (premium UI'da filtrelenir), ziyaretçi yazar
drop policy if exists p_visits_read on profile_visits;
create policy p_visits_read on profile_visits for select
  using (auth.uid() = visited_id or auth.uid() = visitor_id);
drop policy if exists p_visits_write on profile_visits;
create policy p_visits_write on profile_visits for insert
  with check (auth.uid() = visitor_id);

-- ENGELLEME
drop policy if exists p_blocks_rw on blocks;
create policy p_blocks_rw on blocks for all
  using (auth.uid() = blocker_id) with check (auth.uid() = blocker_id);

-- ŞİKAYET
drop policy if exists p_reports_write on reports;
create policy p_reports_write on reports for insert
  with check (auth.uid() = reporter_id);

-- BİLDİRİMLER
drop policy if exists p_notif_rw on notifications;
create policy p_notif_rw on notifications for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =====================================================================
--  STORAGE KOVALARI + POLİTİKALAR
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('photos','photos', true), ('voice','voice', false)
on conflict (id) do nothing;

-- photos: herkese açık okuma, sahibi kendi klasörüne yazar (klasör = user id)
drop policy if exists s_photos_read on storage.objects;
create policy s_photos_read on storage.objects for select
  using (bucket_id = 'photos');
drop policy if exists s_photos_write on storage.objects;
create policy s_photos_write on storage.objects for insert
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists s_photos_del on storage.objects;
create policy s_photos_del on storage.objects for delete
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);

-- =====================================================================
--  BAŞLANGIÇ VERİSİ (mini sorular)
-- =====================================================================
insert into prompts (text) values
  ('Bir cumartesi sabahı seni en iyi anlatan şey?'),
  ('Asla vazgeçemeyeceğin bir alışkanlık?'),
  ('Birini ilk dakikada etkileyen şey sence ne?'),
  ('Hayatında en çok değer verdiğin üç şey?'),
  ('Mükemmel bir ilk buluşma senin için nasıl olurdu?'),
  ('Seni en çok güldüren şey?')
on conflict do nothing;
