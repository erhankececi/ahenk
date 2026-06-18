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

1. **Native platform klasörleri yok** — `android/` ve `ios/` üretilmemiş.
   - `npx cap add ios` (macOS + Xcode gerekli) ve `npx cap add android` (Android Studio).
2. **🔴 server.url uyuşmazlığı** — `capacitor.config.ts` → `https://ahenk.app`,
   ama production domain **`ahenk.live`**. Native kabuk yanlış siteyi yükler.
   Başvurudan önce `CAP_SERVER_URL`/config canlı domaine hizalanmalı.
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

## 4) Özet

Web tarafı yayında ve mağaza-uyumlu temeller (IAP kodu, hesap silme, moderasyon,
yasal sayfalar, çok dil) **hazır**. Native build için kritik yol:
**(a)** server.url'i ahenk.live'a hizala → **(b)** `cap add ios/android` →
**(c)** raster ikon/splash → **(d)** IAP ürünleri + RC anahtarları →
**(e)** Apple Sign-In + native push + deep link. iOS için macOS/Xcode şart.
