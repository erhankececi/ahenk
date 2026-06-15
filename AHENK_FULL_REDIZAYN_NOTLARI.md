# Ahenk Full Redesign — VISION V1

Bu paket tek tek Gift Store paketi değildir; proje genelindeki görünümü referans görseldeki **Sessiz Lüks** standardına çekmek için hazırlandı.

## Ana değişiklikler

- `/` landing page baştan yazıldı: 3 telefon mockup, Keşfet, Moments ve Hediye Mağazası referans kompozisyonu.
- Global tasarım katmanı eklendi: onyx zemin, mat pirinç vurgu, premium kartlar, inputlar, paneller, auth, admin ve app shell.
- Google font build bağımlılığı kaldırıldı: `next/font/google` fetch hatası yaşamamak için sistem font fallback kullanıldı.
- Legal sayfaları premium kart yapısına alındı.
- Admin layout koyu/premium panel içine alındı.
- Mevcut logic, Supabase, API route, RLS, auth ve veri akışlarına dokunulmadı.
- 35 gift PNG korunuyor ve `/public/gifts` altında kullanılmaya devam ediyor.

## Değişen ana dosyalar

- `app/page.tsx`
- `app/globals.css`
- `app/layout.tsx`
- `app/admin/layout.tsx`
- `components/marketing/LegalPage.tsx`

## Kontrol

Bu ortamda `tsc --noEmit` başarıyla geçti. `next build` burada Google font/network ve süre kısıtları yüzünden tamamlatılamadı; bu yüzden `next/font/google` bağımlılığı kaldırıldı. Projede build almadan deploy etme.

## Deploy öncesi

```bash
npm install
npm run build
```

Build hatası çıkarsa terminal çıktısını gönder.
