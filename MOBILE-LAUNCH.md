# Ahenk — Mobil Abonelik Production Launch Checklist

Sıfırdan, sırayla. Teknik detay: **SUBSCRIPTIONS.md**. Bu liste "ne yapacağım" sırasıdır.

---

## 0) Hesaplar (önce bunlar)
- [ ] **Apple Developer Program** — yıllık 99 USD (App Store yayını için şart).
- [ ] **Google Play Console** — tek seferlik 25 USD.
- [ ] **RevenueCat** — ücretsiz (2.5k USD/ay gelire kadar).
- [ ] Geliştirme makinesi: **iOS için macOS + Xcode şart**; Android için Android Studio (Win/Mac/Linux).

## 1) Backend (Supabase) — HAZIR
- [x] `subscriptions`, `subscription_events`, `apply_subscription_event` migration'ı çalıştı (v7).
- [x] `profiles.premium_plan` / `premium_until` entitlement kaynağı.
- [ ] Production Supabase'te de **17 migration**'ın tamamı çalıştı mı doğrula (`node scripts/run-migrations.mjs`).

## 2) RevenueCat
- [ ] Proje aç → iOS + Android **public API key**'leri al.
- [ ] Entitlements: `plus`, `premium_plus`.
- [ ] Products: 4 ürünü ekle (aylık/yıllık × plus/premium_plus), doğru entitlement'a bağla.
- [ ] Offering `default` + paketler (`plus_monthly`, `premiumplus_monthly`, varsa yıllık).
- [ ] Webhook ekle: `https://<domain>/api/webhooks/revenuecat`, Authorization = `REVENUECAT_WEBHOOK_AUTH`.
- [ ] App Store shared secret + ASC API key bağla; Play service account JSON yükle.

## 3) App Store Connect
- [ ] Uygulama kaydı oluştur (bundle id `app.ahenk`).
- [ ] Subscription Group `Ahenk Premium` + 4 auto-renewable ürün (bkz. SUBSCRIPTIONS.md §6).
- [ ] Her ürüne TR lokalizasyon + fiyat + inceleme görseli.
- [ ] App Store Server Notifications V2 → RevenueCat URL'i.
- [ ] Sandbox test hesabı oluştur.

## 4) Google Play Console
- [ ] Uygulama kaydı oluştur (package `app.ahenk`).
- [ ] 2 subscription + base plan'lar (bkz. SUBSCRIPTIONS.md §7).
- [ ] RTDN Pub/Sub topic → RevenueCat.
- [ ] License tester hesapları ekle.
- [ ] İlk kapalı test (internal testing) track'i oluştur.

## 5) Capacitor native build
- [ ] `npm install` (platform paketleri `@capacitor/ios` + `@capacitor/android` artık package.json'da).
- [ ] `capacitor.config.ts` → `server.url` = production domain (veya `CAP_SERVER_URL`).
- [ ] `npx cap add ios` / `npx cap add android` → `npm run cap:sync`
- [ ] **🔴 İZİNLER — ŞART. Eklenmezse foto gönderimi / sesli mesaj / sesli-görüntülü arama UYGULAMADA ÇALIŞMAZ:**
  - **iOS** `ios/App/App/Info.plist` (anahtar + açıklama):
    - `NSCameraUsageDescription` → "Sohbet fotoğrafı ve görüntülü görüşme için kamera erişimi."
    - `NSMicrophoneUsageDescription` → "Sesli mesaj ve sesli/görüntülü görüşme için mikrofon erişimi."
    - `NSPhotoLibraryUsageDescription` → "Galeriden fotoğraf seçmek için."
  - **Android** `android/app/src/main/AndroidManifest.xml` (`<manifest>` içine):
    - `<uses-permission android:name="android.permission.INTERNET" />`
    - `<uses-permission android:name="android.permission.CAMERA" />`
    - `<uses-permission android:name="android.permission.RECORD_AUDIO" />`
    - `<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />`
  - WebView getUserMedia izin diyalogları: Android'de Capacitor `onPermissionRequest`'i yönetir (manifest yeterli); iOS WKWebView için yukarıdaki Info.plist anahtarları şart.
- [ ] iOS: Xcode'da **In-App Purchase** capability + signing (Team) ayarla.
- [ ] Android: `minSdkVersion ≥ 24`, imzalama anahtarı (keystore) oluştur.
- [ ] Uygulama ikonu + splash (native his için).

### 5b) Push bildirim (native — FCM/APNs)
> Web push **hazır** (VAPID anahtarıyla çalışır: `.env` → `NEXT_PUBLIC_VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY`,
> `npm i web-push`). Native app web push'u DESTEKLEMEZ → FCM (Android) / APNs (iOS) gerekir.
- [ ] `npm i @capacitor/push-notifications` → `npx cap sync`
- [ ] **Firebase** projesi aç → Android `google-services.json` (android/app/), iOS APNs key/cert + `GoogleService-Info.plist`.
- [ ] Native kayıt: app açılışında `PushNotifications.requestPermissions()` + `register()` →
      `registration` event token'ını `push_subscriptions`'a (`platform='ios'|'android'`, `endpoint=token`) yaz.
      (Web tarafı `components/PushOptIn.tsx` deseniyle aynı; token'ı aynı tabloya kaydet.)
- [ ] **Gönderim:** `lib/push.ts` şu an WEB (web-push) gönderir. Native için FCM HTTP v1 sender ekle
      (Firebase service account JSON) veya OneSignal/RevenueCat-benzeri sağlayıcı kullan. Aynı
      tetik noktalarından (beğeni/eşleşme — `app/api/interact`) çağrılır.
- [ ] iOS: Xcode'da **Push Notifications** + **Background Modes (remote notifications)** capability.

## 6) Ortam değişkenleri (production)
- [ ] `REVENUECAT_WEBHOOK_AUTH` (güçlü rastgele) — Vercel + RevenueCat webhook aynı değer.
- [ ] `NEXT_PUBLIC_RC_IOS_KEY`, `NEXT_PUBLIC_RC_ANDROID_KEY` — Vercel.
- [ ] `NEXT_PUBLIC_SITE_URL` / domain doğru.
- [ ] Web ödeme (Stripe jeton) gerekiyorsa onun anahtarları (ayrı: PAYMENTS.md).

## 7) Uçtan uca test (yayından ÖNCE)
- [ ] iOS Sandbox tester ile `Plus` satın al → RevenueCat'te event → webhook 200 →
      `profiles.premium_plan='plus'` → uygulamada "Plus aktif".
- [ ] `Premium Plus` satın al → `platinum` oldu mu.
- [ ] Aboneliği iptal et / süresi dolsun → `free`'ye döndü mü (Sandbox hızlandırılmış yenileme).
- [ ] "Satın almaları geri yükle" çalışıyor mu (yeni cihaz/yeniden kurulum).
- [ ] Android License tester ile aynı akışları tekrarla.
- [ ] Webhook auth yanlışken 401 (güvenlik) — `Authorization` zorunlu.

## 8) Mağaza incelemesine gönder
- [ ] iOS: build'i Xcode/Transporter ile yükle → App Review'a abonelik ürünleriyle birlikte gönder.
      (Guideline 3.1.1 IAP, 4.2 minimum işlevsellik — native abonelik + gerçek özellikler ile uygun.)
- [ ] Android: kapalı test → açık test → production track.
- [ ] Gizlilik politikası + abonelik şartları (otomatik yenileme, fiyat, iptal) sayfalarını ekle (mağaza zorunluluğu).

## 9) Go-live doğrulama
- [ ] Gerçek (production) satın alma ile 1 tam akış test et (gerçek kart, küçük tutar/iade).
- [ ] RevenueCat dashboard → Production event akıyor.
- [ ] Webhook hata oranı %0; `subscription_events` doluyor.
- [ ] Premium gating doğru (ziyaretçiler, gizli mod vb. yalnız aktif premium'da).

## 10) Yayın sonrası izleme
- [ ] RevenueCat Charts: MRR, trial→paid, churn, billing issue.
- [ ] Billing issue / grace period olaylarında kullanıcıya bildirim akışı (sonraki iterasyon).
- [ ] İade (refund) olayında entitlement düşüşü doğru (webhook EXPIRATION/REFUND).
- [ ] Supabase `subscriptions` ile RevenueCat arasında periyodik mutabakat (haftalık).

---

### Hızlı durum
| Katman | Durum |
|---|---|
| DB (subscriptions + fonksiyon) | ✅ Hazır, test edildi |
| Webhook (`/api/webhooks/revenuecat`) | ✅ Hazır, HTTP test edildi |
| Plan/entitlement lib + premium UI | ✅ Hazır (web bilgilendirir, native satın alır) |
| Capacitor config + RC client | ✅ Kod hazır (native build senin makinende) |
| RevenueCat + mağaza ürünleri | ⏳ Senin hesap kurulumun (bu liste) |
| Native build + mağaza incelemesi | ⏳ Senin (Xcode/Android Studio + hesaplar) |
