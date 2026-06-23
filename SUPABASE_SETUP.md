# Ahenk Live — Supabase Kurulumu

Faz 2 auth + rol/profil altyapısının **çalışması için** aşağıdaki adımlar gerekir.
(Kod hazır; veritabanı ve env tarafını sen kuruyorsun.)

## 1. Supabase projesi
**Temiz/yeni bir Supabase projesi** kullan (eski flört projesindeki tablolarla
çakışmaması için). https://supabase.com → New Project.

## 2. Migration'ı uygula
Supabase Dashboard → **SQL Editor** → `supabase/migrations/0001_ahenk_live_init.sql`
içeriğini yapıştır ve çalıştır. Bu şunları kurar:
- `profiles`, `student_profiles`, `teacher_profiles`, `coach_profiles` tabloları
- Yeni kullanıcı → otomatik `profiles` satırı (trigger)
- RLS politikaları (kendi profilini gör/güncelle; onaylı öğretmen/koç herkese açık;
  admin hepsini görür; başvuru status'unu sadece admin değiştirebilir)

## 3. Env değişkenleri
`.env.example` → `.env.local` kopyala ve doldur:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`

Canlı (Vercel) için aynılarını **Environment Variables**'a ekle.

## 4. Auth ayarı
Supabase → Authentication → Providers → **Email** açık olsun.
- Hızlı test için: Authentication → **Email confirmations** kapatılabilir
  (kapalıysa kayıt sonrası direkt onboarding'e geçer).
- Canlıda: e-posta doğrulaması açık + custom SMTP önerilir.

## 5. Admin atama
Admin **sadece manuel**: SQL Editor'de
```sql
update public.profiles set role = 'admin' where id = '<user-uuid>';
```

## Akış
Kayıt → onboarding (rol seç + bilgiler) → `profiles.role` + ilgili profil + `onboarded=true`
→ rolüne göre dashboard. Öğretmen/koç başvuruları `status='pending'` kaydolur; admin onaylar.
