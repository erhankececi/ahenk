-- Ahenk v47 — Karakter/yaşam tarzı alanları (akıllı eşleşme için).
-- Additive. Mesafe tek kriter olmaktan çıkar; karakter uyumu hesaplanır.
-- Yeni alanlar text (esnek), enum'a bağlanmaz ki ileride değer ekleyebilelim.

alter table profiles add column if not exists drinking text;          -- alkol: hayir | sosyal | evet
alter table profiles add column if not exists relationship_goal text; -- gelecek planı: ciddi | evlilik | arkadaslik | belirsiz
alter table profiles add column if not exists wants_kids text;        -- çocuk: istiyorum | istemiyorum | belki | var
alter table profiles add column if not exists exercise text;          -- yaşam tarzı: sik | bazen | nadiren
alter table profiles add column if not exists diet text;              -- beslenme: hepcil | vejetaryen | vegan | farketmez

-- Bu alanlar herkese açık profil bilgisidir (jeton gibi korumalı değil),
-- v18 fn_protect_profile_cols koruması dışındadır — kullanıcı kendi değerini
-- güncelleyebilir. Ek policy gerekmiyor (profiles update policy zaten owner-only).

-- profiles_card view'ını yeni yaşam tarzı alanlarıyla yeniden oluştur.
drop view if exists profiles_card;
create view profiles_card as
  select
    id, name, gender, city, profession, bio,
    interests, hobbies, music, movies, languages, zodiac, smoking, pets,
    drinking, relationship_goal, wants_kids, exercise, diet,
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
