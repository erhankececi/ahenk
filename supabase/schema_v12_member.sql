-- =====================================================================
--  AHENK — Şema v12 (Üye No / public Member ID — SUGO tarzı "ID 123457")
--  ADDITIVE + idempotent. profiles.member_no (sıralı, benzersiz) +
--  profiles_card'a member_no. View drop+create (kolon eklemek için).
-- =====================================================================

create sequence if not exists member_no_seq start 100000;

alter table profiles add column if not exists member_no bigint;
-- mevcut satırları katılım sırasına göre doldur
update profiles set member_no = nextval('member_no_seq') where member_no is null;
-- yeni kayıtlar için varsayılan
alter table profiles alter column member_no set default nextval('member_no_seq');
create unique index if not exists idx_profiles_member_no on profiles (member_no);

drop view if exists profiles_card;
create view profiles_card as
  select
    id, name, gender, city, profession, bio,
    interests, hobbies, music, movies, languages, zodiac, smoking, pets,
    is_verified, activity_score, energy_score,
    vibe, vibe_at, voice_card_path, onboarded, last_active, member_no,
    case when birthdate is null then null
         else date_part('year', age(birthdate))::int end as age,
    case when premium_plan = 'legend'   then 'legend'
         when premium_plan = 'platinum' then 'platinum'
         when premium_plan = 'plus'     then 'plus'
         when premium_plan = 'gold'     then 'gold'
         else 'free' end as tier,
    coalesce(theme, 'default') as theme
  from profiles;

alter view profiles_card set (security_invoker = false);
revoke all on profiles_card from anon;
grant select on profiles_card to authenticated;
