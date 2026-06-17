# Animasyonlu hediyeler (WebM)

Buraya `<gift-key>.webm` dosyası bırakınca o hediye gönderildiğinde PNG yerine
**hareketli video** otomatik oynar. Dosya yoksa sistem sessizce PNG + CSS
animasyona düşer (hiçbir kod değişikliği gerekmez).

## Nasıl
1. Hediyenin key'ini öğren (lib/gifts.ts içindeki `key` alanı), örn. `superyat`, `elmas`, `kraliyet`.
2. `superyat.webm` dosyasını bu klasöre koy: `public/gifts/animations/superyat.webm`.
3. Deploy. Hediye gönderilince video oynar.

## Öneriler
- Süre: 2–4 sn, loop'lanabilir.
- Şeffaf arka plan istiyorsan **alpha kanallı WebM** (VP9 + alpha) kullan; yoksa koyu zemin sorun değil (overlay zaten koyu).
- Çözünürlük: ~512–768 px kare yeterli, dosya küçük kalsın (< 1–2 MB).
- Ses gerekmez (otomatik muted oynar).

## Öncelik (legendary hediyeler)
superyat, megayat, dunya, ada, kraliyet, uzay, superaraba, askkulesi, elmas

Asset üretimi için: Runway / Pika / Kling / Luma ile PNG'den image-to-video,
ya da LottieFiles → video export. VISION V1: neon/emoji yok, sinematik ve sakin.
