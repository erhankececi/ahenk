-- Ahenk v51 — Etkinlik kapak görseli (duyuru panosu → görsel etkinlik kartı).
-- Additive. cover_path public 'media' kovasında <uid>/events/<uuid>.<ext>.
alter table events add column if not exists cover_path text;
