# Ahenk — Jeton Satın Alma (Ödeme Entegrasyonu)

Jeton satın alma **iki modda** çalışır:

| Mod | Ne zaman | Davranış |
|---|---|---|
| **Demo** (varsayılan) | `STRIPE_SECRET_KEY` **yokken** | Satın al → jeton **anında** yüklenir (gerçek para alınmaz). Test/geliştirme için. |
| **Production** | `STRIPE_SECRET_KEY` **varken** | Satın al → Stripe Checkout'a yönlenir → ödeme onayında jeton webhook ile yüklenir. |

Kod tarafı zaten hazır; production'a geçmek için **yalnız anahtar + paket kurulumu** yeterli — uygulama kodunu değiştirmene gerek yok.

---

## 1) Akış (production)

```
Kullanıcı /cuzdan → "Satın al"
   → POST /api/store/buy-jeton  (sunucu Checkout oturumu açar, paket fiyatı SUNUCUDA sabit)
   → Stripe Checkout sayfası (kart bilgisi Stripe'ta, bizde DEĞİL)
   → ödeme başarılı → Stripe → POST /api/webhooks/stripe
        → imza doğrulanır → award_jeton(user, 'stripe:<session_id>', jeton)  ← idempotent
   → kullanıcı /cuzdan?satin=ok sayfasına döner, jeton birkaç sn içinde görünür
```

**Neden webhook'ta kredilendiriyoruz?** Çünkü tek güvenilir "ödeme gerçekten alındı" sinyali odur.
`success_url`'e dönmek ödeme garantisi değildir (kullanıcı URL'i taklit edebilir).

---

## 2) Stripe kurulumu (adım adım)

1. **Hesap:** https://stripe.com → kayıt ol (Türkiye için hesap onayı gerekebilir; alternatif: iyzico, aşağıda).
2. **Paket kur:** `npm install stripe` (proje kökünde).
3. **Secret key:** Stripe Dashboard → Developers → API keys → **Secret key** (`sk_live_...` / test için `sk_test_...`).
4. **Webhook ekle:** Dashboard → Developers → Webhooks → **Add endpoint**:
   - URL: `https://<senin-domainin>/api/webhooks/stripe`
   - Event: **`checkout.session.completed`**
   - Oluşunca **Signing secret**'i kopyala (`whsec_...`).
5. **Env değişkenleri** (Vercel → Project Settings → Environment Variables, veya yerelde `.env.local`):
   ```
   STRIPE_SECRET_KEY=sk_live_xxx
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   ```
6. **Deploy / restart** et. Artık `/cuzdan`'da "Satın al" Stripe Checkout açar.
7. **Test:** Stripe test modunda `4242 4242 4242 4242` test kartıyla ödeme yap → webhook tetiklenir → jeton yüklenir.

> 🔐 `STRIPE_SECRET_KEY` ve `STRIPE_WEBHOOK_SECRET` **yalnız sunucu** değişkenleridir — `NEXT_PUBLIC_` öneki YOK, istemciye sızmaz.

---

## 3) Paketler (sunucu-otoritesi)

Fiyat/jeton miktarı **sunucuda** sabittir (istemci değiştiremez):
`app/api/store/buy-jeton/route.ts → PACKAGES`

| id | Jeton | Fiyat |
|---|---|---|
| p100 | 100 | ₺29 |
| p300 | 300 | ₺69 (popüler) |
| p750 | 750 | ₺149 |
| p2000 | 2000 | ₺299 |

Fiyatı/jetonu değiştirmek için yalnız bu tabloyu güncelle (UI: `app/(app)/cuzdan/page.tsx → PACKAGES`).

---

## 4) iyzico (Türkiye yerel alternatifi)

iyzico TL tahsilatında yaygın. Geçiş için **yalnız iki blok** değişir, gerisi (jeton kredilendirme) aynı kalır:

1. `app/api/store/buy-jeton/route.ts` içindeki **Stripe Checkout oturumu açma** bloğunu iyzico
   "Checkout Form initialize" çağrısıyla değiştir (iyzico Node SDK: `npm i iyzipay`).
2. `app/api/webhooks/stripe/route.ts` yerine bir **iyzico callback** route'u (`/api/webhooks/iyzico`)
   ekle; ödeme doğrulandıktan sonra **aynı** `award_jeton(user, 'iyzico:<paymentId>', jeton)` çağrısını yap.
   (Middleware'de `/api/webhooks` zaten PUBLIC.)

Kredilendirme noktası tek (`award_jeton`, idempotent), bu yüzden sağlayıcı değişse de jeton mantığı bozulmaz.

---

## 5) Güvenlik özeti

- **Fiyat sunucuda** — istemci paket/fiyat manipüle edemez.
- **İdempotent kredilendirme** — `award_jeton` `(user_id, key)` benzersizdir; `key='stripe:<session_id>'`
  olduğundan webhook tekrarları çift jeton yüklemez.
- **İmza doğrulama** — webhook `stripe.webhooks.constructEvent` ile doğrulanır; sahte istek reddedilir.
- **Webhook public, gerisi korumalı** — `lib/supabase/middleware.ts → PUBLIC_PATHS` yalnız `/api/webhooks`'u açar.
