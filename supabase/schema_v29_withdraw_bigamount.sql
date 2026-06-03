-- =====================================================================
--  AHENK — Şema v29 (para çekme tutar kolonunu genişlet)
--  numeric(10,2) tavanı ₺99.999.999,99 idi → büyük test bakiyelerinde
--  taşma veriyordu. numeric(14,2)'ye çıkarıldı (₺999 milyar+).
-- =====================================================================

alter table withdrawals alter column amount_try type numeric(14,2);
