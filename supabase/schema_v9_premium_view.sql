-- =====================================================================
--  AHENK — Şema v9 (Premium rozet için profiles_card'a güvenli 'tier')
--  ADDITIVE + idempotent. Premium DURUMU rozet/efekt amaçlı gösterilir
--  (hassas değil). lat/lon/birthdate vb. HÂLÂ gizli. v4 view'ını korur,
--  yalnız sona 'tier' kolonu ekler.
-- =====================================================================

drop view if exists profiles_card;
create view profiles_card as
  select
    id, name, gender, city, profession, bio,
    interests, hobbies, music, movies, languages, zodiac, smoking, pets,
    is_verified, activity_score, energy_score,
    vibe, vibe_at, voice_card_path, onboarded, last_active,
    case when birthdate is null then null
         else date_part('year', age(birthdate))::int end as age,
    case when premium_plan = 'platinum' then 'platinum'
         when premium_plan = 'plus'     then 'plus'
         when premium_plan = 'gold'     then 'gold'
         else 'free' end as tier
  from profiles;

-- v4'teki güvenlik ayarlarını koru (definer-rights + yalnız authenticated).
alter view profiles_card set (security_invoker = false);
revoke all on profiles_card from anon;
grant select on profiles_card to authenticated;
