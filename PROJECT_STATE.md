# Ahenk — Proje Durumu & Devralma Dokümanı (PROJECT_STATE)

> **Amaç:** Bu doküman tek başına yeterlidir. Yeni bir sohbet/geliştirici bunu okuyup
> projeyi sıfırdan ayağa kaldırabilir, mimariyi anlar, eksikleri ve bilinen sorunları görür.
> **Son doğrulama:** `npm run build` başarılı — tüm route'lar temiz derleniyor (hata yok).
> **Stack:** Next.js 14.2.35 (App Router) · TypeScript (strict:false) · Tailwind · Framer Motion · Supabase (Auth/Postgres/RLS/Storage/Realtime).

---

## Premium ürün katmanı (2026-06 — additive, v13→v42)

Canlı production (ahenk.live) üzerinde, mevcut mimariyi bozmadan eklenen büyük katman:

| Göç | Ne ekler |
|---|---|
| v13–v25 | Hesap silme, 18+, rate-limit, moderasyon/ban, profil-kolon koruması, incognito, push, feedback, keşfet cinsiyet-tercih, prompts, süper beğeni, oto-moderasyon |
| `v26`,`v33` | Hediye/bahşiş + **gift_catalog** (32 hediye, 4 kategori); `send_gift` katalogdan okur |
| `v27` | Liderlik (`top_gift_earners`/`top_inviters`) |
| `v28`–`v30` | Para çekme (cash-out): `withdrawals`, `request_withdraw`/`process_withdraw` (admin onaylı) |
| `v31` | **Soft-delete** hesap (`deleted_at`) + geri yükleme (kullanıcı/admin) |
| `v32` | Etkinlik RSVP (`event_requests.rsvp`, `set_rsvp`/`manage_rsvp`) |
| `v34` | **Kimya/Uyum** (`matches.chemistry_score` + trigger + `add_chemistry`) |
| `v35` | Keşfet sıralama (`discover_candidates` `p_sort`: near/active/new) |
| `v36` | Günün Sorusu (`daily_answers`) |
| `v37` | "Yüz yüze görüştük" (`met_confirmations`, `confirm_met`) |
| `v38` | Ziyaret sayacı (`profile_visits.visit_count`, `record_visit`) — Premium Plus analiz |
| `v39` | Gerçek buluşma (`meet_requests`, `propose_meet`/`respond_meet`) |
| `v40` | Stories tepkileri (`story_reactions`) + izleyenler |
| `v41` | Genel jeton harcama (`spend_jeton`) — ücretli görüntülü görüşme |
| `v42` | Sohbet arşiv/gizli klasör (`chat_states` + `profiles.chat_pin_hash`) |
| `v43` | Hediye kataloğu 2.0 — 7 kategori + nadirlik (Common→Mythic) + sinematik animasyonlar (jet/yat/kraliyet sahneleri, kuyruk) |
| `v44` | Moments 2.0 — `moment_media` (carousel albüm), yönetim (`archived/comments_off/gifts_off`), yorumlar (`parent_id/pinned` + `moment_comment_likes`); **Reels** sekmesi |
| `v45` | Çağrı düzeltme — `start_call` bayat aramaları kapatır (already_active kilidi çözüldü); video premium-kilidi kalktı (jeton akışı) |
| `v46` | Keşfet yaş + doğrulanmış filtresi (`discover_candidates` p_min_age/p_max_age/p_verified) |

**Tasarım:** sinematik lacivert (#0B1220) + champagne gold (#D4B06A) + sıcak terracotta (#C26F56), Manrope display font, desktop 3-kolon kabuk, kurumsal landing.
**Çağrı:** WebRTC + ücretsiz TURN (Open Relay), canlı ses barları, mic/cam durum sinyali.
**Diller:** TR/EN/**Kürtçe (kmr)** — landing/marketing i18n (uygulama-içi ekranlar sabit TR).
**Bilinen sınır:** ekran görüntüsü engelleme web'de imkânsız (native APK gerekir); AI danışman için OpenAI anahtarı bekliyor.

---

## Güncel katmanlar (2026-06 — additive, v5→v12)

Bu dokümanın gövdesi v1–v4'ü anlatır. Sonradan **mevcut sistemi bozmadan** eklenen additive katmanlar:

| Göç | Ne ekler | Doküman |
|---|---|---|
| `schema_v5_jeton.sql` | Jeton ekonomisi (`profiles.jeton`, `jeton_ledger`, `award_jeton`); görev ödülleri + referral 250 jeton | — |
| `schema_v6_store.sql` | Jeton mağazası (`buy_item`: boost / premium gün-hafta) + `profiles.boost_until` | — |
| `schema_v7_subscriptions.sql` | Mağaza aboneliği (`subscriptions`, `subscription_events`, `apply_subscription_event`) | `SUBSCRIPTIONS.md`, `MOBILE-LAUNCH.md` |
| `schema_v8_geo.sql` | Keşfet SQL-geo: `city_coords`, `discover_candidates`/`discover_count` (mesafe/şehir filtresi + proximity) | — |
| `schema_v9_premium_view.sql` | `profiles_card`'a güvenli `tier` (premium rozet) | — |
| `schema_v10_calls.sql` | Sesli/görüntülü arama (`calls` + `start/answer/end_call` + RLS + Realtime) | `CALLS.md` |
| `schema_v11_theme.sql` | Profil arka plan temaları (`profiles.theme`, premium-kilitli) | — |
| `schema_v12_member.sql` | Üye no (`profiles.member_no`, sequence 100000'den) → `profiles_card`'a eklenir | — |
| `schema_v13_account_deletion.sql` | **Hesap silme** RPC `delete_account(p_user)` (atomik: `subscription_events` PII temizliği + `auth.users` sil → cascade); anon/authenticated'tan revoke | — |
| `schema_v14_age_min.sql` | **18+ enforcement**: `profiles`'a `before insert/update of birthdate` trigger'ı (`fn_enforce_min_age`) — <18 reddedilir | — |
| `schema_v15_rate_limit.sql` | **Rate limit**: generic `fn_rate_limit` trigger'ı — mesaj 20/10sn, şikayet 5/saat, etkileşim 60/dk (flood koruması) | — |
| `schema_v16_moderation.sql` | **Moderasyon**: `profiles.banned` + keşfet RPC'lerine yasaklı filtresi | — |
| `schema_v17_ban_enforce.sql` | Yasaklı kullanıcı messages/interactions INSERT kilidi (DB) | — |
| `schema_v18_profile_guard.sql` | 🔐 **Profil kolon koruması**: premium/jeton/is_verified/banned/score yalnız service_role; + `verification_status`/`verification_path` | — |
| `schema_v19_incognito.sql` | **Gizli mod** (`profiles.incognito`) — gizli moddaki ziyaret kaydedilmez | — |
| `schema_v20_push.sql` | **Push abonelikleri** (`push_subscriptions`, owner-RLS) — web (VAPID) + native token | — |

- **Migration sırası 20 dosya** — `scripts/run-migrations.mjs` hepsini sırayla çalıştırır.
- **Web push:** `public/sw.js` + `lib/push.ts` (web-push, VAPID-gated, opsiyonel `npm i web-push`) + `components/PushOptIn.tsx` (/bildirimler). Beğeni/eşleşmede `app/api/interact` push gönderir. Anahtarsız sessiz. Native push (FCM/APNs) → `MOBILE-LAUNCH.md` §5b.
- **Yeni özellikler:** sohbet foto+sesli mesaj · engellenenler yönetimi (`/engellenenler`) · selfie doğrulama (kullanıcı istek + admin onay) · gizli mod · admin moderasyon (çöz/doğrula/yasakla/sil).
- **🔐 Kritik güvenlik (v18):** `p_profiles_upd` RLS satır-bazlıydı, kolon koruması yoktu → kullanıcı PostgREST ile kendine premium/jeton/rozet verebiliyordu. `fn_protect_profile_cols` trigger'ı (current_user authenticated/anon ise korunan kolon değişimini reddeder; service_role + SECURITY DEFINER RPC serbest). Canlıda doğrulandı (pg_bypass=t, auth_block=t).
- **Sohbet medyası:** foto + sesli mesaj (public `media` kovası, `chat/<matchId>/...`); insert dönüşü optimistic + realtime id-dedup. Hesap silmede `media_path` toplanıp temizlenir.
- **Admin moderasyon:** `/api/admin/action` (is_admin-gated): şikayet-çöz / doğrula / yasakla / hesap-sil. Yasaklı → keşfette yok + `(app)` layout `/askida`'ya yönlendirir.
- **Hesap silme (App Store 5.1.1(v) / Play / KVKK):** `POST /api/account/delete` — oturum sahibi yalnız KENDİ hesabını siler. Storage `purgeUserStorage` (photos/previews/media + legacy ses) ile temizlenir; sonra `delete_account` RPC (yoksa `admin.deleteUser` fallback) → `profiles`+tüm child satırlar ON DELETE CASCADE. UI: Profil → "Hesabımı sil" (2 aşama: uyarı + abonelik notu + SİL yaz). Canlıda uygulandı (HTTP 201).
- **18+ çift katman:** onboarding client gating (adım-0) + DB trigger (v14, `trg_enforce_min_age`). Canlıda uygulandı + davranışsal doğrulandı (under-18 reddedildi, self-rollback test).
- **UX / güvenlik / retention katmanı (kodda, migration'sız):**
  - **Seni Beğenenler** (`/begenenler`, `lib/likes.ts`): gelen pozitif etkileşimler — `interactions` RLS'i yalnız `from_user`'ı okuttuğu için **service-role sunucu okuması** ile (oturum sahibinin kendi `to_user`'ı ile sınırlı). Free → sayı + bulanık paywall; Premium → liste + tek dokunuş "Tanış" (anında eşleşme). Giriş: Eşleşmeler banner + Profil menüsü.
  - **SafetyMenu** (`components/SafetyMenu.tsx`): ortak şikayet (nedenli) + engelle (onaylı, idempotent upsert) — sohbet başlığı + `/u` profilinde. **BackButton** akıllı geri navigasyon.
  - Sohbette mesaj saatleri (HH:MM), boş-mesaj pasif gönder, `enterKeyHint`; keşfette premium "It's a Match" anı (karakter-öncelikli, yüzsüz, tier çerçeveli).
- **Ödeme:** web jeton satın alma (ops. Stripe, `PAYMENTS.md`); mobil abonelik (RevenueCat+Capacitor, `SUBSCRIPTIONS.md`). Premium artık **client'tan yazılmaz** — webhook → DB.
- **Keşfet yenilendi:** mesafe/şehir filtresi SQL'de (frontend filtreleme yok), premium rozet/çerçeve, online/yeni/sonuç sayısı, en-yakın varsayılan sıralama.
- **Arama:** WebRTC P2P + Realtime sinyalizasyon; Free yok / Plus sesli / Premium Plus görüntülü; eşleşme+blok+plan+rate-limit `start_call`'da; **TURN production'da şart** (`CALLS.md`).
- **Yeni env:** `REVENUECAT_WEBHOOK_AUTH`, `NEXT_PUBLIC_RC_IOS_KEY/ANDROID_KEY`, `NEXT_PUBLIC_TURN_URL/USER/CRED`, (ops) `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET`, `mailer_autoconfirm` beta'da açık.

---

## 0) "Hatasız çalışır mı?" — Net cevap

**Evet, ama tek şartla:** 12 SQL göçünün tamamı sırayla çalıştırılmalı —
`scripts/run-migrations.mjs` (`schema.sql` → `schema_v2.sql` → … → `schema_v12_member.sql`)
hepsini doğru sırada uygular. `npm run build` zaten temiz geçiyor; runtime'da uygulamanın
hatasız açılması için aşağıdaki **"Deployment Checklist"** eksiksiz uygulanmalı.

🔐 **Güvenlik göçü (`schema_v4_security.sql`) ZORUNLU.** Bu göç çalıştırılmazsa: (a) keşif
fotoğrafları boş gelir (kod artık `previews` kovasını ve `photos.preview_path` kolonunu
bekler), (b) `profiles_card` view'ı bulunmadığı için eşleşme/ziyaretçi/moment/story/event
isimleri **çöker**. Göç; `photos` kovasını private yapar, public `previews` (bulanık) kovasını
açar, `profiles` tablosunu owner-only SELECT'e çeker ve güvenli `profiles_card` view'ını
oluşturur. Detay: §6 (Güvenlik mimarisi).

⚠️ **Kritik tuzak (düzeltildi):** README'nin eski hâli kurulumda yalnızca `schema.sql` +
`schema_v2.sql`'i sayıyordu. **`schema_v3.sql` çalıştırılmazsa** `/api/home` ve profil
sayfasındaki retention bileşeni (`ProfilRetention`) **çöker** — çünkü `profiles.streak_count`,
`profiles.referral_code` kolonları ve `referrals` / `activity_log` tabloları o göçte gelir.
Bu doküman ve README artık v3'ü zorunlu adım olarak listeliyor.

Bunun dışında uygulama **demo/iskelet** seviyesinde çalışır: ödeme gerçek değil, push yok,
"AI" kural-tabanlı. Detaylar §8 (TODO) ve §9 (bilinen sorunlar).

---

## 1) Mimari Özeti

- **Route grupları:** `(auth)` (giriş/kayıt), `(app)` (alt menülü korumalı alan), `onboarding`, `admin`.
- **Oturum:** `@supabase/ssr` ile cookie tabanlı. `middleware.ts` her istekte oturumu tazeler
  ve korumalı rotaları kontrol eder (`lib/supabase/middleware.ts`).
- **Supabase istemcileri (`lib/supabase/`):**
  - `client.ts` → tarayıcı (`createBrowserClient`, anon key).
  - `server.ts` → sunucu (`createServerClient` anon + `createAdminClient` service_role).
  - `middleware.ts` → edge oturum tazeleme.
- **Veri erişimi:** Çoğu okuma/yazma doğrudan Supabase client + **RLS** ile yapılır (ekstra API yok).
  Yalnız sunucu mantığı gereken işler API route'ta (skorlama, agregasyon, admin, security-definer yazımlar).
- **Gerçek zamanlılık:** Supabase Realtime (`postgres_changes`) — sohbet ve eşleşme.
- **"AI":** LLM anahtarı **yok**. `lib/icebreakers.ts`, `lib/aiProfile.ts`, `lib/aiTags.ts`
  kural-tabanlı/deterministik. İstenirse gerçek LLM'e bağlanır.
- **Şema stratejisi:** Additive göçler — `schema.sql` (v1) hiç değiştirilmez, yeniler `_v2`/`_v3` olarak eklenir.
- **Tema:** Koyu varsayılan (`#0F1117`), CSS değişkenleri RGB-kanal → Tailwind alpha desteği.

---

## 2) Tüm Route'lar (sayfalar)

| Route | Dosya | Tür | Not |
|---|---|---|---|
| `/` | `app/page.tsx` | ƒ | Giriş/yönlendirme |
| `/login` | `app/(auth)/login/page.tsx` | ƒ | E-posta + Google/Apple |
| `/register` | `app/(auth)/register/page.tsx` | ƒ | `?ref=` davet kodu yakalar |
| `/onboarding` | `app/onboarding/page.tsx` | ƒ | Çok adımlı profil + foto + AI öneri |
| `/auth/callback` | `app/auth/callback/route.ts` | ƒ | OAuth/e-posta doğrulama dönüşü |
| `/kesfet` | `app/(app)/kesfet/page.tsx` | ƒ | Karakter-öncelikli kart + bulanık foto + vibe/ses + Stories + Moments sekmesi |
| `/eslesmeler` | `app/(app)/eslesmeler/page.tsx` | ƒ | Eşleşme listesi |
| `/sohbet/[matchId]` | `app/(app)/sohbet/[matchId]/page.tsx` | ƒ | Gerçek zamanlı sohbet + icebreaker |
| `/moments` | `app/(app)/moments/page.tsx` | ƒ | TopBar + Stories + Moments akışı |
| `/etkinlikler` | `app/(app)/etkinlikler/page.tsx` | ƒ | Etkinlik listele/oluştur/katıl |
| `/bildirimler` | `app/(app)/bildirimler/page.tsx` | ƒ | Bildirimler (match/message/visit/system) |
| `/profil` | `app/(app)/profil/page.tsx` | ƒ | Profil + retention widget + vibe/ses kartı |
| `/ziyaretciler` | `app/(app)/ziyaretciler/page.tsx` | ƒ | Kim ziyaret etti (premium) |
| `/premium` | `app/(app)/premium/page.tsx` | ƒ | Plus/Gold/Premium Plus planları (demo) |
| `/admin` | `app/admin/page.tsx` | ƒ | Analitik + moderasyon kuyruğu (is_admin) |

Tümü `force-dynamic` / dinamik render (Supabase env'e bağlı, prerender hatası önlenir).

---

## 3) Tüm API Endpoint'leri

| Yöntem | Yol | Dosya | Açıklama |
|---|---|---|---|
| GET | `/api/discover` | `app/api/discover/route.ts` | Skorlanmış aday listesi (+vibe, ses, affinity) |
| POST | `/api/interact` | `app/api/interact/route.ts` | `{to_user, type}` etkileşim + ziyaret + eşleşme |
| GET | `/api/home` | `app/api/home/route.ts` | Streak, profil tamamlama %, 5 günlük görev, referral kodu, activity_log |
| POST | `/api/vibe` | `app/api/vibe/route.ts` | Günlük mod ayarla |
| GET | `/api/icebreakers` | `app/api/icebreakers/route.ts` | `?matchId=` buz kırıcı sorular |
| GET / POST | `/api/stories` | `app/api/stories/route.ts` | Hikaye listele / oluştur |
| GET / POST | `/api/events` | `app/api/events/route.ts` | Etkinlik listele / oluştur |
| POST | `/api/events/join` | `app/api/events/join/route.ts` | Etkinliğe katılma isteği |
| GET / POST | `/api/moments` | `app/api/moments/route.ts` | Moment akışı (+reaksiyon sayısı) / oluştur |
| GET / DELETE | `/api/moments/[id]` | `app/api/moments/[id]/route.ts` | Moment detay / sil |
| POST | `/api/moments/react` | `app/api/moments/react/route.ts` | begen/ilginc/kaydet → affinity tetikler |
| GET | `/api/admin/analytics` | `app/api/admin/analytics/route.ts` | DAU, dönüşüm, churn, mesaj istatistikleri |

---

## 4) Tüm Veritabanı Tabloları

### `schema.sql` (v1)
`profiles`, `photos`, `prompts`, `prompt_answers`, `interactions`, `matches`,
`messages`, `message_reactions`, `profile_visits`, `blocks`, `reports`, `notifications`
- **View:** `profile_public` (yaş hesaplı, public alanlar)
- **Trigger'lar:** `fn_create_match` (karşılıklı etkileşim→eşleşme+bildirim),
  `fn_bump_reveal` (mesaj→reveal_level +7), `fn_report_penalty` (şikayet→behavior_score −10),
  `fn_handle_new_user` (auth.users insert→profiles satırı)
- **Fonksiyon:** `are_matched(u1,u2)`

### `schema_v2.sql` (additive — yeni özellikler)
`stories`, `story_views`, `events`, `event_requests`, `moderation_queue`,
`match_icebreakers`, `moments`, `moment_views`, `moment_reactions`, `moment_comments`,
`moment_ai_tags`, `affinities`
- **profiles'a eklenen kolonlar:** `vibe`, `vibe_at`, `voice_card_path`, `energy_score`, `fraud_score`
- **Trigger:** `fn_moment_affinity` (moment tepkisi→affinity +5)
- **Fonksiyon:** `cleanup_expired()` (süresi dolan story/moment siler — **cron gerekir**, §8)

### `schema_v3.sql` (additive — retention + viral)
`referrals`, `activity_log`
- **profiles'a eklenen kolonlar:** `streak_count`, `streak_last`, `referral_code` (unique partial index), `referred_by`

### `schema_v4_security.sql` (additive — güvenlik/mahremiyet sertleştirme, KVKK/GDPR beta)
- **photos'a eklenen kolon:** `preview_path` (public bulanık önizlemenin yolu).
- **`photos` kovası → private** çevrilir; storage select owner-only olur.
- **Public `previews` kovası** açılır (düşük çözünürlüklü bulanık varyant).
- **`profiles` SELECT → owner-only** (`auth.uid() = id`). Başka kullanıcı artık base
  tablodan **hiçbir kolon** okuyamaz (lat/lon, birthdate, behavior/fraud_score, premium,
  referral, streak, is_admin dahil).
- **`profiles_card` view:** diğer kullanıcıların görebileceği GÜVENLİ alt küme (lat/lon ve
  hassas alanlar HARİÇ; yaş hesaplanmış olarak döner). `authenticated`'a grant.
- **Sızıntı kapatan politika revizyonları:** `p_visits_read` (ziyaretçi/edilen),
  `p_mt_write` (moment etiketi yalnız moment sahibi), `p_ice_write` (icebreaker yalnız
  eşleşmenin tarafı).

### Enum tipleri
`gender_t`, `smoking_t`, `pets_t`, `interaction_t`, `message_t`, `report_status`,
`premium_plan` (free/plus/gold/**platinum**), `story_t`, `event_t`, `req_status_t`
(bekliyor/kabul/red), `mod_status_t` (acik/temiz/engelli), `moment_t`, `moment_react_t`

---

## 5) Environment Variables

`.env.local.example` mevcut. `.env.local` olarak kopyalanıp doldurulur.

| Değişken | Zorunlu | Kullanım |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase proje URL'i (client + server + storage public URL) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Public anon key (RLS arkasında güvenli) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | **Gizli!** Yalnız sunucu — admin/agregasyon işleri |
| `NEXT_PUBLIC_SITE_URL` | ⚪ | Örnek dosyada var; kodda OAuth redirect `location.origin` kullanıyor (şu an pratikte opsiyonel) |

> Kaynak: Supabase → Project Settings → API. `service_role` asla istemciye sızdırılmaz.

---

## 6) Storage Bucket'ları

SQL göçleri bucket'ları **otomatik** oluşturur (`insert into storage.buckets`), manuel adım gerekmez.

| Bucket | Görünürlük | İçerik | Politika |
|---|---|---|---|
| `photos` | **private** (v4) | Orijinal profil fotoğrafları | Yalnız **sahibi** okur (klasör=user id). Başkasına erişim sunucuda admin client + imzalı URL ile, eşleşme + `reveal_level=100` kontrolünden sonra |
| `previews` | public (v4) | Düşük çözünürlüklü **bulanık** önizlemeler | Giriş yapan herkes okur; sahibi kendi klasörüne yazar/siler. Keşif/eşleşme bulanık görseli buradan |
| `voice` | private | (v1'de tanımlı, pratikte kullanılmıyor — ses kartı `media`'ya gidiyor) | — |
| `media` | public | Ses kartı, story/moment medyası | Herkes okur; sahibi kendi klasörüne yazar/siler |

---

## 7) Deployment Checklist (sıfır → çalışır)

**A. Supabase**
- [ ] Yeni Supabase projesi oluştur (bölge: tercihen AB/Frankfurt — KVKK/GDPR).
- [ ] SQL Editor → `supabase/schema.sql` yapıştır + **Run**.
- [ ] SQL Editor → `supabase/schema_v2.sql` yapıştır + **Run**.
- [ ] SQL Editor → `supabase/schema_v3.sql` yapıştır + **Run**. ⚠️ **Atlanırsa profil/retention çöker.**
- [ ] SQL Editor → `supabase/schema_v4_security.sql` yapıştır + **Run**. 🔐 **Atlanırsa keşif fotoğrafları boş gelir ve `profiles_card` bağımlı sayfalar (eşleşme/ziyaretçi/moment/story/event) çöker.**
- [ ] (Otomatik) Bucket'lar oluştu mu kontrol et: `photos` (**private**), `previews` (public), `voice`, `media`.
- [ ] (Otomatik) RLS tüm tablolarda açık mı kontrol et (göçler enable ediyor).
- [ ] Authentication → Providers: E-posta açık (varsayılan). İstenirse Google/Apple ekle
      (callback: `https://<proje>.supabase.co/auth/v1/callback`).
- [ ] Authentication → URL Configuration: production domain'i Site URL + Redirect URLs olarak ekle.
- [ ] Kendini admin yap: `profiles` tablosunda kendi satırında `is_admin = true`.

**B. Uygulama**
- [ ] `.env.local.example` → `.env.local` kopyala, 3 zorunlu değişkeni doldur.
- [ ] `npm install`
- [ ] `npm run build` (28 route hatasız geçmeli) → `npm run dev` veya `npm start`.

**C. Vercel (production)**
- [ ] Repoyu GitHub'a push et → Vercel Import Project.
- [ ] Environment Variables: 3 (+1 opsiyonel) değişkeni gir; `NEXT_PUBLIC_SITE_URL` = gerçek domain.
- [ ] Deploy → Supabase URL Configuration'a production domain'i ekle.

**D. Seed/demo veri**
- Mini sorular (`prompts`) `schema.sql` sonunda otomatik eklenir.
- Demo kullanıcı/profil seed'i **yok** — gerçek kayıtla test edilir (cold-start; en az 2 hesapla eşleşme denenir).

---

## 8) Eksik İşler (TODO)

**P0 (yatırım/üretim öncesi kritik):**
- [ ] Gerçek ödeme + webhook (iyzico/Stripe) — şu an `/premium` demo, anında günceller.
- [ ] Push bildirim altyapısı (Web Push / FCM) — şu an yalnız in-app.
- [ ] Foto moderasyonu (AI NSFW) + KYC/selfie doğrulama.
- [ ] Rate limiting (Upstash) — giriş/swipe/mesaj brute-force savunması.

**P1:**
- [ ] Analitik event pipeline (PostHog/Amplitude) — kohort retention.
- [ ] Gerçek LLM entegrasyonu (icebreaker/öneri/etiket şu an kural-tabanlı).
- [ ] `cleanup_expired()` için **zamanlanmış cron** (pg_cron/Edge) — yoksa story/moment 24s sonra silinmez.
- [ ] Haftalık özet + 7/14 gün reaktivasyon cron'u.
- [ ] Sentry (hata izleme) + Playwright E2E + GitHub Actions CI/CD.

**P2:**
- [ ] Sohbette foto/sesli mesaj gönderimi.
- [ ] Admin moderasyon aksiyon butonları (onayla/engelle).
- [ ] Sosyal paylaşım OG görseli (`/api/og`).
- [ ] Tek şehir kapalı beta (likidite/cold-start stratejisi).

---

## 9) Bilinen Sorunlar / Tutarsızlıklar

1. **v3 göç bağımlılığı (en kritik):** `schema_v3.sql` çalıştırılmadan `/profil` ve `/api/home`
   500 verir (eksik kolon/tablo). Checklist'te zorunlu adım olarak işaretli.
2. **`voice` bucket'ı ölü:** v1'de private `voice` tanımlı ama ses kartı `media` (public) kovasına
   yükleniyor. README'nin "voice signed URL" notu güncel değil. Temizlenebilir.
3. **`NEXT_PUBLIC_SITE_URL` kullanılmıyor:** Örnek env'de var, kod `location.origin` kullanıyor.
   OAuth redirect'i runtime origin'e bağlı; ayrı domain senaryolarında gözden geçir.
4. **Ödeme demo:** `/premium` plan seçince webhook doğrulaması olmadan günceller (prod'da güvensiz).
5. **"AI" gerçek değil:** Kural-tabanlı; Premium Plus değer vaadi LLM bağlanınca gerçekleşir.
6. **Otomatik temizlik yok:** `cleanup_expired()` fonksiyonu var ama cron'a bağlanmadıkça
   süresi dolan içerik DB'de kalır (sorgular `expires_at` filtreliyor, yine de birikir).
7. **Demo veri yok:** İlk açılışta keşif boş görünebilir (cold-start); test için ≥2 hesap gerekir.
8. **v4 göç bağımlılığı:** `schema_v4_security.sql` çalıştırılmadan keşif fotoğrafları boş gelir
   ve `profiles_card` view'ına bağlı sayfalar (eşleşme/ziyaretçi/moment/story/event) çöker.
   Ayrıca **v4 öncesi yüklenmiş eski fotoğrafların** `preview_path`'i NULL olduğundan keşifte
   görünmez (geçmiş veri için backfill/yeniden yükleme gerekir — beta öncesi sorun değil).
9. **Eşleşme reveal eşiği:** Orijinal fotoğrafın imzalı URL'i yalnız `reveal_level >= 100`
   olunca sunulur; altındaysa bulanık önizleme döner. Reveal her mesajla +7 artar (~15 mesaj).

---

## 10) Ekran Mockup'ları Hakkında

Bu ortam görüntü üretmiyor; statik PNG mockup oluşturulamadı. Ekran tasarımları kodda canlı
ve `dev` sunucusunda görülebilir. Tasarım dili `BRAND.md`'de (renk/token/tipografi/bileşen),
her ekranın yapısı §2'deki dosya yollarında. Görsel doğrulama için: `npm run dev` → ilgili route.

---

## 11) İlgili Dokümanlar
- `README.md` — kurulum, ER diyagramı, algoritma.
- `BRAND.md` — marka & tasarım sistemi (logo, renk, token, bileşen).
- `STRATEGY.md` — retention/viral/monetizasyon/güvenlik/üretim + yatırım değerlendirmesi.
- `supabase/schema.sql`, `schema_v2.sql`, `schema_v3.sql`, `schema_v4_security.sql` — göçler (sırayla çalıştır).
