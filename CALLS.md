# Ahenk — Sesli & Görüntülü Görüşme (WebRTC)

Eşleşen kullanıcılar arasında **P2P** sesli/görüntülü arama. Medya sunucudan geçmez;
yalnız sinyalizasyon (SDP/ICE) Supabase Realtime üzerinden taşınır.

## 1) Mimari

```
Arayan (ChatWindow ▸ 📞/🎥)
  └─ rpc start_call(match, type)   → izin: eşleşme + çift-yönlü blok + plan + rate-limit
       (DB: calls satırı 'ringing')
  └─ Realtime broadcast kanalı: call-<callId>  (SDP offer/answer + ICE)

Aranan (CallProvider, app genelinde)
  └─ postgres_changes(calls INSERT, callee=me) → Gelen arama ekranı
  └─ Kabul → rpc answer_call → kanala katıl → 'ready' → offer/answer → P2P bağlantı

Bitiş: rpc end_call(status) → süre + geçmiş (calls). Karşıya 'end' broadcast.
```

- **İzin (server-side, `start_call`):** Free yok · Plus sesli · Premium Plus sesli+görüntülü (jeton `gold` = sesli). Yalnız eşleşen + engelli olmayan; aynı sohbette tek aktif arama; **rate-limit 5/60sn**.
- **Güvenlik:** `calls` RLS yalnız taraflara açık; yazma yalnız `SECURITY DEFINER` fonksiyonlar. İstemci doğrudan arama satırı yazamaz/güncelleyemez.
- **Kayıt:** Her arama `calls` tablosunda (tip, durum, süre, zaman). Geçmiş sohbet menüsünden görünür.

## 2) Dosyalar
- DB: `supabase/schema_v10_calls.sql` (calls + start/answer/end + RLS + Realtime publication + indeksler).
- Client: `lib/webrtc.ts` (CallManager: RTCPeerConnection + medya + sinyalizasyon), `components/call/CallProvider.tsx` (global gelen-arama + arama ekranları), `components/ChatWindow.tsx` (arama butonları + geçmiş), `app/(app)/layout.tsx` (CallProvider sarmalı).

## 3) TURN / STUN (ZORUNLU rapor)

WebRTC P2P bağlantı için ICE sunucuları gerekir:

| Tür | Ne işe yarar | Ahenk |
|---|---|---|
| **STUN** | Cihazın genel IP'sini keşfeder; çoğu ev/wifi NAT'ını çözer. | Ücretsiz `stun:stun.l.google.com:19302` (kodda varsayılan). |
| **TURN** | Simetrik NAT / mobil operatör / kurumsal güvenlik duvarı arkasında medyayı **röleler**. STUN yetmezse TEK çözüm. | **Gerekli** (özellikle mobilde). ENV ile girilir. |

> Gerçek dünyada (özellikle iki taraf da mobil veri üzerindeyse) **TURN olmadan aramaların %20-40'ı bağlanmaz**. Production'da TURN şart.

**Önerilen TURN sağlayıcıları (yönetilen, düşük ops):**
- **Metered.ca** — ücretsiz katman + basit kurulum (öneri: başlangıç).
- **Twilio Network Traversal Service** — kullanım başına, güvenilir.
- **Cloudflare Calls (TURN)** — ucuz/ölçekli.
- Self-host: **coturn** (VPS + domain + TLS) — en ucuz ama ops yükü.

**ENV (client — `NEXT_PUBLIC_` çünkü tarayıcı ICE'e koyar):**
```
NEXT_PUBLIC_TURN_URL=turn:global.turn.metered.ca:80
NEXT_PUBLIC_TURN_USER=<turn-username>
NEXT_PUBLIC_TURN_CRED=<turn-credential>
```
> TURN credential'ı client'a açılır (WebRTC gereği). Güvenlik için sağlayıcının **kısa ömürlü (ephemeral) credential** özelliğini kullan (Twilio/Metered destekler); statik şifre yerine zaman sınırlı token üret.

## 4) Capacitor (native) notu
- `getUserMedia` ve WebRTC native WebView'de çalışır; **iOS Info.plist**'e `NSCameraUsageDescription` + `NSMicrophoneUsageDescription`, **Android**'e `CAMERA` + `RECORD_AUDIO` izinleri eklenir (native build adımı).
- Ön/arka kamera `switchCamera()` ile (`facingMode`), hoparlör yönlendirmesi native'de daha tutarlı.

## 5) Test
- **İzin/güvenlik mantığı** (SQL): start_call free→ret, plus→sesli ok, video→ret, platinum→video ok, eşleşmesiz/blok→ret, answer/end → **test edildi**.
- **Medya akışı**: iki gerçek cihaz/tarayıcı + STUN (yerel ağda) ile denenir; farklı ağlarda **TURN** gerekir. İki sekme/iki cihazda eşleşmiş iki hesapla 📞/🎥 dene.
- **Build**: production build temiz (route'lar derleniyor).

## 6) Bilinen sınırlar / sonraki
- Grup arama yok (1:1 — `call_participants` gereksiz, eklenmedi).
- Hoparlör butonu web'de görseldir (`setSinkId` desteğine bağlı); native'de tam yönlendirme.
- Çağrı bildirimi uygulama açıkken çalışır; arka planda **push** (FCM/APNs) sonraki iterasyon.
