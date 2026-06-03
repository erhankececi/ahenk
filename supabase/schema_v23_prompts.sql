-- =====================================================================
--  AHENK — Şema v23 (PROFİL SORULARI / prompts — Hinge tarzı)
--  ADDITIVE + idempotent. Eski seed tekrar tekrar çalışıp 72 KOPYA soru
--  oluşturmuş → temizle, benzersiz + zengin set koy, cevap upsert altyapısı.
-- =====================================================================

-- Erken aşama: tekrarlanan sorular + (varsa) test cevaplarını temizle.
truncate table prompt_answers, prompts restart identity cascade;

-- Benzersiz soru metni (tekrarı kalıcı önle).
do $$ begin
  alter table prompts add constraint prompts_text_uniq unique (text);
exception when duplicate_object then null; when duplicate_table then null; end $$;

-- Cevap upsert için (kullanıcı başına soru başına tek cevap).
do $$ begin
  alter table prompt_answers add constraint prompt_answers_user_prompt_uniq unique (user_id, prompt_id);
exception when duplicate_object then null; when duplicate_table then null; end $$;

insert into prompts (text) values
 ('Bir cumartesi sabahı beni en iyi anlatan şey…'),
 ('Asla vazgeçemeyeceğim bir alışkanlığım…'),
 ('Mükemmel bir ilk buluşma bence…'),
 ('Hayatta en çok değer verdiğim üç şey…'),
 ('Beni en çok güldüren şey…'),
 ('Tek zaafım…'),
 ('Birini ilk dakikada etkileyen şey bence…'),
 ('Son zamanlarda takıntı yaptığım şey…'),
 ('Beni gerçekten tanımak için bilmen gereken…'),
 ('Birlikte yapsak harika olur dediğim şey…'),
 ('En sevdiğim küçük mutluluk…'),
 ('Tartışmasız en iyi film/dizi önerim…'),
 ('Beni anlatan bir şarkı…'),
 ('Pazar günleri genelde…'),
 ('Hayalimdeki tatil…'),
 ('Bana bunu sorabilirsin, saatlerce konuşurum…'),
 ('Gizli yeteneğim…'),
 ('Beni mutlu eden basit bir an…'),
 ('Asla "hayır" diyemediğim şey…'),
 ('İlişkide en çok önem verdiğim şey…'),
 ('Son okuduğum/etkilendiğim bir şey…'),
 ('İçimdeki çocuk hâlâ bayılıyor…'),
 ('Beni en iyi tanımlayan emoji ve nedeni…'),
 ('Bir süper gücüm olsa…')
on conflict (text) do nothing;
