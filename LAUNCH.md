# Ahenk — Production Launch Checklist (Sıfırdan Yayına)

> **Amaç:** Hiç teknik bilgin olmasa bile bu listeyi yukarıdan aşağı, sırayla takip ederek
> Ahenk'i internete açabilirsin. Her adımda **ne yapacağın**, **nereye tıklayacağın** ve
> **doğru yaptığını nasıl anlayacağın** yazıyor. Atlamadan, sırayla ilerle.
>
> İhtiyacın olan hesaplar (hepsi ücretsiz başlar): **Supabase**, **Resend**, **Vercel**,
> **GitHub**, bir **alan adı** (domain) sağlayıcısı (örn. Namecheap/GoDaddy — opsiyonel).
>
> İşaretleme: Her satırın başındaki `[ ]` kutusunu bitirince `[x]` yap.

---

## 🚨 YAYINDAN ÖNCE MUTLAKA (kritik blocker'lar)
Bunlar atlanırsa uygulama ya güvensiz olur ya da çalışmaz. Detaylar aşağıdaki adımlarda.
- [ ] **E-posta doğrulaması AÇIK:** Supabase → Authentication → Providers → Email'de
      **"Confirm email" AÇIK** olmalı (beta'da kapalıydı: `mailer_autoconfirm`). + custom SMTP
      (Resend) bağla. Yoksa doğrulanmamış/sahte hesaplar girer.
- [ ] **service_role anahtarı GİZLİ:** yalnız hosting (Vercel) sunucu env'inde; **asla** `NEXT_PUBLIC_`
      yapma, repoya koyma. (Kodda yalnız `lib/supabase/server.ts` kullanır.)
- [ ] **Web jeton ödemesi:** Stripe bağla (`STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`, `npm i stripe`).
      Bağlamazsan jeton satın alma canlıda kapalıdır → **güvenli** (demo artık production'da bedava jeton
      BASMAZ; yalnız geliştirmede çalışır). Jeton yine görev/davetle kazanılır.
- [ ] **Arama (TURN):** sesli/görüntülü görüşme NAT arkasında TURN olmadan bağlanmaz →
      `NEXT_PUBLIC_TURN_URL/USER/CRED` (bkz. `CALLS.md`). Yoksa aramayı kapalı tutmayı düşün.
- [ ] **OAuth + redirect:** Google/Apple sağlayıcılarını aç ve Supabase redirect URL'lerini **gerçek
      domaine** ayarla; `NEXT_PUBLIC_SITE_URL` gerçek domain olsun.
- [ ] **Yasal:** `/gizlilik`, `/kvkk`, `/kosullar` taslakları bir hukukçuyla gözden geçirilsin.
- [x] **18+ zorunluluğu:** onboarding gating + DB trigger (`schema_v14_age_min.sql`) — kodda hazır.
- [x] **Hesap silme:** App Store/KVKK için `/api/account/delete` + UI — kodda hazır.

---

## 0) Başlamadan — Hesaplar
- [ ] GitHub hesabı aç (https://github.com) ve Ahenk kodunu bir repoya yükle (private olabilir).
- [ ] Supabase hesabı aç (https://supabase.com).
- [ ] Vercel hesabı aç (https://vercel.com) — GitHub ile giriş yap.
- [ ] Resend hesabı aç (https://resend.com).
- [ ] (Opsiyonel ama önerilir) Bir alan adı satın al (örn. `ahenk.app`).

---

## 1) Supabase Kurulumu
- [ ] Supabase → **New Project**.
- [ ] **Region (Bölge):** KVKK/GDPR için **Europe (Frankfurt)** seç. ⚠️ Sonradan değişmez, dikkatli seç.
- [ ] Güçlü bir **Database Password** belirle ve güvenli bir yere kaydet.
- [ ] Proje açılmasını bekle (~2 dk).
- [ ] **Project Settings → API** sayfasını aç, şu 3 değeri bir not dosyasına kopyala:
  - [ ] `Project URL`
  - [ ] `anon public` anahtarı
  - [ ] `service_role` anahtarı → **GİZLİ!** Kimseyle paylaşma, ekran görüntüsü atma.
- [ ] **Doğru mu?** Project URL `https://xxxx.supabase.co` formatında olmalı.

---

## 2) SQL Migration Sırası (ÇOK ÖNEMLİ — sırayı bozma)
**14 göç dosyasının TAMAMI, sırayla** çalışmalı. Eksik bırakılan göç uygulamayı bozar.

**Kolay yol (önerilir):** tek komutla hepsini çalıştır (Supabase erişim token'ı gerekir,
Account → Access Tokens):
```
cd ahenk && SUPABASE_PAT=<token> node scripts/run-migrations.mjs
```
"🎉 Tüm göçler başarıyla çalıştı (14/14)" görmelisin.

**Elle yol:** Supabase → **SQL Editor** → **New query**. Aşağıdakileri **bu sırayla**, tek tek
yapıştır + **Run** → her birinde "Success" gör:

- [ ] **1.** `supabase/schema.sql` — çekirdek tablolar + RLS + trigger + storage kovaları
- [ ] **2.** `supabase/schema_v2.sql` — ek kolonlar/tablolar + `legend` plan enum'u
- [ ] **3.** `supabase/schema_v3.sql` — ⚠️ streak/görev/referral. Atlanırsa profil + ana ekran çöker.
- [ ] **4.** `supabase/schema_v4_security.sql` — 🔐 private foto + `profiles_card` view. Atlanırsa keşif fotoğrafları/isimler bozulur.
- [ ] **5.** `supabase/schema_v5_jeton.sql` — jeton ekonomisi + `award_jeton` + referral ödülü
- [ ] **6.** `supabase/schema_v6_store.sql` — jeton harcama (`buy_item`) + boost
- [ ] **7.** `supabase/schema_v7_subscriptions.sql` — abonelik + `apply_subscription_event`
- [ ] **8.** `supabase/schema_v8_geo.sql` — keşfet mesafe/şehir filtresi (`discover_candidates`)
- [ ] **9.** `supabase/schema_v9_premium_view.sql` — `profiles_card`'a premium `tier`
- [ ] **10.** `supabase/schema_v10_calls.sql` — sesli/görüntülü arama (`calls` + RLS + Realtime)
- [ ] **11.** `supabase/schema_v11_theme.sql` — profil temaları
- [ ] **12.** `supabase/schema_v12_member.sql` — üye no
- [ ] **13.** `supabase/schema_v13_account_deletion.sql` — hesap silme RPC (`delete_account`)
- [ ] **14.** `supabase/schema_v14_age_min.sql` — 18+ enforcement trigger
- [ ] **15.** `supabase/schema_v15_rate_limit.sql` — mesaj/şikayet/etkileşim flood koruması
- [ ] **16.** `supabase/schema_v16_moderation.sql` — yasaklama (`banned`) + keşfetten dışlama
- [ ] **17.** `supabase/schema_v17_ban_enforce.sql` — yasaklı kullanıcı yazma kilidi (DB seviyesi)
- [ ] **18.** `supabase/schema_v18_profile_guard.sql` — 🔐 profil kolon koruması (kullanıcı kendi premium/jeton/rozet/yasak'ını değiştiremez) + doğrulama alanları
- [ ] **19.** `supabase/schema_v19_incognito.sql` — gizli mod (iz bırakmadan gezme)
- [ ] **Doğru mu?** Hiçbiri kırmızı hata vermemeli. "Success" / "No rows returned" yeşil mesajı normaldir.

---

## 3) Storage Bucket Kontrolü
Migration'lar bucket'ları otomatik oluşturur. Supabase → **Storage** → kontrol et:

- [ ] `photos` var ve **Public DEĞİL** (kilitli/private). 🔐 Bu kritik — orijinal fotoğraflar gizli.
- [ ] `previews` var ve **Public** (bulanık önizlemeler buradan gelir).
- [ ] `media` var ve **Public** (ses kartı, story/moment medyası).
- [ ] `voice` var (private, kullanılmıyor — sorun değil).
- [ ] **Doğru mu?** `photos` yanında "Public" etiketi **görünmemeli**; `previews` ve `media`
      yanında "Public" **görünmeli**.

---

## 4) SMTP (Resend) — Production E-posta
Kayıt doğrulama e-postaları bunsuz çalışmaz (Supabase yerleşik e-posta saatte ~2-4 ile sınırlı).

- [ ] Resend → **Domains → Add Domain** → alan adını gir (örn. `mail.ahenk.app`).
- [ ] Resend'in gösterdiği **SPF + DKIM** TXT kayıtlarını alan adı DNS paneline ekle.
- [ ] (Önerilir) DMARC kaydı ekle: `v=DMARC1; p=none; rua=mailto:dmarc@ahenk.app`.
- [ ] Resend'de domain **"Verified" (yeşil)** olana kadar bekle (DNS yayılması ~dakikalar–saatler).
- [ ] Resend → **API Keys** → yeni key oluştur (`re_...`) → kopyala.
- [ ] Supabase → **Authentication → Emails → SMTP Settings** → *Enable Custom SMTP*:
  - [ ] Sender email: `no-reply@mail.ahenk.app` (doğruladığın domainle aynı)
  - [ ] Sender name: `Ahenk`
  - [ ] Host: `smtp.resend.com` · Port: `465` · Username: `resend` · Password: `re_...` (API key)
- [ ] Supabase → **Authentication → Rate Limits** → e-posta gönderim limitini beta hacmine göre yükselt.
- [ ] (Opsiyonel) **Email Templates** → "Confirm signup" şablonunu Türkçeleştir (`{{ .ConfirmationURL }}` kalsın).
- [ ] **Alternatif (hızlı yol):** Kapalı beta için Authentication → Providers → Email → "Confirm email"i
      **kapatabilirsin**; o zaman SMTP zorunlu olmaz (ama gerçek launch'ta aç).
- [ ] Ayrıntılı rehber: **`ENVIRONMENT.md`**.

---

## 5) Environment Variables (Uygulama)
Bunlar Vercel'e girilir (kod dosyasına değil). Değerler Adım 1'de kopyaladıkların.

| Değişken | Değer | Gizli mi? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL | Hayır |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public | Hayır (RLS arkasında güvenli) |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role | 🔐 **EVET — asla paylaşma** |
| `NEXT_PUBLIC_SITE_URL` | `https://ahenk.app` (gerçek domain) | Hayır |

- [ ] ⚠️ `SUPABASE_SERVICE_ROLE_KEY`'in başında **`NEXT_PUBLIC_` OLMAMALI**. Olursa gizli anahtar
      tarayıcıya sızar — felaket. Tam olarak yukarıdaki gibi yaz.
- [ ] SMTP/Resend anahtarı buraya **GİRİLMEZ** (o Supabase Dashboard'da, Adım 4).

---

## 6) Vercel Deployment
- [ ] Vercel → **Add New → Project** → GitHub'daki Ahenk reposunu seç → **Import**.
- [ ] Framework otomatik **Next.js** algılanmalı (değişiklik gerekmez).
- [ ] **Environment Variables** bölümüne Adım 5'teki 4 değişkeni tek tek ekle (Production seçili).
- [ ] **Deploy** butonuna bas → build'in tamamlanmasını bekle (~2-3 dk).
- [ ] **Doğru mu?** "Congratulations" + bir `*.vercel.app` adresi görmelisin. Adrese tıkla, açılıyor mu bak.
- [ ] Açılış ekranı geldiyse build başarılı.

---

## 7) Domain Kurulumu (kendi alan adın)
- [ ] Vercel → Projen → **Settings → Domains** → `ahenk.app` (ve `www.ahenk.app`) ekle.
- [ ] Vercel'in gösterdiği **A / CNAME** kayıtlarını alan adı DNS paneline ekle.
- [ ] DNS yayılmasını bekle (Vercel "Valid Configuration" yeşil olunca tamam).
- [ ] Vercel → Environment Variables → `NEXT_PUBLIC_SITE_URL`'i gerçek domain yap → **Redeploy**.
- [ ] Supabase → **Authentication → URL Configuration**:
  - [ ] **Site URL:** `https://ahenk.app`
  - [ ] **Redirect URLs:** `https://ahenk.app/**` (ve gerekiyorsa `https://www.ahenk.app/**`)
- [ ] (OAuth kullanıyorsan) Google/Apple konsolunda callback'i güncelle:
      `https://<proje>.supabase.co/auth/v1/callback`.

---

## 8) SSL Kontrolü
- [ ] `https://ahenk.app` adresini aç → tarayıcıda **kilit ikonu** görünmeli (güvenli).
- [ ] `http://` ile girince otomatik `https://`'e yönlenmeli (Vercel bunu otomatik yapar).
- [ ] **Doğru mu?** Vercel → Domains'te domain "Valid" + SSL "Active". Sertifika için ekstra
      işlem gerekmez (Vercel ücretsiz otomatik verir).

---

## 9) Güvenlik Kontrolleri (yayın öncesi son bakış)
- [ ] 4 migration'ın hepsi çalıştı mı? (Adım 2) — özellikle `schema_v4_security.sql`.
- [ ] `photos` bucket **private** mi? (Adım 3)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` yalnız Vercel env'de mi, repoda/`.env` git'te **değil** mi?
      (`.gitignore`'da `.env.local` olmalı — repoda görünmemeli.)
- [ ] Kendini admin yap: Supabase → **Table Editor → profiles** → kendi satırında `is_admin = true`.
- [ ] Güvenlik başlıkları aktif: `next.config.mjs` HSTS/X-Frame-Options/nosniff içerir (kodda hazır,
      ekstra iş yok) — deploy sonrası otomatik gelir.
- [ ] Hızlı sızıntı testi: İkinci bir hesapla giriş yap, başka kullanıcının profilini açtığında
      konum (lat/lon) veya doğum tarihi **görünmemeli**; yalnız şehir + yaş + mesafe görünmeli.
- [ ] Foto testi: Eşleşmeden önce karşı tarafın fotoğrafı **bulanık** olmalı; net orijinal URL'i
      tarayıcıda elle açmaya çalışınca **erişilememeli**.

---

## 10) Beta Kullanıcı Davet Süreci
- [ ] Hedef: **100 kişilik kapalı/davetli** grup (tek şehir önerilir — cold-start için likidite).
- [ ] Davet metni hazırla: kısa tanıtım + `https://ahenk.app` linki + (varsa) referans kodu.
- [ ] ⚠️ Davetleri **dalga dalga** gönder (örn. 20'şerli), hepsini aynı anda gönderme —
      e-posta rate limiti ve ilk gün geri bildirimini yönetmek için.
- [ ] İlk 5 daveti **kendin + güvendiğin kişilere** yap; uçtan uca akışı onlarla test et.
- [ ] Geri bildirim kanalı kur (WhatsApp grubu / Google Form) — hataları hızlı topla.
- [ ] İlk hafta **her gün** Supabase → Authentication → Users ve Logs'a bak (kayıt/giriş sorunları).

---

## 11) Hata İzleme (Monitoring)
- [ ] **Vercel** → Projen → **Logs** sekmesini bookmark'la (canlı API/sayfa hataları burada).
- [ ] **Supabase** → **Logs** (Auth, Database, Storage) — e-posta/giriş/sorgu hataları burada.
- [ ] (Önerilir, sonradan eklenebilir) **Sentry** ile detaylı hata izleme — şu an kodda kurulu
      değil; istersen ayrı bir adımda eklenir. Beta'ya başlamak için Vercel + Supabase logları yeter.
- [ ] (Önerilir) **Vercel Analytics**'i aç (Settings → Analytics) — trafik/performans için.
- [ ] Günde bir kez logları gözden geçirme alışkanlığı edin (ilk hafta kritik).

---

## 12) Yedekleme (Backup)
- [ ] Supabase → **Database → Backups**: Free plan günlük otomatik yedek alır (kısa saklama).
- [ ] **Önerilir:** Gerçek launch öncesi **Pro plan**'a geç → daha uzun saklama + **PITR**
      (point-in-time recovery, dakika hassasiyetinde geri dönüş).
- [ ] İlk gerçek kullanıcılardan önce bir kez **manuel yedek** al (Database → Backups → varsa "Backup now").
- [ ] Yedekten geri dönmeyi **bir kez test et** (tatbikat) — gerçek kriz anında ilk kez denememek için.

---

## 13) Yayın Öncesi Son Testler (Golden Path)
Gerçek davet göndermeden ÖNCE, production domain üzerinde uçtan uca dene:

- [ ] **Kayıt:** Yeni e-posta ile kayıt ol → doğrulama maili **geldi mi?** (Resend → Logs'ta da gör.)
- [ ] **Giriş:** Doğrulama sonrası giriş yapabiliyor musun?
- [ ] **Onboarding:** Profil bilgileri + **fotoğraf yükleme** çalışıyor mu? (Foto kaydoluyor mu?)
- [ ] **Keşfet:** İkinci hesapla bak — adaylar geliyor mu, fotoğraflar **bulanık** mı, ortak % görünüyor mu?
- [ ] **Etkileşim & Eşleşme:** İki hesap karşılıklı ilgi → **eşleşme** oluşuyor mu?
- [ ] **Sohbet:** Gerçek zamanlı mesaj gidiyor mu, okundu/işaret çalışıyor mu, mesajlaştıkça foto netleşiyor mu?
- [ ] **Profil/Premium/Ziyaretçiler/Admin:** Sayfalar hatasız açılıyor mu? Admin paneli (is_admin) görünüyor mu?
- [ ] **Mobil:** Telefondan aç — tasarım bozulmuyor mu (uygulama mobil-öncelikli)?
- [ ] **Çıkış/yeniden giriş:** Oturum koruması çalışıyor mu (çıkınca korumalı sayfalar kapanıyor mu)?
- [ ] Hepsi yeşilse → **davetleri göndermeye hazırsın.**

---

## ✅ Yayına Hazır Mıyım? — Hızlı Özet
Şu 4 şey tamamsa (web) internete açabilirsin:
1. **10 migration** sırayla çalıştı (`scripts/run-migrations.mjs` hepsini çalıştırır; özellikle `schema_v4_security.sql`).
2. **`photos` private**, `previews`/`media` public (Storage kontrolü).
3. **SMTP yapılandırıldı** (veya kapalı beta için email-confirm kapatıldı).
4. **Golden path** production domain'de uçtan uca **yeşil**.

> Bilinçli ertelenen (kapalı betada engel değil): push bildirim, foto NSFW moderasyonu, Sentry,
> `cleanup_expired()` cron. (Gerçek ödeme ve arama rate-limit'i **artık kuruldu** — aşağıya bak.)

---

## 14) Sonradan eklenen altyapı (additive — v5→v10)
Çekirdek beta (v1–v4) yukarıda. Aşağıdakiler mevcut sistemi bozmadan eklendi; her birinin
kendi kurulum dokümanı var:

- [ ] **Migration sayısı 10.** Yeni Supabase projesinde `node scripts/run-migrations.mjs` (SUPABASE_PAT ile) tümünü çalıştırır; ya da SQL Editor'da `schema_v5_jeton` → `_v6_store` → `_v7_subscriptions` → `_v8_geo` → `_v9_premium_view` → `_v10_calls` sırayla.
- [ ] **Jeton ekonomisi + mağaza** (kazan/harca) — kod hazır, ek kurulum yok.
- [ ] **Keşfet (yenilendi):** mesafe/şehir filtresi SQL'de, premium rozet/çerçeve, online/yeni/sonuç sayısı. Golden path'e ekle: filtre slider'ı + şehir seçimi + sonuçların güncellenmesi.
- [ ] **Web jeton satın alma:** demo modunda çalışır; gerçek tahsilat için Stripe → **`PAYMENTS.md`**.
- [ ] **Mobil abonelik (App Store + Google Play):** RevenueCat + Capacitor → **`SUBSCRIPTIONS.md`** + ayrı liste **`MOBILE-LAUNCH.md`**. Env: `REVENUECAT_WEBHOOK_AUTH`, `NEXT_PUBLIC_RC_IOS_KEY/ANDROID_KEY`.
- [ ] **Sesli/Görüntülü görüşme:** WebRTC P2P. **TURN sunucusu production'da ŞART** (NAT arkası) → **`CALLS.md`**. Env: `NEXT_PUBLIC_TURN_URL/USER/CRED`.
- [ ] **Golden path (arama):** iki gerçek cihaz + iki eşleşmiş hesap → Plus sesli, Premium Plus görüntülü ara; yerel ağda STUN yeter, farklı ağlarda TURN gerekir.
- [ ] **Premium gating doğrula:** Free arama yok, Plus sesli, Premium Plus görüntülü; engellenen arayamaz; rate-limit (5/60sn) çalışıyor.
