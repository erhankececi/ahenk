# Ahenk — Mağaza Screenshot Üretim Planı

Mağazada kullanılacak 8 (+2 opsiyonel) görselin **net üretim planı**. Caption metinleri
i18n'de zaten var; bu plan kaynak ekran, durum kurulumu, ölçü ve stil belirler.
(Kod değişikliği yok.)

## Hedef ölçüler (px)

| Mağaza | Cihaz | Çözünürlük | Min adet |
|--------|-------|------------|----------|
| App Store | 6.7" iPhone (15 Pro Max) | **1290 × 2796** | 3 (10'a kadar) |
| App Store | 6.5" iPhone | **1242 × 2688** | 3 |
| Google Play | Telefon | **1080 × 2400** (veya 1080×1920) | 2 (8'e kadar) |
| Google Play | Feature graphic | **1024 × 500** | 1 (zorunlu) |

> Üret: gerçek cihaz/emülatörde hedef çözünürlükte ekran görüntüsü **VEYA** mobil
> Chrome'da `ahenk.live` + DevTools "Device toolbar" ile cihaz boyutunda yakala.
> Sonra Figma/şablonda **üst caption + cihaz frame** ekle. Tek tutarlı şablon kullan.

## Stil şablonu (tüm görsellerde aynı)

- Arka plan: onyx degrade `#0E0D10 → #09090B` (uygulamayla aynı).
- Üst caption: Manrope/Inter, beyaz `#F3EEE4`, vurgu pirinç `#C7A977`; tek satır + kısa alt satır.
- Cihaz: ince çerçeve (status bar 9:41), ekran görüntüsü ortalı.
- Mor/gradyan YOK. Marka paleti: bkz. `assets/store/`.
- **Mahremiyet:** Keşfet/Sohbet'te gerçek yüz kullanma — bulanık/temsili görsel.

## Dil

Her görseli **iki dilde** üret: TR (`Cookie: lang=tr`) ve EN (`lang=en`).
App Store/Play yerelleştirilmiş screenshot setini ayrı locale'lere yükler.

## Screenshot seti (sıralı)

| # | Kaynak ekran / route | Durum kurulumu | Caption TR | Caption EN | Notlar |
|---|----------------------|----------------|-----------|-----------|--------|
| 1 | Landing `/` (giriş yapmadan) | Hero görünür | "Karakter önce, yüz sonra" | "Character first, face later" | Marka vaadi; telefon mockup'lı hero |
| 2 | Keşfet `/kesfet` | Bir aday kartı, fotoğraf **bulanık**, uyum halkası %xx | "Önce kişilik, sonra görünüm" | "Personality first, looks later" | Temsili/bulanık foto; uyum ringi öne çıksın |
| 3 | Profil `/profil` | Profil sekmesi, kimlik kartı + rozetler | "Kendini karakterinle anlat" | "Show who you really are" | Kurucu/Premium rozet görünür olabilir |
| 4 | Sohbet `/sohbet/[id]` | Birkaç mesaj + "Fotoğraf sohbet ilerledikçe netleşir" | "Sohbet ettikçe fotoğraf netleşir" | "Photos clear up as you chat" | İmza reveal mekaniği; üst foto hafif bulanık |
| 5 | Premium `/premium` | Üyelik kartı (Amex-black) + planlar | "Daha görünür, daha ayrıcalıklı" | "More visible, more privileged" | Plan karşılaştırma kırpılabilir |
| 6 | Hediye Mağazası `/magaza` | Hediye grid'i, bir kart seçili (parıltı) | "Sinematik hediye deneyimi" | "A cinematic gift experience" | Lüks his; jeton bakiyesi üstte |
| 7 | Moments `/moments` | Bir moment kartı (görsel + etkileşim) | "Canlı sosyal dünya" | "A living social world" | Reels alternatifi de olur |
| 8 | Güvenlik `/guvenlik` veya Profil güven kartı | Doğrulama/rozet + güven metni | "Güvenli, doğrulanmış topluluk" | "A safe, verified community" | KVKK/moderasyon vurgusu |

### Opsiyonel (9–10)

| # | Ekran | Caption TR | Caption EN |
|---|-------|-----------|-----------|
| 9 | Etkinlikler/Topluluk | "Şehrinde gerçek buluşmalar" | "Real meetups in your city" |
| 10 | Liderlik / Oyun | "Eğlence ve topluluk enerjisi" | "Fun and community energy" |

## Üretim akışı (öneri)

1. Test hesabıyla giriş yap (ya da demo veri), her ekranı yukarıdaki **durum**a getir.
2. `lang=tr` çek → 8 görsel; `lang=en` çek → 8 görsel.
3. Figma şablonunda caption + frame ekle, hedef ölçülere export et (TR/EN ayrı klasör).
4. Feature graphic (1024×500): logo + "Karakter önce, yüz sonra" + onyx zemin.
5. App Store Connect / Play Console'a ilgili locale'lere yükle.

> Çıktılar repoya değil, mağaza panellerine yüklenir. Bu dosya yalnız üretim
> talimatıdır; marka kaynakları `assets/store/`, metinler `STORE_LISTING.md`.
