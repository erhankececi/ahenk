# Ahenk — Marka & Tasarım Sistemi

> **Marka vaadi:** "Önce ruh, sonra yüz." Karaktere, ilgi alanlarına ve yaşam tarzına
> göre tanışma. Samimi · Premium · Güvenli · Modern · Minimal · Genç · Sosyal.
> Kişilik: arkadaş canlısı, AI destekli, az kurumsal, az flört-odaklı.

---

## 1) Logo Konseptleri (5 yön)

Hepsi tek bakışta tanınır, mobil ikonda okunur, koyu/açık temada çalışır, gradient destekli.

1. **Uyum Monogramı (SEÇİLEN — `public/icon.svg`)**
   Gradient yuvarlatılmış karo üzerine beyaz, birbirine bağlanan iki çizgiden oluşan
   stilize **"A"**. Tepedeki **mercan (accent) nokta** sıcaklık/sosyallik katar.
   İki insanın bir noktada buluşması = ahenk.
2. **Ses Dalgası (Harmony Wave)** — "Ahenk" = uyum. Eşit yükseklikte 3 yuvarlak
   dalga çubuğu, ortadaki gradient. Müzik/ahenk çağrışımı.
3. **İç İçe Kalpler** — İki yarım kalbin bir bütün oluşturması; flörtten çok
   "tamamlanma" hissi. Tek renk + gradient varyant.
4. **Konuşma + Kıvılcım** — Yuvarlatılmış konuşma balonu içinde küçük bir kıvılcım
   (spark). Sohbet-öncelikli ürünü anlatır.
5. **Düğüm / Sonsuzluk** — İki şeridin sonsuzluk düğümü; bağ ve süreklilik. Premium,
   minimal, soyut.

**Varlıklar:** `public/logo.svg` (yatay logo + wordmark), `public/icon.svg`
(1024 kaynak), `public/favicon.svg`, `public/splash.svg`, `public/manifest.webmanifest`.

> **PNG export notu:** App Store/Play Store 1024×1024 PNG ve iOS splash setleri için
> SVG kaynaklardan dışa aktar:
> `npx sharp-cli -i public/icon.svg -o public/icon-1024.png resize 1024 1024`
> (veya herhangi bir SVG→PNG aracı). PWA SVG ikon zaten manifest'te tanımlı.

---

## 2) Renk Sistemi

| Token | HEX | Kullanım |
|---|---|---|
| Primary | `#6C63FF` | ana aksiyon, marka |
| Secondary | `#8B85FF` | gradient bitişi, ikincil |
| Accent | `#FF7D6B` | vurgu, sosyallik, streak |
| Success | `#22C55E` | onay, tamamlanma |
| Warning | `#F59E0B` | uyarı |
| Error | `#EF4444` | hata, tehlike |
| Dark BG | `#0F1117` | arka plan |
| Card BG | `#171923` | yüzey/kart |
| Border | `#272B36` | kenarlık |
| Text Primary | `#FFFFFF` | başlık/gövde |
| Text Secondary | `#B6BCC8` | soluk metin |

Renkler `app/globals.css` içinde **RGB kanal** CSS değişkeni olarak tanımlı
(`--brand: 108 99 255`) → Tailwind `rgb(var(--brand) / <alpha-value>)` ile alpha
desteği. Açık tema `.light` sınıfında override edilir.

---

## 3) Tasarım Tokenları

- **Spacing:** Tailwind 4px tabanlı ölçek (`p-1`=4px … `p-6`=24px). Kart içi 16–20px.
- **Radius:** `--radius-sm .5rem` · `md .875rem` · `lg 1.25rem` · `xl 1.75rem`
  (Tailwind: `rounded-2xl`/`rounded-3xl` ağırlıklı).
- **Shadow:** `shadow-card` (kartlar), `shadow-float` (FAB/modal), `shadow-glow` (marka).
- **Animasyon süreleri:** `--dur-fast 200ms` · `--dur-base 300ms` · `--dur-slow 500ms`
  (Tailwind `duration-200/300/500`).
- **Keyframes:** `fade-up`, `fade-in`, `scale-in`, `slide-up`, `shimmer`.

## 4) Tipografi (Inter)

| Sınıf | Boyut/Ağırlık | Kullanım |
|---|---|---|
| `.t-h1` | 32/800 | ekran başlığı |
| `.t-h2` | 24/700 | bölüm başlığı |
| `.t-h3` | 20/700 | kart başlığı |
| `.t-h4` | 17/600 | alt başlık |
| `.t-body-lg` | 17/400 | öne çıkan gövde |
| `.t-body-md` | 15/400 | gövde |
| `.t-body-sm` | 13/400 | yardımcı |
| `.t-caption` | 11/500 | etiket/zaman |
| `.t-button` | 15/600 | buton |

---

## 5) Bileşen Kütüphanesi (`components/ui.tsx`)

- **Button** — `primary · secondary · ghost · outline · danger`, `sm/md/lg`, hover
  (brightness/bg), active (`scale-95`), disabled. `IconButton`, `Fab` (FAB).
- **Input** — `Input`, `TextArea`, `SearchInput`, `PasswordInput` (göz ikonu),
  `OtpInput` (kod), `MultiSelect`, `Dropdown`. Validasyon: `state="default|error|success"`
  → kenarlık rengi.
- **Card** — `Card` (shadow-card). Türev kartlar ekranlarda: User/Match/Moment/Story/
  Event/Notification.
- **Durumlar** — `Skeleton`, `CardSkeleton` (shimmer), `EmptyState`, `ErrorState`.
- **Chip / Badge** — `Badge` tonları: brand/success/warning/error/accent.

## 6) Navigasyon

- **Bottom Nav (5):** Keşfet · Moments · Mesajlar · Etkinlikler · Profil.
- **Top Bar:** Arama · Bildirim · Ayarlar (`components/TopBar.tsx`).

## 7) Animasyon İlkeleri (Framer Motion)

- Geçişler 200/300/500ms; kartlar `scale + fade + slide` (örn. Keşfet kartı,
  eşleşme popup, hikaye/moment görüntüleyici).
- Liste girişleri `animate-fade-up`; modal `scale-in`; sayfa `fade-in`.

## 8) Mobil-öncelik & Responsive

Tüm ekranlar `max-w-md` mobil çerçevede tasarlanır. Kırılımlar Tailwind ile:
`sm` (640) tablet, `lg` (1024) desktop — geniş ekranda orta kolon + kenarlarda boşluk.
