-- =====================================================================
--  AHENK — Şema v11 (Premium PROFİL ARKA PLAN TEMALARI)
--  ADDITIVE + idempotent. profiles.theme + profiles_card'a theme (rozet gibi
--  hassas değil). View drop+create (kolon eklemek için), tier korunur.
-- =====================================================================

alter table profiles add column if not exists theme text not null default 'default';

drop view if exists profiles_card;
create view profiles_card as
  select
    id, name, gender, city, profession, bio,
    interests, hobbies, music, movies, languages, zodiac, smoking, pets,
    is_verified, activity_score, energy_score,
    vibe, vibe_at, voice_card_path, onboarded, last_active,
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
