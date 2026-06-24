-- =====================================================================
--  Ahenk Live — temel auth + rol/profil şeması (temiz kurulum)
--  Uygula: Supabase Dashboard -> SQL Editor (veya supabase db push)
--  TEMİZ bir Supabase projesinde çalıştır (eski flört tablolarıyla karışmasın).
-- =====================================================================

-- ---------- yardımcı fonksiyonlar ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

-- ---------- tablolar ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text check (role in ('student','teacher','coach','admin')),
  avatar_url text,
  city text,
  phone text,
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.student_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  exam_type text check (exam_type in ('TYT','AYT','LGS','KPSS','Diğer')),
  grade_level text,
  subjects text[],
  coin_balance integer not null default 0,
  premium_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.teacher_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  branch text,
  experience_years integer,
  bio text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  rating numeric not null default 0,
  answered_questions integer not null default 0,
  average_response_time text,
  coin_balance integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.coach_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  expertise text[],
  bio text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  rating numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- yönetici kontrolü (profiles tablosu oluştuktan SONRA tanımlanır) ----------
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ---------- updated_at tetikleyicileri ----------
create trigger trg_profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger trg_student_updated before update on public.student_profiles for each row execute function public.set_updated_at();
create trigger trg_teacher_updated before update on public.teacher_profiles for each row execute function public.set_updated_at();
create trigger trg_coach_updated before update on public.coach_profiles for each row execute function public.set_updated_at();

-- ---------- yeni kullanıcı -> profiles satırı ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ---------- başvuru status'unu kullanıcı kendi değiştiremesin (sadece admin) ----------
create or replace function public.lock_application_status()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status and not public.is_admin() then
    new.status := old.status;
  end if;
  return new;
end; $$;

create trigger trg_teacher_status before update on public.teacher_profiles for each row execute function public.lock_application_status();
create trigger trg_coach_status before update on public.coach_profiles for each row execute function public.lock_application_status();

-- ---------- RLS ----------
alter table public.profiles enable row level security;
alter table public.student_profiles enable row level security;
alter table public.teacher_profiles enable row level security;
alter table public.coach_profiles enable row level security;

-- profiles: kendi profilini oku/güncelle/oluştur; admin hepsini görür; onaylı öğretmen/koç herkese açık
create policy "profiles_select_own"      on public.profiles for select using (auth.uid() = id);
create policy "profiles_select_admin"    on public.profiles for select using (public.is_admin());
create policy "profiles_select_approved" on public.profiles for select using (
  exists (select 1 from public.teacher_profiles t where t.user_id = profiles.id and t.status = 'approved')
  or exists (select 1 from public.coach_profiles c where c.user_id = profiles.id and c.status = 'approved')
);
create policy "profiles_insert_own"      on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own"      on public.profiles for update using (auth.uid() = id)
  with check (auth.uid() = id and (role is distinct from 'admin' or public.is_admin()));
create policy "profiles_update_admin"    on public.profiles for update using (public.is_admin());

-- student_profiles: kendi + admin
create policy "student_select" on public.student_profiles for select using (auth.uid() = user_id or public.is_admin());
create policy "student_insert" on public.student_profiles for insert with check (auth.uid() = user_id);
create policy "student_update" on public.student_profiles for update using (auth.uid() = user_id or public.is_admin());

-- teacher_profiles: kendi + admin + onaylı herkese açık
create policy "teacher_select" on public.teacher_profiles for select using (auth.uid() = user_id or public.is_admin() or status = 'approved');
create policy "teacher_insert" on public.teacher_profiles for insert with check (auth.uid() = user_id);
create policy "teacher_update" on public.teacher_profiles for update using (auth.uid() = user_id or public.is_admin());

-- coach_profiles: kendi + admin + onaylı herkese açık
create policy "coach_select" on public.coach_profiles for select using (auth.uid() = user_id or public.is_admin() or status = 'approved');
create policy "coach_insert" on public.coach_profiles for insert with check (auth.uid() = user_id);
create policy "coach_update" on public.coach_profiles for update using (auth.uid() = user_id or public.is_admin());
