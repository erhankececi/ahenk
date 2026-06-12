-- Ahenk v60 — Aşk Kulesi hediyesi (yeni asset). send_gift gift_catalog'tan okur.
insert into gift_catalog(key, name, emoji, category, cost, sort) values
  ('askkulesi', 'Aşk Kulesi', '🗼', 'kraliyet', 50000, 305)
on conflict (key) do update set name = excluded.name, cost = excluded.cost, category = excluded.category;
