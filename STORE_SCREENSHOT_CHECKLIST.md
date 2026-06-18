# Ahenk — Mağaza Screenshot Çekim Kontrol Listesi

Screenshot üretimine başlamadan önce ve her görselde uygulanacak adım adım liste.
İlgili: ölçü/stil `STORE_SCREENSHOTS.md`, demo içerik `STORE_DEMO_DATA.md`,
metin `STORE_LISTING.md`. (Kod/DB değişikliği yok.)

## A) Çekim öncesi tek seferlik hazırlık

- [ ] **Demo hesap hazır** — `demo@ahenk.live`: onboarded, Premium (gold), jeton ~12.450, Kurucu rozet, profil tam dolu
- [ ] **Demo profiller hazır** — 6 kurgusal Keşfet profili seed edildi (Dilara…Defne), uyum %74-96
- [ ] **Sohbet eşleşmesi hazır** — "Dilara" match + transcript, reveal ~%60
- [ ] **Demo izolasyonu** — ayrı Supabase projesi ya da işaretli kurgusal hesaplar; gerçek üye kadrajda yok
- [ ] **Dil** — TR (`Cookie: lang=tr`) ve EN (`lang=en`) setleri ayrı çekilecek; cihaz dili karışmıyor
- [ ] **Çözünürlük** — hedef cihaz ayarlandı (6.7" 1290×2796 / 6.5" 1242×2688 / Play 1080×2400)
- [ ] **Status bar 9:41** — saat 9:41, tam pil/sinyal (gerçek cihazda demo mode; emülatörde sabitle)
- [ ] **Bildirim yok** — banner/popup, push izni diyalogu, "güncelleme var" vs. kapalı
- [ ] **Kişisel veri yok** — gerçek isim/e-posta/telefon/konum görünmüyor
- [ ] **Yüzler bulanık** — Keşfet/Sohbet'te gerçek yüz yok; temsili/bulanık görsel
- [ ] **Tema** — VISION V1 onyx/pirinç; mor/gradyan yok; karanlık mod

## B) Her görsel için ortak kontrol (8 kez)

- [ ] Doğru ekran/route açık ve **doğru durumda**
- [ ] Üst caption (TR/EN) eklenecek metin doğru (bkz. STORE_SCREENSHOTS tablo)
- [ ] Kadrajda dağınıklık/yarım yüklenen öğe yok (skeleton/shimmer bitmiş)
- [ ] Jeton bakiyesi/rozet/etiketler premium ve tutarlı görünüyor
- [ ] Görsel hem TR hem EN için ayrı kaydedildi (doğru klasör)

## C) Ekran ekran checklist

### 1) Landing — marka vaadi
- [ ] `/` giriş yapmadan; hero + telefon mockup görünür
- [ ] Caption: "Karakter önce, yüz sonra" / "Character first, face later"

### 2) Keşfet
- [ ] `/kesfet`; bir aday kartı, **fotoğraf bulanık**, uyum halkası (%92 Dilara)
- [ ] Alt aksiyonlar (altın beğen/geç/süper) görünür, üst çipler temiz
- [ ] Caption: "Önce kişilik, sonra görünüm" / "Personality first, looks later"

### 3) Profil
- [ ] `/profil` Profil sekmesi; kimlik kartı + Kurucu/Premium rozet + bio
- [ ] İstatistikler dolu; kişisel gerçek veri yok
- [ ] Caption: "Kendini karakterinle anlat" / "Show who you really are"

### 4) Sohbet — fotoğraf reveal
- [ ] `/sohbet/[id]` Dilara; birkaç mesaj + üst foto hafif bulanık
- [ ] "Fotoğraf sohbet ilerledikçe netleşir" ipucu / kimya çubuğu görünür
- [ ] Caption: "Sohbet ettikçe fotoğraf netleşir" / "Photos clear up as you chat"

### 5) Premium
- [ ] `/premium`; üyelik kartı (Amex-black) + planlar/karşılaştırma
- [ ] Caption: "Daha görünür, daha ayrıcalıklı" / "More visible, more privileged"

### 6) Hediye Mağazası
- [ ] `/magaza`; "Lüks" kategoride bir kart **seçili** (parıltı), fiyat + jeton bakiyesi üstte
- [ ] Caption: "Sinematik hediye deneyimi" / "A cinematic gift experience"

### 7) Moments / Reels
- [ ] `/moments`; bir moment kartı (görsel + beğeni/yorum) ya da `/reels`
- [ ] Caption: "Canlı sosyal dünya" / "A living social world"

### 8) Güvenlik / gizlilik
- [ ] `/guvenlik` veya Profil güven kartı; doğrulama/rozet + güven metni
- [ ] Caption: "Güvenli, doğrulanmış topluluk" / "A safe, verified community"

## D) Çekim sonrası

- [ ] 8 görsel × 2 dil = 16 dosya export edildi (TR/EN klasör)
- [ ] Feature graphic (1024×500) üretildi
- [ ] Dosyalar hedef ölçülerde, sıkıştırma artefaktı yok
- [ ] App Store Connect / Play Console ilgili locale'lere yüklendi
- [ ] Demo verisi prod'dan temizlendi (ayrı projeyse gerek yok)
