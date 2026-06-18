# Ahenk — Android Build & Smoke Test Rehberi

> Capacitor **hosted-shell** modeli: native kabuk canlı siteyi (`server.url =
> https://ahenk.live`) WebView'de yükler. APK içinde web bundle yok; RevenueCat IAP
> ve Google Sign-In native tarafta çalışır. Bu rehber gerçek cihazda test için.

## 1) Gereksinimler

| Araç | Sürüm |
|------|-------|
| Node.js | 18+ (web/CLI) |
| **JDK** | **17** (Gradle 8 / AGP 8 için) |
| Android Studio | Hedgehog (2023.1)+ |
| Android SDK | compileSdk **34**, targetSdk **34**, minSdk **22** (bkz. `android/variables.gradle`) |
| Cihaz/emülatör | Android 7.0 (API 24)+ önerilir; Google Play Services kurulu (Google Sign-In için) |

> ⚠️ **Play uyarısı:** Google Play yeni uygulamalarda **targetSdk 35** isteyebilir
> (Android 15). Mağaza başvurusundan önce `android/variables.gradle`'da
> `compileSdkVersion`/`targetSdkVersion` = 35 yap + ilgili SDK'yı kur.

## 2) Lokal build adımları

```bash
# 0) Bağımlılıklar (native plugin'ler dahil)
npm install

# 1) Web doğrulaması (hosted-shell siteyi yükler; yine de tip/derleme kontrolü)
npm run build

# 2) Web assets + plugin'leri Android projeye senkronla
npx cap sync android

# 3) Android Studio'da aç
npx cap open android
#    → Android Studio: Gradle sync (otomatik) → cihaz seç →  ▶ Run  (debug APK)

# CLI ile debug APK (Android Studio olmadan):
cd android && ./gradlew assembleDebug
#    çıktı: android/app/build/outputs/apk/debug/app-debug.apk
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

### Release (AAB — Play'e yükleme) notu

```bash
cd android && ./gradlew bundleRelease
#    çıktı: android/app/build/outputs/bundle/release/app-release.aab
```

- İmzalama: **Play App Signing** önerilir (upload key ile imzala, Play yeniden imzalar).
- Upload key SHA-256'sını App Links için `ANDROID_SHA256_FINGERPRINTS`'e ekle
  (bkz. STORE_READINESS.md → App Links).
- `versionCode`/`versionName` `android/app/build.gradle`'da artırılır.

## 3) Gerekli env değişkenleri

> Web env'leri **Vercel'de** (site `ahenk.live`); native build native env değil,
> siteyi yüklediği için sunucu env'lerini kullanır. Yalnız Google `serverClientId`
> capacitor.config build-time okunur (`GOOGLE_SERVER_CLIENT_ID`).

| Env | Nerede | Açıklama |
|-----|--------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel | Supabase bağlantısı (zorunlu) |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel | Sunucu admin işlemleri |
| `CAP_SERVER_URL` | (opsiyonel) | capacitor.config server.url override (varsayılan https://ahenk.live) |
| `GOOGLE_SERVER_CLIENT_ID` | build env | Native Google Sign-In serverClientId = WEB client ID |
| `NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Vercel | GoogleAuth.initialize clientId (aynı WEB client ID) |
| `ANDROID_SHA256_FINGERPRINTS` | Vercel | App Links assetlinks.json parmak izleri (virgülle çoklu) |
| `NEXT_PUBLIC_RC_ANDROID_KEY` | Vercel | RevenueCat Android API key (IAP) |
| `NEXT_PUBLIC_RC_IOS_KEY` | Vercel | RevenueCat iOS API key (IAP) |
| `REVENUECAT_WEBHOOK_AUTH` | Vercel | RC webhook doğrulama |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` | Vercel | Web push |
| `NEXT_PUBLIC_TURN_URL` / `_USER` / `_CRED` | Vercel | WebRTC TURN (sesli/görüntülü) |
| `NEXT_PUBLIC_GIPHY_KEY` | Vercel | GIF seçici |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Vercel | (web jeton satın alma; native IAP RC üzerinden) |
| `CRON_SECRET` | Vercel | Günlük hatırlatma cron koruması |

> Native Google girişi yalnız `GOOGLE_SERVER_CLIENT_ID` + `NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID`
> dolu + Google Cloud'da Android OAuth client (package app.ahenk + SHA-1) tanımlıyken çalışır.

## 4) Smoke test kontrol listesi (cihaz/emülatör)

**Açılış & shell**
- [ ] Uygulama açılır, splash (onyx + pirinç logo) görünür, ardından ahenk.live yüklenir
- [ ] İkon launcher'da doğru (adaptive, onyx/pirinç)
- [ ] Geri tuşu WebView geçmişinde gezinir, kök ekranda çıkış davranışı makul

**Dil (i18n)**
- [ ] Ayarlar → dil TR/EN/KU değiştir → arayüz değişir, yeniden açılışta korunur

**Auth**
- [ ] E-posta/şifre giriş → Keşfet'e iner
- [ ] Kayıt (e-posta) → doğrulama maili → linkten/uygulamadan doğrulama → giriş
- [ ] **Google ile giriş** → native hesap seçici açılır (WebView'de değil), giriş olur
- [ ] Çıkış → tekrar giriş

**Çekirdek akışlar**
- [ ] Keşfet kartları yüklenir, beğen/geç/süper çalışır
- [ ] Sohbet aç, mesaj gönder, gerçek-zamanlı gelir
- [ ] Moments akışı + yorum + beğeni
- [ ] Cüzdan açılır; **Premium ekranı native'de IAP paketlerini gösterir** (RC anahtarları + Play ürünleri varsa)
- [ ] Hediye mağazası açılır, hediye gönderme animasyonu

**Bildirim & izinler**
- [ ] Sesli/görüntülü arama izinleri (mikrofon/kamera) istenir ve çalışır
- [ ] (Native push entegre edilince) FCM token kaydı + bildirim

**App Links** (bkz. STORE_READINESS.md)
- [ ] `adb shell am start -a android.intent.action.VIEW -d "https://ahenk.live/u/<id>" app.ahenk` uygulamayı açar (parmak izi girildikten sonra)

## 5) Sık sorunlar

- **Beyaz ekran / yüklenmiyor:** `server.url` (ahenk.live) erişilebilir mi; `cleartext`
  yalnız geliştirmede gerekli.
- **Google "disallowed_useragent":** native plugin yerine WebView OAuth'a düşülmüş;
  `GOOGLE_SERVER_CLIENT_ID`/`NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID` ve Android OAuth client'ı kontrol et.
- **IAP paketleri boş:** RC API anahtarları + Play Console abonelik ürünleri + RC offering eşleşmesi.
- **Gradle/JDK hatası:** JDK 17 kullan (`JAVA_HOME`), Android SDK'yı `local.properties`/Studio ayarla.
