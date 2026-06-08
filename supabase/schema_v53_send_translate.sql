-- Ahenk v53 — Gönderirken çeviri altyapısı.
-- profiles.lang: kullanıcının tercih ettiği dil (LanguageSwitcher kaydeder).
-- messages.orig_body: gönderirken çeviri yapıldıysa GÖNDERENİN yazdığı orijinal metin.
--   (body = alıcının dilindeki çeviri; orig_body = orijinal. İkisi de saklanır.)

alter table profiles add column if not exists lang text default 'tr';
alter table messages add column if not exists orig_body text;

-- profiles_card'a lang ekle (sohbet açılışında karşı tarafın dilini okumak için)
drop view if exists profiles_card;
create view profiles_card as
  select
    id, name, gender, city, profession, bio,
    interests, hobbies, music, movies, languages, zodiac, smoking, pets,
    drinking, relationship_goal, wants_kids, exercise, diet,
    is_verified, activity_score, energy_score,
    vibe, vibe_at, voice_card_path, onboarded, last_active, member_no, lang,
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
