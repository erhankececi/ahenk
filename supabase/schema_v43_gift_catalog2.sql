-- =====================================================================
--  AHENK — Şema v43 (hediye kataloğu 2.0 — kategoriler + yeni hediyeler)
--  send_gift cost/name/emoji'yi gift_catalog'tan okur; yeni anahtarları ekle.
--  Eski anahtarlar bozulmaz (geçmiş veri korunur).
-- =====================================================================

insert into gift_catalog(key, name, emoji, category, cost, sort) values
  ('kahve','Kahve','☕','romantik',15,11),
  ('gul','Gül','🌹','romantik',20,12),
  ('cikolata','Çikolata','🍫','romantik',30,13),
  ('pasta','Pasta','🎂','romantik',45,14),
  ('kalp','Kalp','💖','romantik',60,15),
  ('pelus','Peluş','🧸','romantik',80,16),
  ('buket','Buket','💐','romantik',150,17),
  ('parfum','Parfüm','🧴','luks',200,21),
  ('kolye','Kolye','📿','luks',350,22),
  ('saat','Saat','⌚','luks',500,23),
  ('yuzuk','Yüzük','💍','luks',900,24),
  ('elmas','Elmas','💎','luks',1500,25),
  ('birkin','Birkin','👜','luks',3000,26),
  ('vipdavet','VIP Davet','🎟️','vip',700,31),
  ('elmasyuzuk','Elmas Yüzük','💍','vip',2500,32),
  ('rolex','Rolex','⌚','vip',5000,33),
  ('ferrari','Ferrari','🏎️','vip',8000,34),
  ('helikopter','Helikopter','🚁','seyahat',3000,41),
  ('yat','Yat','🛥️','seyahat',5000,42),
  ('villa','Villa Tatili','🏖️','seyahat',7000,43),
  ('jet','Özel Jet','✈️','seyahat',9000,44),
  ('tac','Taç','👑','kraliyet',600,51),
  ('sato','Şato','🏰','kraliyet',15000,52),
  ('kraliyet','Kraliyet Paketi','👑','kraliyet',80000,53),
  ('superaraba','Süper Araba','🚗','efsane',12000,61),
  ('superyat','Süper Yat','🛳️','efsane',20000,62),
  ('dunya','Dünya Turu','🌎','efsane',30000,63),
  ('megayat','Mega Yat','🚢','efsane',40000,64),
  ('ada','Özel Ada','🏝️','efsane',60000,65),
  ('uzay','Uzay Yolculuğu','🚀','efsane',100000,66),
  ('ates','Ateş','🔥','ozel',10,71),
  ('tatli','Tatlı','🧁','ozel',25,72),
  ('cicek','Çiçek','🌷','ozel',35,73),
  ('konfeti','Konfeti','🎉','ozel',100,74)
on conflict (key) do update
  set name = excluded.name, emoji = excluded.emoji,
      category = excluded.category, cost = excluded.cost, sort = excluded.sort;
