# Ahenk — Mağaza Screenshot Demo Veri & Hesap Planı

Mağaza görsellerinde **gerçek kullanıcı verisi görünmemeli**. Bu plan, screenshot
çekimi için sahte ama premium-görünen, temiz ve güvenli demo içeriği tanımlar.
(Kod değişikliği yok — seed/talimat dosyası.)

## Güvenlik ilkeleri

- Demo'yu **ayrı bir Supabase projesi** ya da prod'da `is_demo`/ayrı e-postalarla
  açıkça kurgusal hesaplarla yap; gerçek üyelerin profilleri ASLA kadraja girmesin.
- Fotoğraflar: gerçek yüz yok — telif-temiz illüstrasyon / temsili görsel; Keşfet ve
  Sohbet'te zaten **bulanık** gösterilir (imza reveal).
- İsimler kurgusal; numara/e-posta/konum gerçek kişiyle eşleşmesin.

## Demo hesaplar

| Rol | Hesap | Durum |
|-----|-------|-------|
| **Ana demo (çeken)** | `demo@ahenk.live` | Onboarded, **Premium (gold)**, jeton ~12.450, Kurucu Üye rozeti, profil tam dolu |
| Keşfet profilleri | 6 kurgusal profil (aşağıda) | Onboarded, fotoğraf bulanık, uyum %70-96 |
| Sohbet eşleşmesi | "Dilara" (aşağıdaki kart) | Ana demo ile match; transcript hazır, reveal %60 |

## Keşfet — 6 sahte profil

| Ad, yaş | Şehir | Meslek | Bio (kısa) | İlgi alanları | Uyum |
|---------|-------|--------|------------|---------------|------|
| Dilara, 24 | İstanbul | Mimar | "Eski kitaplar, uzun yürüyüşler ve iyi kahve." | Sanat, Seyahat, Kahve, Kitap | %92 |
| Selin, 27 | İzmir | Doktor | "Sakin denizler ve canlı sohbetler." | Yoga, Müzik, Doğa, Film | %88 |
| Ece, 23 | Ankara | Öğrenci | "Konser kovalayan, vinil biriktiren biri." | Müzik, Konser, Fotoğraf | %85 |
| Naz, 29 | İstanbul | Yazılımcı | "Kod ve filtre kahve; ikisi de güçlü olsun." | Teknoloji, Tırmanış, Kahve | %81 |
| Melis, 26 | Bursa | Öğretmen | "Pazar kahvaltıları ve uzun masa sohbetleri." | Yemek, Seyahat, Kitap | %78 |
| Defne, 25 | Antalya | Tasarımcı | "Gün batımı, tipografi ve deniz." | Tasarım, Sanat, Doğa | %74 |

> Erkek/diğer demo seti gerekiyorsa aynı yapıda 6 kart daha (Kaan, Emre, Arda, Mert,
> Can, Deniz) hazırlanabilir; ana demo hesabın `looking_for` tercihine göre seç.

## Sohbet ekranı — "Dilara" transcript (reveal %60)

> Üst foto hafif bulanık; "Fotoğraf sohbet ilerledikçe netleşir" ipucu görünür.

```
Dilara:  Profilindeki "önce karakter" yaklaşımı çok hoşuma gitti 🙂
Sen:     Teşekkürler! Bio'ndaki eski kitaplar kısmı beni yakaladı.
Dilara:  Son okuduğun kitap ne?
Sen:     Calvino — Görünmez Kentler. Sırada ne var sende?
Dilara:  Tam benlik 📚 Hafta sonu o kahveciye gidelim mi?
```
(Üstte: "Görüşüldü ✓" yok; kimya çubuğu ~%64; alt aksiyonlar altın beğen/geç.)

## Moments — caption örnekleri

- "Gün batımının huzuru 🌇" — manzara
- "Bu hafta keşfettiğim köşe ☕" — kafe
- "Sahaf turu, vinil avı 🎶" — kitap/plak
- "Sabah yürüyüşü, temiz başlangıç" — doğa

## Premium / Cüzdan / Hediye durumları

- **Premium ekranı:** Ana demo "gold" (Premium) — üyelik kartında "Premium" rozeti;
  alternatif görsel için "Standart" hesapla planları/upsell de yakalanabilir.
- **Cüzdan:** jeton bakiyesi ~**12.450**; Geçmiş sekmesinde 3-4 örnek hareket
  (görev ödülü +20, davet +250, boost -200).
- **Hediye Mağazası:** "Lüks" kategorisinde bir kart **seçili** (parıltı/halka),
  fiyat etiketi görünür; üstte jeton bakiyesi.
- **Liderlik (ops.):** ilk 3'te kurgusal isimler + jeton/davet sayıları.

## Üretim akışı

1. Demo hesabı ve 6 kurgusal profili seed et (ayrı proje/işaretli e-postalar).
2. Ana demo'yu Premium + jeton + Kurucu rozetli yap; Dilara ile match + transcript ekle.
3. Her ekranı yukarıdaki duruma getir → `lang=tr` ve `lang=en` çek (bkz. STORE_SCREENSHOTS.md).
4. Çekim sonrası demo verisini prod'dan temizle (ayrı projeyse gerek yok).

> İlgili: metinler `STORE_LISTING.md`, ölçü/çekim `STORE_SCREENSHOTS.md`, ikon `assets/store/`.
