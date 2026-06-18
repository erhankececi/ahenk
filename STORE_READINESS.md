# Ahenk — App Store / Play Store Hazırlık Envanteri

> Bu dosya yalnızca **durum tespiti**dir; kod değiştirmez. Mobil mağaza
> başvurusundan önce hazır/eksik olanları ve gereken ekran görüntülerini listeler.
> Mimari model: **hosted-shell** — native kabuk (Capacitor) barındırılan siteyi
> `server.url` ile yükler; IAP native tarafta RevenueCat ile çalışır.

## 1) Altyapı — HAZIR ✅

| Alan | Durum | Not |
|------|-------|-----|
| Capacitor 6 | ✅ kurulu | `@capacitor/core`, `cli`, `android`, `ios` (^6.2.1) |
| `capacitor.config.ts` | ✅ var | `appId: app.ahenk`, `appName: Ahenk`, `webDir: public`, `server.url` |
| IAP / abonelik | ✅ kodu hazır | `@revenuecat/purchases-capacitor` + `lib/purchases.ts` (native-only, web no-op); entitlement webhook → `apply_subscription_event` |
| cap scriptleri | ✅ | `cap:sync`, `cap:ios`, `cap:android` |
| PWA manifest | ✅ | `public/manifest.webmanifest` (name/short_name/standalone/portrait/theme `#0E0D10`) |
| Service worker | ✅ | `public/sw.js` (push + notification handler) |
| Web push | ✅ kodu hazır | `lib/push.ts` (VAPID/`web-push`, env yoksa no-op) |
| Auth | ✅ | E-posta+şifre + Google OAuth (Supabase), e-posta doğrulama, `/auth/callback` |
| Yasal sayfalar | ✅ | `/gizlilik`, `/kvkk`, `/kosullar`, `/guvenlik`, **`/hesap-sil` (mağaza zorunlu hesap silme)** |
| Moderasyon | ✅ | Engelle/şikayet (SafetyMenu), 6 şikayet nedeni |
| Çok dil | ✅ | tr/en/ku tüm uygulamada; `<html lang/dir>` dinamik |
| Güvenlik başlıkları | ✅ | `next.config.mjs` securityHeaders |

## 2) Mağaza başvurusu öncesi — EKSİK / YAPILACAK ⚠️

1. **Native platform klasörleri** — ✅ **Android oluşturuldu** (`android/`,
   `npx cap add android` + `cap sync` + `@capacitor/assets generate`: 136 asset,
   ic_launcher/adaptive/splash tüm yoğunluklarda; app_name=Ahenk, applicationId=app.ahenk,
   server.url=ahenk.live). ⏳ **iOS bekliyor** — `npx cap add ios` macOS + Xcode gerektirir.
   - ⚠️ Android **APK/gradle derlemesi bu ortamda yapılamadı**: JAVA_HOME / ANDROID_HOME
     tanımsız, `local.properties` yok ve Gradle bağımlılıkları ağ-kısıtlı proxy'den
     çekilemiyor. Derleme için Android Studio + JDK 17 + Android SDK olan bir makine:
     `npx cap open android` → Gradle sync → Run/Build APK.
2. **✅ server.url uyuşmazlığı DÜZELTİLDİ** — `capacitor.config.ts` `server.url`
   varsayılanı artık `https://ahenk.live` (önceden yanlışlıkla `ahenk.app`'ti).
   `CAP_SERVER_URL` env ile override edilebilir.
3. **Raster app ikonları yok** — şu an sadece SVG. Mağaza PNG ister:
   - iOS AppIcon 1024×1024; Android adaptive icon (foreground+background) 512×512.
4. **Splash görselleri** — yalnız `splash.svg`. `@capacitor/splash-screen` + raster.
5. **IAP ürünleri** — App Store Connect + Google Play Console'da abonelik ürünleri
   tanımlanmalı; RevenueCat offering/entitlement eşleşmesi; RC API anahtarları
   (`NEXT_PUBLIC_RC_IOS_KEY`, `NEXT_PUBLIC_RC_ANDROID_KEY`) set edilmeli.
6. **Native push** — şu an yalnız web push (VAPID). Android FCM + iOS APNs +
   `@capacitor/push-notifications` token kaydı entegre edilmeli.
7. **Deep link / Universal Links / App Links** — yapılandırılmamış (applinks/assetlinks yok).
   OAuth dönüşü ve paylaşım linklerinin uygulamaya dönmesi için gerekli.
8. **🍎 Apple Sign-In** — Apple Guideline 4.8: 3. taraf giriş (Google) sunan
   uygulamalar genelde "Sign in with Apple" da sunmalı. Şu an yok → iOS reddine
   yol açabilir. iOS için eklenmesi değerlendirilmeli.
9. **OAuth WebView kısıtı** — Google, gömülü WebView'de OAuth'u engelleyebilir
   ("disallowed_useragent"). Hosted-shell'de Custom Tab / ASWebAuthenticationSession
   ile test edilmeli.
10. **Mağaza metadatası** — gizlilik URL'i (`/gizlilik` ✅), Play "Data safety" formu,
    Apple privacy nutrition labels, yaş sınırı (18+ dating), içerik hakları.

## 3) Ekran görüntüsü listesi (TR; EN locale opsiyonel)

Apple: 6.7" + 6.5" iPhone (zorunlu), 12.9" iPad (iPad destekleniyorsa).
Google Play: telefon (min 2), 7"/10" tablet opsiyonel.

1. **Landing / İlk açılış** — "Karakter önce, yüz sonra" hero
2. **Keşfet** — bulanık fotoğraf + uyum halkası (imza konsept)
3. **Profil** — kimlik kartı + sekmeler
4. **Sohbet** — kademeli netlik (reveal) ile mesajlaşma
5. **Premium** — üyelik kartı + planlar
6. **Cüzdan** — jeton bakiyesi + paketler
7. **Hediye Mağazası** — sinematik hediye grid'i
8. **Moments** — içerik akışı
9. **Liderlik** veya **Etkinlikler** — sosyal katman
10. **Onboarding** — profil oluşturma akışı

> Not: Keşfet/Sohbet ekran görüntülerinde gerçek kullanıcı fotoğrafı yerine
> bulanık/temsili görsel kullan (mahremiyet + mağaza içerik kuralı).

## 4) Android auth / OAuth test planı (hosted-shell)

Native kabuk siteyi `server.url = https://ahenk.live` ile **gömülü WebView**'de yükler.
OAuth çağrısı: `signInWithOAuth({ provider:'google', redirectTo: location.origin + '/auth/callback' })`
→ hosted-shell'de `redirectTo = https://ahenk.live/auth/callback`. `/auth/callback`
PKCE `code` → `exchangeCodeForSession` (server-side, cookie/SSR) veya e-posta `token_hash`
→ `verifyOtp`.

### Test senaryoları (Android cihaz/emülatör)

| # | Senaryo | Beklenen | Risk |
|---|---------|----------|------|
| 1 | E-posta/şifre giriş | `/kesfet`'e iner | ✅ WebView içi, dış tarayıcı yok — sorunsuz |
| 2 | Register (e-posta) | Doğrulama maili gönderilir | ✅ akış WebView içi |
| 3 | E-posta doğrulama linkine tıkla | Hesap doğrulanır | ⚠️ Link **dış tarayıcıda** açılır; App Links yoksa app'e dönmez. Kullanıcı tarayıcıda doğrulayıp app'e dönüp giriş yapabilir (token_hash cihazdan bağımsız) |
| 4 | **Google ile giriş** | Google hesabı seçilir, app'e döner | 🔴 **disallowed_useragent**: accounts.google.com gömülü WebView'de açılınca Google engeller ("bu tarayıcı güvenli olmayabilir") |
| 5 | Logout → tekrar login | Oturum kapanır/açılır | ✅ (e-posta), 🔴 (Google, #4 ile aynı) |
| 6 | Paylaşım / derin link app'i açar | İçerik app'te açılır | ⚠️ App Links/scheme yok → tarayıcıda açılır |

### Native Google Sign-In — ✅ UYGULANDI (kod)

- `@codetrix-studio/capacitor-google-auth` eklendi + `cap sync android` (Android'de
  kayıtlı: 2 plugin).
- `lib/googleAuth.ts` → `googleSignIn()`: **web'de** mevcut `signInWithOAuth` (değişmedi),
  **native'de** `GoogleAuth.signIn()` → `idToken` → `supabase.auth.signInWithIdToken`.
- `app/(auth)/login` ve `register` `google()` bu helper'ı çağırır; native başarıda
  `router.push('/')`, hata olunca i18n `googleFailed` mesajı.
- `capacitor.config.ts` → `plugins.GoogleAuth.serverClientId = process.env.GOOGLE_SERVER_CLIENT_ID`
  (**secret değil, env'den; hardcode yok**).

### Çalışması için gereken Google Cloud / env kurulumu (kod dışı)

1. **Android OAuth client** (Google Cloud Console → Credentials):
   - Application type: **Android**
   - Package name: **`app.ahenk`**
   - SHA-1 (ve istenirse SHA-256): debug için `keytool -list -v -keystore ~/.android/debug.keystore`
     (parola `android`); release için imzalama anahtarının SHA-1'i.
2. **Web OAuth client** — Supabase Google provider'da tanımlı olan WEB client ID.
   Bu değer iki yere girilir (aynı ID):
   - `GOOGLE_SERVER_CLIENT_ID` (capacitor.config → Android native `serverClientId`)
   - `NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID` (`GoogleAuth.initialize` clientId)
3. Supabase Auth → Google provider zaten açık olmalı (web OAuth için). signInWithIdToken,
   token audience'ı bu web client ID ile doğrular.

> Env değerleri girilene kadar native Google girişi çalışmaz ama **web OAuth ve
> e-posta/şifre akışı etkilenmez** (graceful: serverClientId boşsa native no-op gibi).

### Alternatif (uygulanmadı)

- `@capacitor/browser` ile sistem tarayıcısı/Custom Tab + `skipBrowserRedirect:true` +
  `App.appUrlOpen` deep link. Native plugin akışı tercih edildi (daha az redirect/deep-link bağımlılığı).
- **⚠️ Geri dönüş (callback) deep link** — `https://ahenk.live/auth/callback`'in app'e
  dönmesi için **Android App Links** (`.well-known/assetlinks.json` + `intent-filter
  autoVerify`) ya da custom scheme (`app.ahenk://`) gerekir. Şu an yok.
- **Not (config):** `capacitor.config` `server.allowNavigation`'a `accounts.google.com`
  eklemek WebView'in Google'a gitmesine izin verir ama **disallowed_useragent
  politikasını AŞMAZ** — gerçek çözüm yukarıdaki native/sistem-tarayıcı akışıdır.
  Bu yüzden yarım bir config eklenmedi.

> E-posta/şifre akışı Android hosted-shell'de **çalışır**; mağaza öncesi tek
> kritik auth işi Google için native/sistem-tarayıcı entegrasyonu + callback deep link.

## 5) Özet

Web tarafı yayında ve mağaza-uyumlu temeller (IAP kodu, hesap silme, moderasyon,
yasal sayfalar, çok dil) **hazır**. Native build için kritik yol:
**(a)** server.url'i ahenk.live'a hizala → **(b)** `cap add ios/android` →
**(c)** raster ikon/splash → **(d)** IAP ürünleri + RC anahtarları →
**(e)** Apple Sign-In + native push + deep link. iOS için macOS/Xcode şart.
