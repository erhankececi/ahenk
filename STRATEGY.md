# Ahenk — Ürün Stratejisi, Büyüme & Üretime Hazırlık

> Bu doküman ürünü "eski Tinder/Bumble/Hinge PM'leriyle çalışan bir startup ekibi"
> gözüyle değerlendirir: ilk gün / ilk hafta / ilk ay kullanıcıyı tutmak.

---

## 1) Retention (Geri Getirme)

| Mekanik | Durum | Kullanıcı davranışına etkisi |
|---|---|---|
| **Streak (🔥 gün serisi)** | ✅ kodlandı (`/api/home`, profil) | Günlük dönüş alışkanlığı; "kaybetme korkusu" (loss aversion) ile D1→D7 retention'ı yükseltir |
| **Günlük görevler** | ✅ kodlandı (5 görev, profil) | Net "bugün ne yapmalıyım" → oturum başına eylem sayısı ve profil kalitesi artar |
| **Profil tamamlama çubuğu** | ✅ kodlandı | Zeigarnik etkisi (yarım kalanı bitirme dürtüsü) → daha dolu profil = daha çok eşleşme |
| **Günlük Vibe (mod)** | ✅ v2 | Her gün hafif, düşük-sürtünmeli bir dönüş sebebi |
| **Yeni eşleşme önerileri** | ✅ keşif algoritması | Taze içerik = dönüş sebebi |
| **Aktivite bildirimleri** | ✅ tablo + sayfa (`/bildirimler`) | Eşleşme/mesaj/ziyaret push → reaktivasyon |
| **Haftalık özet** | ⏳ tasarlandı (cron) | "Bu hafta 12 ziyaret, 3 eşleşme" → haftalık geri dönüş |
| **Geri dönüş kampanyası** | ⏳ tasarlandı | 7/14 gün pasif kullanıcıya "seni özledik + öne çıkma hediyesi" |

**Sıradaki teknik adım:** Supabase **Scheduled Edge Function** (pg_cron) ile gece
çalışan job: haftalık özet bildirimi + 7/14 gün pasiflere reaktivasyon kaydı.

## 2) Viral Büyüme

| Sistem | Durum | Not |
|---|---|---|
| **Davet / referans kodu** | ✅ kodlandı (`referral_code`, `/register?ref=`) | Her profile benzersiz kod; kayıtta yakalanır (metadata `ref`) |
| **Referans ödülü** | ✅ şema (`referrals.rewarded`) | "Her katılan arkadaş = 1 hafta Premium" — ödül job'ı ile işlenir |
| **Paylaşılabilir profil/davet kartı** | ✅ Web Share API (profil) | Native paylaşım + panoya kopya fallback |
| **Sosyal medya şablonları** | ⏳ tasarlandı | OG görseli üreten `/api/og` (satellite) ile Story/Tweet kartı |
| **Viral onboarding** | ✅ 5 adım + ref karşılama | Davetle gelene "ilk hafta Premium" mesajı |

**K-faktörü hedefi:** her aktif kullanıcı ≥ 0.5 davet × %25 dönüşüm. Ödül döngüsü
(çift taraflı: davet eden + edilen kazanır) viral katsayıyı yükseltir.

## 3) Monetizasyon

**Abonelik katmanları (kodda mevcut — `premium` sayfası):**

| Plan | Fiyat (öneri) | Öne çıkanlar |
|---|---|---|
| **Free** | ₺0 | Sınırlı günlük keşif, temel eşleşme, sohbet |
| **Plus** | ₺99/ay | Sınırsız keşif, kim ziyaret etti, geri al, ekstra vibe |
| **Premium Plus (Platinum)** | ₺349/ay | AI danışman, AI sohbet önerisi, profil analizi, gelişmiş görünürlük, moment performansı, öncelikli destek |

> Not: Mevcut kodda Plus/Gold/Platinum var. Gold'u "Premium", Platinum'u "Premium Plus"
> olarak konumlandırmak öneri (3 net katman dönüşümü artırır).

**Ek gelir kaynakları (à la carte):**
- **Profil öne çıkarma (Boost):** 30 dk keşifte en üstte.
- **Süper görünürlük / Süper-niyet:** doğrudan bildirimli yüksek-sinyal beğeni.
- **Etkinlik sponsorluğu:** markalı/öne çıkan etkinlikler.
- **AI danışmanlık paketi:** tek seferlik profil + foto + bio analizi.

**Ödeme:** iyzico (TR pazarı) veya Stripe. Webhook → `profiles.premium_plan/until`.
Şu an demo (anında güncelleme); prod'da webhook doğrulaması şart.

## 4) Analitik & KPI

**İzlenecek metrikler:** DAU, MAU, **DAU/MAU yapışkanlık**, D1/D7/D30 retention,
churn, ARPU/ARPPU, free→paid conversion, **match rate**, mesaj→eşleşme dönüşümü,
ortalama sohbet süresi/uzunluğu, davet K-faktörü.

**Mevcut:** Admin → Analitik paneli (DAU, eşleşme/premium dönüşümü, churn, eşleşme
başına mesaj). `activity_log` tablosu DAU/retention kohortları için temel.

**Sıradaki:** PostHog/Amplitude entegrasyonu (event tracking) + kohort retention
grafiği. Olaylar: `signup`, `onboarding_complete`, `swipe`, `match`, `message_sent`,
`moment_create`, `premium_view`, `purchase`.

## 5) Ölçeklenebilirlik (100 → 1M kullanıcı)

- **DB indexing:** sıcak yollarda indeks — `interactions(from_user)`,
  `messages(match_id, created_at)`, `profiles(last_active)`, `moments(expires_at)`,
  `activity_log(day)`. (Bazıları mevcut; eksikleri migration ile ekle.)
- **Caching:** keşif adaylarını ve sayaçları **Redis/Upstash** ile 30–60 sn cache.
- **CDN:** medya `media` kovası → Supabase CDN / Cloudflare; Next statikleri Vercel Edge.
- **Queue / background jobs:** ödül işleme, bildirim fan-out, AI etiketleme, foto
  moderasyonu → kuyruk (Upstash QStash / Supabase Edge cron).
- **Rate limiting:** IP + kullanıcı bazlı (Upstash Ratelimit) — swipe/mesaj/giriş.
- **Realtime:** kanal sayısı büyüdüğünde kanal başına eşleşme yerine partition + presence.
- **Read replica & connection pooling:** Supabase **pgBouncer** (transaction mode).

## 6) Güvenlik (OWASP)

| Katman | Durum |
|---|---|
| **XSS** | React varsayılan kaçışı; `dangerouslySetInnerHTML` yok. ✅ |
| **CSRF** | Supabase token Authorization header'da (cookie-form post yok). ✅ |
| **SQL Injection** | Tüm sorgular Supabase client (parametreli); ham SQL yok. ✅ |
| **RLS** | Her tabloda Row Level Security politikaları. ✅ |
| **Güvenlik başlıkları** | `next.config.mjs`: HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy. ✅ |
| **Brute force** | ⏳ giriş/kayıt için rate limit (Upstash) + Supabase Auth lockout. |
| **Dosya yükleme** | Storage RLS + tip/boyut doğrulama (client). ⏳ sunucu tarafı MIME/boyut + görüntü yeniden-kodlama. |
| **Moderasyon** | Spam filtresi + sahte hesap risk skoru + moderasyon kuyruğu. ✅ ⏳ foto için AI NSFW. |
| **Sırlar** | `service_role` yalnız sunucuda; `.env.local` git'te değil. ✅ |

## 7) Üretime Hazırlık Checklist

- [ ] **Monitoring:** Vercel Analytics + uptime (BetterStack).
- [ ] **Logging:** yapılandırılmış log (API route'larda) + Supabase logs.
- [ ] **Error tracking:** Sentry (frontend + API).
- [ ] **Backup:** Supabase günlük otomatik yedek + PITR (Pro plan).
- [ ] **Disaster recovery:** restore tatbikatı; runbook.
- [ ] **Rate limiting & WAF:** Vercel/Cloudflare WAF.
- [ ] **Ödeme webhook'u** (iyzico/Stripe) imza doğrulamalı.
- [ ] **Push bildirim** (Web Push / FCM).
- [ ] **KVKK/GDPR uyumu** (aşağıda).
- [ ] **E2E test** (Playwright) golden path: kayıt→onboarding→keşif→eşleşme→mesaj.

## 8) KVKK / GDPR

- **Açık rıza:** kayıtta aydınlatma metni + konum/medya izinleri ayrı onay.
- **Veri minimizasyonu:** yalnız gerekli alanlar; konum şehir/lat-lon hassasiyeti.
- **Erişim & taşınabilirlik:** "verilerimi indir" (JSON export).
- **Silme hakkı:** "hesabımı sil" → kullanıcı + ilişkili veriler cascade (RLS+FK hazır).
- **Saklama süresi:** stories/moments 24s; pasif hesap politikası.
- **VERBİS / İşleme envanteri** ve **DPA** (Supabase/Vercel ile veri işleyici sözleşmesi).
- **Veri yeri:** Supabase bölgesi (AB/Frankfurt) seçimi.

---

## 9) Yatırım-Seviyesi Değerlendirme & Eksikler

**Güçlü yanlar:** Net farklılaşma (karakter-öncelikli, bulanık foto, AI), zengin
özellik seti (vibe, moments, stories, etkinlikler, premium plus), sağlam RLS,
modüler additive mimari, retention/viral döngüleri kodlanmış, temiz tasarım sistemi.

**Yatırıma hazır olmadan önceki kritik eksikler (öncelik sırasıyla):**

1. **Gerçek ödeme + webhook** (gelir kanıtı yok → demo). **P0**
2. **Push bildirim altyapısı** — retention'ın motoru; şu an sadece in-app. **P0**
3. **Foto moderasyonu (AI NSFW) + KYC/selfie doğrulama** — güvenlik & güven. **P0**
4. **Rate limiting + bot/sahte hesap savunması** (giriş, swipe, mesaj). **P1**
5. **Analitik event pipeline** (PostHog) — kohort retention olmadan büyüme körlemesine. **P1**
6. **Gerçek "AI"** — şu an kural-tabanlı; LLM'e bağlanınca Premium Plus değeri gerçekleşir. **P1**
7. **Test + CI/CD + hata izleme** (Sentry, Playwright, GitHub Actions). **P1**
8. **İçerik/topluluk yönetimi** — moderasyon aksiyonları (onayla/engelle butonları). **P2**
9. **Likidite (cold-start)** — şehir bazlı kritik kütle; lansman tek şehir odaklı olmalı. **P2 (strateji)**

**Önerilen 90 günlük yol haritası:**
- **Ay 1:** Ödeme+webhook, push, foto moderasyonu, rate limit. (Üretim güvenliği)
- **Ay 2:** Analitik pipeline, gerçek AI (icebreaker/öneri/etiket), haftalık özet & reaktivasyon cron.
- **Ay 3:** Tek şehir kapalı beta → kohort ölçümü, K-faktörü optimizasyonu, paywall A/B.

**Metrik hedefleri (beta):** D1 ≥ %40, D7 ≥ %20, D30 ≥ %10; free→paid ≥ %3–5;
K-faktörü ≥ 0.3. Bu eşikler tutarsa Seed turu için "product-market fit sinyali" güçlü olur.
