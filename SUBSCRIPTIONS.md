# Ahenk — Mobil Abonelik Altyapısı (App Store + Google Play)

Bu doküman, Ahenk'in **gerçek para abonelik** sistemini (Free / Plus / Premium Plus) kurar.
Mimari: **RevenueCat + Capacitor + Supabase**. Satın alma mağaza üzerinden yapılır, RevenueCat
doğrular, webhook ile Supabase'e işlenir.

---

## 1) Mimari

```
[Capacitor native kabuk]  ─loads─►  Next.js (barındırılan site, server.url)
        │  RevenueCat Capacitor SDK  → native satın alma sayfası (StoreKit / Play Billing)
        ▼
  Apple App Store / Google Play  ──(receipt)──►  RevenueCat  (DOĞRULAR + abonelik durumu tutar)
        │  webhook (Authorization header ile imzalı)
        ▼
  POST /api/webhooks/revenuecat  ──►  apply_subscription_event()  (idempotent)
        │                                   ├─ subscriptions (mağaza durumu)
        │                                   └─ profiles.premium_plan + premium_until
        ▼
  Uygulama premium özellikleri profiles.premium_plan / premium_until'a bakar.
```

**Neden RevenueCat?** İki mağazaya tek entegrasyon; **receipt validation'ı sunucu tarafında
RevenueCat yapar**; yenileme/iptal/iade/billing-issue olaylarını tek webhook ile bildirir.
$2.5k/ay gelire kadar ücretsiz. Veri/webhook katmanı **sağlayıcı-bağımsız** (`apply_subscription_event`),
ileride doğrudan mağaza API'lerine geçilse bile DB mantığı değişmez.

---

## 2) Plan ↔ Entitlement ↔ Ürün eşlemesi

| Ahenk planı | premium_plan (DB) | RevenueCat entitlement | App Store ürün ID | Google Play ürün ID |
|---|---|---|---|---|
| Free | `free` | — | — | — |
| Plus | `plus` | `plus` | `ahenk_plus_monthly` (+ `_yearly`) | `ahenk_plus` / base plan `plus-monthly` |
| Premium Plus | `platinum` | `premium_plus` | `ahenk_premiumplus_monthly` (+ `_yearly`) | `ahenk_premiumplus` / base plan `premiumplus-monthly` |

> Jeton mağazasının verdiği geçici `gold` premium AYRI bir şeydir (jetonla, app içi). Abonelik
> webhook'u `gold`'a dokunmaz; yalnız `plus`/`platinum`'u yönetir.

---

## 3) Veritabanı (kurulu — `supabase/schema_v7_subscriptions.sql`)

- **`subscriptions`** — kullanıcının mağaza abonelik durumu (store, product_id, entitlement, plan,
  status, period_end, environment, raw). RLS: sahibi okur, yazma yalnız sunucu.
- **`subscription_events`** — işlenen olaylar (idempotency + denetim). Yalnız sunucu.
- **`apply_subscription_event(...)`** — idempotent fonksiyon: olayı kaydeder, `subscriptions`'ı
  upsert eder, `profiles.premium_plan` + `premium_until`'ı türetir. Aktiflik: `status='active'
  AND period_end>now AND plan∈(plus,platinum)`. Bitiş/iptal → planı `free`'ye düşürür.
- **`profiles.premium_plan` / `premium_until`** — uygulamanın okuduğu nihai entitlement.

Migration zaten çalıştırıldı. Yeniden kurulum: `node scripts/run-migrations.mjs` (SUPABASE_PAT ile).

---

## 4) Ortam değişkenleri

| Değişken | Nerede | Açıklama |
|---|---|---|
| `REVENUECAT_WEBHOOK_AUTH` | Sunucu (Vercel/.env.local) | Webhook `Authorization` header'ının beklenen değeri. Güçlü rastgele üret. |
| `NEXT_PUBLIC_RC_IOS_KEY` | Client | RevenueCat iOS public SDK anahtarı (`appl_...`). |
| `NEXT_PUBLIC_RC_ANDROID_KEY` | Client | RevenueCat Android public SDK anahtarı (`goog_...`). |
| `CAP_SERVER_URL` | Capacitor build | Native kabuğun yükleyeceği site URL'i (production domain). |

> `REVENUECAT_WEBHOOK_AUTH` **yalnız sunucu** (NEXT_PUBLIC_ değil). RC public anahtarları client'ta
> görünür olması normaldir (zaten "public" anahtardır; gizli olan RevenueCat secret API key yalnız
> RC dashboard'da kalır).

---

## 5) RevenueCat kurulumu

1. https://www.revenuecat.com → hesap aç → **New Project** ("Ahenk").
2. **Project Settings → API Keys**: iOS (`appl_...`) ve Android (`goog_...`) **public** anahtarlarını al →
   `.env.local` / Vercel'e `NEXT_PUBLIC_RC_IOS_KEY` ve `NEXT_PUBLIC_RC_ANDROID_KEY` olarak gir.
3. **Entitlements** oluştur (Project → Entitlements):
   - `plus`
   - `premium_plus`
4. **Products** ekle (her mağaza ürününü RevenueCat'e tanıt — App Store + Play Console ID'leriyle,
   bölüm 6 ve 7). Her ürünü doğru entitlement'a bağla:
   - `ahenk_plus_monthly`, `ahenk_plus_yearly` → entitlement **plus**
   - `ahenk_premiumplus_monthly`, `ahenk_premiumplus_yearly` → entitlement **premium_plus**
5. **Offerings** (Project → Offerings) → `default` offering → paketler ekle:
   - paket identifier `plus_monthly` → product `ahenk_plus_monthly`
   - paket identifier `premiumplus_monthly` → product `ahenk_premiumplus_monthly`
   - (paket id'leri client'taki `packageToPlan()` ile uyumlu: "premium"/"platinum" içeren → platinum, diğeri → plus)
6. **Webhook** (Project Settings → Integrations → Webhooks → Add):
   - URL: `https://<domain>/api/webhooks/revenuecat`
   - **Authorization header**: `REVENUECAT_WEBHOOK_AUTH` ile AYNI değer.
   - Tüm abonelik olaylarını gönder (initial purchase, renewal, cancellation, expiration, billing issue...).
7. App Store ve Play Console kimlik bilgilerini RevenueCat'e bağla (Project Settings → Apps):
   - **App Store**: App-Specific Shared Secret + App Store Connect API key (server notifications için).
   - **Play**: Google Play service account JSON (Play Developer API erişimi).

---

## 6) App Store Connect ürünleri (oluşturulacaklar)

**App Store Connect → Uygulaman → Monetization → Subscriptions:**

1. **Subscription Group** oluştur: `Ahenk Premium` (aynı grupta kullanıcı tek aktif abonelik tutar; yükseltme/düşürme grup içinde olur).
2. Grup içine **auto-renewable subscription** ürünleri:

| Referans adı | Product ID | Süre | Fiyat (öneri) |
|---|---|---|---|
| Ahenk Plus (Aylık) | `ahenk_plus_monthly` | 1 ay | ₺99 |
| Ahenk Plus (Yıllık) | `ahenk_plus_yearly` | 1 yıl | ₺799 |
| Ahenk Premium Plus (Aylık) | `ahenk_premiumplus_monthly` | 1 ay | ₺349 |
| Ahenk Premium Plus (Yıllık) | `ahenk_premiumplus_yearly` | 1 yıl | ₺2.799 |

3. Her ürüne **lokalizasyon** (TR isim/açıklama) + **inceleme ekran görüntüsü** ekle.
4. **App Store Server Notifications V2** URL'ini RevenueCat'in verdiği adrese ayarla (RevenueCat App ayarlarında gösterir).
5. **Sandbox tester** hesabı oluştur (Users and Access → Sandbox) — test satın alması için.

---

## 7) Google Play Console ürünleri (oluşturulacaklar)

**Play Console → Uygulaman → Monetize → Products → Subscriptions:**

| Ürün (subscription) | Product ID | Base plan ID | Süre | Fiyat (öneri) |
|---|---|---|---|---|
| Ahenk Plus | `ahenk_plus` | `plus-monthly` | 1 ay | ₺99 |
|  |  | `plus-yearly` | 1 yıl | ₺799 |
| Ahenk Premium Plus | `ahenk_premiumplus` | `premiumplus-monthly` | 1 ay | ₺349 |
|  |  | `premiumplus-yearly` | 1 yıl | ₺2.799 |

1. Her subscription için base plan(lar) + **offer** (isteğe bağlı deneme/indirim) tanımla.
2. **Real-time Developer Notifications (RTDN)**: Play Console → Monetization setup → Pub/Sub topic'i
   RevenueCat'in verdiği topic ile bağla (RevenueCat App ayarlarında gösterir).
3. **License testers** ekle (Setup → License testing) — test satın alması ücretsiz olur.
4. Play **service account** oluştur, Play Developer API erişimi ver, JSON'u RevenueCat'e yükle.

---

## 8) Capacitor native kurulum

> Ahenk SSR Next.js'tir (statik export edilemez) → native kabuk **barındırılan siteyi** yükler.

```bash
# platform paketleri (web build'e gerek yok; native için):
npm install @capacitor/ios @capacitor/android

# native projeleri oluştur (macOS+Xcode iOS için şart; Android için Android Studio):
npx cap add ios
npx cap add android

# capacitor.config.ts içinde server.url'i ayarla (CAP_SERVER_URL ile veya doğrudan domain).
# her değişiklikten sonra:
npx cap sync
```

- `capacitor.config.ts` zaten hazır (`server.url`, RevenueCat eklentisi otomatik bağlanır).
- **iOS**: Xcode → Signing & Capabilities → **In-App Purchase** capability ekle.
- **Android**: Play Billing izinleri RevenueCat eklentisiyle gelir; `minSdkVersion` ≥ 24.
- Geliştirmede `CAP_SERVER_URL=http://<LAN-IP>:3000` ile yerel dev sunucusunu cihazda test edebilirsin.

**App Store "sadece web sarmalayıcı" notu:** Native abonelik (StoreKit), gerçek işlevsellik ve
push/native özellikler olduğu için Ahenk Guideline 4.2'yi karşılar. Yine de incelemede native
hissi güçlendirmek için splash/ikon/native geçişler önerilir.

---

## 9) Receipt validation mimarisi

- **Doğrulama RevenueCat'te**: kullanıcı satın alınca StoreKit/Play Billing makbuzu RevenueCat'e
  gider, RevenueCat Apple/Google ile **sunucu-sunucu doğrular**, entitlement üretir.
- **Bizim güven sınırımız**: yalnız **Authorization header'ı doğru** olan webhook'ları işleriz
  (`/api/webhooks/revenuecat`), ve olayı **idempotent** uygularız (`event_id` benzersiz).
- **İstemciye güven yok**: premium durumu ASLA client'tan yazılmaz; yalnız webhook → `apply_subscription_event`
  → `profiles`. (Eski demo client-yazımı kaldırıldı.)
- **Çift güvence (opsiyonel)**: kritik akışta `GET https://api.revenuecat.com/v1/subscribers/{app_user_id}`
  (RC secret API key ile) çağrılıp entitlement teyit edilebilir.

---

## 10) Test

- **DB fonksiyonu**: `apply_subscription_event` idempotency + grant/expire testten geçti.
- **Webhook HTTP**: yanlış auth → 401; geçerli satın alma → `profiles.premium_plan='platinum'`;
  expiration → `free` (yerelde doğrulandı).
- **Native satın alma**: Sandbox (iOS) / License tester (Android) ile gerçek cihazda dene →
  RevenueCat dashboard'da event görünür → webhook → DB güncellenir → uygulamada plan aktif.
- **Web**: satın alma yok; premium sayfası "Mobil uygulamadan abone ol" gösterir.

Detaylı production adımları: **MOBILE-LAUNCH.md**.
