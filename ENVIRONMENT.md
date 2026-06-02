# Ahenk — Ortam Değişkenleri & Servis Yapılandırması

> Bu doküman iki ayrı yapılandırma katmanını net ayırır:
> 1. **Uygulama (Next.js/Vercel) env değişkenleri** — `.env.local` / Vercel Project Settings.
> 2. **Supabase tarafı yapılandırma** — Supabase Dashboard (kod değil, panel ayarı).
>
> ⚠️ E-posta gönderimi (kayıt doğrulama, şifre sıfırlama) **uygulamada değil**, Supabase Auth
> tarafında olur. Bu yüzden SMTP kimlik bilgileri `.env.local`'e değil, **Supabase Dashboard'a**
> girilir. Aşağıda her ikisi de belgelenmiştir.

---

## 1) Uygulama env değişkenleri (`.env.local` / Vercel)

| Değişken | Zorunlu | Nerede kullanılır | Notlar |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | client + server + storage URL | Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | client + server (RLS arkasında) | Project Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | **yalnız sunucu** (admin/agregasyon, signed URL) | **Gizli!** İstemciye asla sızdırma. `NEXT_PUBLIC_` öneki YOK. |
| `NEXT_PUBLIC_SITE_URL` | ⚪ | OAuth/redirect (örnek dosyada) | Kod pratikte `location.origin` kullanıyor; ayrı domain senaryosunda doldur. |

**`service_role` güvenlik kuralı:** Yalnız `lib/supabase/server.ts → createAdminClient()` içinde,
yalnız sunucu (API route + server component) bağlamında okunur. `NEXT_PUBLIC_` öneki taşımadığı
için Next.js bunu istemci bundle'ına dahil etmez. Doğrulama: `grep -r SERVICE_ROLE app components`
yalnız `lib/supabase/server.ts`'i göstermeli.

---

## 2) Supabase Auth — Production SMTP (ZORUNLU)

### Neden gerekli?
Kayıt akışı (`app/(auth)/register/page.tsx` → `supabase.auth.signUp` + `emailRedirectTo`) bir
**doğrulama e-postası** gönderir. Supabase'in **yerleşik (built-in) e-posta servisi yalnız
geliştirme içindir**: paylaşımlı altyapı, **saatte ~2-4 e-posta** sınırı, yalnız proje üyelerine
gönderim ve düşük teslimat garantisi. 100 kullanıcılık kapalı betada bile bu limit ilk saat
dolar → yeni kayıtların doğrulama maili gelmez → kullanıcı içeri giremez. Bu yüzden **custom
SMTP şart**.

### Önerilen sağlayıcı: **Resend** (en az operasyon yükü)

| Sağlayıcı | Ücretsiz katman | Kurulum yükü | Teslimat | Karar |
|---|---|---|---|---|
| **Resend** | 3.000/ay (100/gün) | **En düşük** — panelden DNS kayıtları tek tık, tek SMTP cred | Yüksek (modern, dev-odaklı) | ✅ **SEÇİLEN** |
| Postmark | Yok (100 deneme) | Orta | Çok yüksek (transactional uzmanı) | İkincil — ücretsiz katman yok |
| SendGrid | 100/gün | Yüksek — ağır panel, paylaşımlı IP itibar riski | Orta (paylaşımlı IP'de değişken) | ❌ En çok ops |

**Gerekçe:** Resend en az DNS + en az panel ayarı + tek kimlik bilgisi ile çalışır; transactional
e-postada (doğrulama/şifre) teslimatı güçlü ve ücretsiz katmanı kapalı beta için fazlasıyla yeter.
Postmark teslimatta bir tık daha iyi ama ücretsiz katmanı yok (ops/maliyet artar). SendGrid en
yüksek kurulum ve itibar yönetimi yükünü getirir.

### Kurulum adımları (Resend → Supabase)

1. **Resend hesabı:** https://resend.com → kayıt ol.
2. **Domain doğrula:** Resend → Domains → Add Domain (örn. `mail.ahenk.app`). Resend'in verdiği
   **SPF + DKIM** TXT kayıtlarını alan adı DNS'ine ekle. (DMARC opsiyonel ama önerilir:
   `v=DMARC1; p=none; rua=mailto:dmarc@ahenk.app`.)
3. **SMTP kimlik bilgisi al:** Resend → API Keys / SMTP. Değerler:
   - Host: `smtp.resend.com`
   - Port: `465` (SSL) veya `587` (STARTTLS)
   - Username: `resend`
   - Password: `re_xxxxxxxx` (Resend API anahtarı)
4. **Supabase'e gir:** Supabase Dashboard → **Authentication → Emails → SMTP Settings** →
   *Enable Custom SMTP*:
   - Sender email: `no-reply@mail.ahenk.app` (doğrulanan domainle aynı)
   - Sender name: `Ahenk`
   - Host / Port / Username / Password: yukarıdaki Resend değerleri
5. **Rate limit:** Supabase → Authentication → Rate Limits → e-posta gönderim limitini beta
   hacmine göre yükselt (varsayılan built-in limit düşüktür).
6. **E-posta şablonları (opsiyonel):** Authentication → Email Templates → "Confirm signup" ve
   "Reset password" şablonlarını Türkçeleştir; `{{ .ConfirmationURL }}` korunmalı.
7. **Test:** Yeni bir e-posta ile kayıt ol → doğrulama maili Resend üzerinden gelmeli. Resend →
   Logs'ta gönderimi teyit et.

> 🔐 SMTP şifresi (Resend API key) **Supabase Dashboard'da** saklanır, `.env.local`'e KOYULMAZ.
> Uygulama e-posta göndermez; yalnız Supabase Auth gönderir.

---

## 3) Diğer Supabase-tarafı yapılandırma (özet)

- **SQL göçleri (sırayla):** `schema.sql → schema_v2.sql → schema_v3.sql → schema_v4_security.sql`.
- **Storage:** `photos` (private), `previews` (public), `media` (public) — göçlerle otomatik.
- **Auth Providers:** E-posta (varsayılan). İstenirse Google/Apple (callback:
  `https://<proje>.supabase.co/auth/v1/callback`).
- **URL Configuration:** Production domain'i Site URL + Redirect URLs.
- **Region:** KVKK/GDPR için AB (Frankfurt) önerilir.
