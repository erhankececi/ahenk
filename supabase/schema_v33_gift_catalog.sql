-- =====================================================================
--  AHENK — Şema v33 (HEDİYE KATALOĞU — kategorili, genişletilmiş ekonomi)
--  ADDITIVE. send_gift artık gift_catalog'tan okur (hardcoded CASE kaldırıldı).
--  Eski anahtarlar (ates/gul/kalp/elmas/tac) korunur → mevcut veri bozulmaz.
-- =====================================================================

create table if not exists gift_catalog (
  key      text primary key,
  name     text not null,
  emoji    text not null,
  category text not null,   -- 'daily' | 'premium' | 'luxury' | 'legend'
  cost     int  not null,
  sort     int  default 0
);

alter table gift_catalog enable row level security;
drop policy if exists p_giftcat_read on gift_catalog;
create policy p_giftcat_read on gift_catalog for select using (true); -- katalog herkese açık

insert into gift_catalog(key, name, emoji, category, cost, sort) values
  ('ates','Ateş','🔥','daily',10,10),
  ('kahve','Kahve','☕','daily',15,20),
  ('gul','Gül','🌹','daily',20,30),
  ('tatli','Tatlı','🧁','daily',25,40),
  ('cikolata','Çikolata','🍫','daily',30,50),
  ('cicek','Çiçek','🌷','daily',35,60),
  ('kitap','Kitap','📚','daily',40,70),
  ('kalp','Kalp','💖','daily',50,80),
  ('parfum','Parfüm','🧴','premium',150,110),
  ('buket','Çiçek Buketi','💐','premium',200,120),
  ('yemek','Akşam Yemeği','🍽️','premium',250,130),
  ('kolye','Kolye','📿','premium',300,140),
  ('taki','Takı Kutusu','💍','premium',350,150),
  ('saat','Saat','⌚','premium',450,160),
  ('tac','Taç','👑','premium',500,170),
  ('vipdavet','VIP Davet','🎟️','premium',600,180),
  ('aksamyemegi','Lüks Akşam Yemeği','🥂','luxury',1000,210),
  ('elmas','Elmas','💎','luxury',1500,220),
  ('elmasyuzuk','Elmas Yüzük','💍','luxury',2500,230),
  ('helikopter','Helikopter Turu','🚁','luxury',3000,240),
  ('yat','Yat Turu','🛥️','luxury',4000,250),
  ('sporaraba','Spor Araba','🏎️','luxury',5000,260),
  ('villa','Lüks Villa Tatili','🏖️','luxury',6000,270),
  ('superaraba','Süper Araba','🚗','luxury',7000,280),
  ('jet','Özel Jet','✈️','luxury',8000,290),
  ('superyat','Süper Yat','🛳️','legend',20000,310),
  ('dunyaturu','Dünya Turu','🌍','legend',30000,320),
  ('megayat','Mega Yat','🚢','legend',40000,330),
  ('ozada','Özel Ada','🏝️','legend',60000,340),
  ('kraliyet','Kraliyet Paketi','👑','legend',80000,350),
  ('uzay','Uzay Yolculuğu','🚀','legend',100000,360)
on conflict (key) do update
  set name = excluded.name, emoji = excluded.emoji,
      category = excluded.category, cost = excluded.cost, sort = excluded.sort;

-- send_gift: katalogdan oku (aynı dönüş şekli korunur: ok/cost/earned/label).
create or replace function send_gift(p_from uuid, p_to uuid, p_gift text) returns jsonb as $$
declare cost int; lbl text; bal int; earn int;
begin
  select g.cost, g.name || ' ' || g.emoji into cost, lbl from gift_catalog g where g.key = p_gift;
  if cost is null then return jsonb_build_object('ok', false, 'error', 'bad_gift'); end if;
  if p_from = p_to then return jsonb_build_object('ok', false, 'error', 'self'); end if;

  select coalesce(jeton, 0) into bal from profiles where id = p_from for update;
  if bal < cost then
    return jsonb_build_object('ok', false, 'error', 'insufficient', 'cost', cost, 'balance', bal);
  end if;

  earn := floor(cost * 0.7);
  update profiles set jeton = jeton - cost where id = p_from;
  update profiles set jeton = jeton + earn where id = p_to;
  insert into jeton_ledger(user_id, key, amount, reason) values
    (p_from, 'gift_out:' || gen_random_uuid()::text, -cost, lbl || ' gönderildi'),
    (p_to,   'gift_in:'  || gen_random_uuid()::text,  earn, lbl || ' alındı (hediye kazancı)');
  insert into gift_sends(from_user, to_user, gift_key, jeton, earned)
    values (p_from, p_to, p_gift, cost, earn);

  return jsonb_build_object('ok', true, 'cost', cost, 'earned', earn, 'label', lbl);
end;
$$ language plpgsql security definer set search_path = public;
revoke all on function send_gift(uuid, uuid, text) from anon, authenticated;
