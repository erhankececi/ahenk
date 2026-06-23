-- =====================================================================
--  Ahenk Live — Faz 3: Soru sorma + öğretmen cevaplama + jeton sistemi
--  Uygula: Supabase SQL Editor (0001'den SONRA).
--  Jeton işlemleri YALNIZ güvenli RPC fonksiyonları üzerinden yapılır.
-- =====================================================================

-- ---------- tablolar ----------
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  teacher_id uuid references public.profiles(id),
  claimed_by uuid references public.profiles(id),
  subject text not null,
  topic text,
  title text,
  description text,
  image_url text,
  answer_text text,
  answer_image_url text,
  status text not null default 'open' check (status in ('open','assigned','answered','closed','canceled')),
  priority boolean not null default false,
  answer_type text not null default 'text' check (answer_type in ('text','image','voice_placeholder')),
  coin_cost integer not null default 10,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  answered_at timestamptz
);
create index if not exists questions_student_idx on public.questions(student_id, created_at desc);
create index if not exists questions_pool_idx on public.questions(status) where teacher_id is null;

create table if not exists public.coin_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  question_id uuid references public.questions(id) on delete set null,
  amount integer not null,
  type text not null check (type in ('spend_question','spend_priority','teacher_earning','refund','admin_adjustment')),
  description text,
  created_at timestamptz not null default now()
);
create index if not exists coin_tx_user_idx on public.coin_transactions(user_id, created_at desc);

create table if not exists public.question_comments (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

create trigger trg_questions_updated before update on public.questions for each row execute function public.set_updated_at();

-- ---------- Storage: question-images (private) ----------
insert into storage.buckets (id, name, public) values ('question-images', 'question-images', false)
on conflict (id) do nothing;

create policy "qimg_write" on storage.objects for insert to authenticated
  with check (bucket_id = 'question-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "qimg_read" on storage.objects for select to authenticated
  using (bucket_id = 'question-images');
create policy "qimg_delete_own" on storage.objects for delete to authenticated
  using (bucket_id = 'question-images' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------- RLS ----------
alter table public.questions enable row level security;
alter table public.coin_transactions enable row level security;
alter table public.question_comments enable row level security;

-- questions
create policy "q_student_select" on public.questions for select using (auth.uid() = student_id);
create policy "q_teacher_assigned" on public.questions for select using (
  (teacher_id = auth.uid() or claimed_by = auth.uid())
  and exists (select 1 from public.teacher_profiles t where t.user_id = auth.uid() and t.status = 'approved')
);
create policy "q_teacher_pool" on public.questions for select using (
  status = 'open' and teacher_id is null
  and exists (select 1 from public.teacher_profiles t where t.user_id = auth.uid() and t.status = 'approved')
);
create policy "q_admin_select" on public.questions for select using (public.is_admin());
create policy "q_student_insert" on public.questions for insert with check (auth.uid() = student_id);
create policy "q_student_update" on public.questions for update
  using (auth.uid() = student_id and status not in ('answered','closed'))
  with check (auth.uid() = student_id);
create policy "q_admin_update" on public.questions for update using (public.is_admin());

-- coin_transactions (client INSERT YOK — sadece RPC; sadece kendi hareketini okur)
create policy "ct_select_own" on public.coin_transactions for select using (auth.uid() = user_id);
create policy "ct_admin_select" on public.coin_transactions for select using (public.is_admin());

-- question_comments (soru sahibi + ilgili öğretmen + admin)
create policy "qc_select" on public.question_comments for select using (
  public.is_admin() or exists (
    select 1 from public.questions q where q.id = question_comments.question_id
      and (q.student_id = auth.uid() or q.teacher_id = auth.uid() or q.claimed_by = auth.uid())
  )
);
create policy "qc_insert" on public.question_comments for insert with check (
  auth.uid() = user_id and exists (
    select 1 from public.questions q where q.id = question_id
      and (q.student_id = auth.uid() or q.teacher_id = auth.uid() or q.claimed_by = auth.uid())
  )
);

-- =====================================================================
--  Güvenli RPC fonksiyonları (transaction güvenliği)
-- =====================================================================

-- ---------- soru gönder ----------
create or replace function public.submit_question(
  p_subject text,
  p_topic text default null,
  p_title text default null,
  p_description text default null,
  p_image_url text default null,
  p_teacher_id uuid default null,
  p_priority boolean default false
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_student uuid := auth.uid();
  v_cost integer;
  v_balance integer;
  v_status text;
  v_qid uuid;
begin
  if v_student is null then raise exception 'Yetkisiz işlem.'; end if;
  if not exists (select 1 from profiles where id = v_student and role = 'student') then
    raise exception 'Sadece öğrenciler soru sorabilir.';
  end if;

  select coin_balance into v_balance from student_profiles where user_id = v_student for update;
  if v_balance is null then raise exception 'Öğrenci profili bulunamadı.'; end if;

  v_cost := case when p_priority then 25 else 10 end;
  if v_balance < v_cost then raise exception 'Yetersiz jeton.'; end if;

  if p_teacher_id is not null then
    if not exists (select 1 from teacher_profiles where user_id = p_teacher_id and status = 'approved') then
      raise exception 'Seçilen öğretmen geçersiz.';
    end if;
    v_status := 'assigned';
  else
    v_status := 'open';
  end if;

  update student_profiles set coin_balance = coin_balance - v_cost where user_id = v_student;

  insert into questions (student_id, teacher_id, subject, topic, title, description, image_url, status, priority, coin_cost)
  values (v_student, p_teacher_id, p_subject, p_topic, p_title, p_description, p_image_url, v_status, p_priority, v_cost)
  returning id into v_qid;

  insert into coin_transactions (user_id, question_id, amount, type, description)
  values (v_student, v_qid, -v_cost, case when p_priority then 'spend_priority' else 'spend_question' end, p_subject || ' sorusu');

  return v_qid;
end; $$;

-- ---------- soruyu üstlen (havuzdan) ----------
create or replace function public.claim_question(p_question_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_teacher uuid := auth.uid();
  v_status text;
  v_claimed uuid;
begin
  if v_teacher is null then raise exception 'Yetkisiz işlem.'; end if;
  if not exists (select 1 from teacher_profiles where user_id = v_teacher and status = 'approved') then
    raise exception 'Sadece onaylı öğretmenler soru üstlenebilir.';
  end if;
  select status, claimed_by into v_status, v_claimed from questions where id = p_question_id for update;
  if v_status is null then raise exception 'Soru bulunamadı.'; end if;
  if v_status <> 'open' or v_claimed is not null then raise exception 'Bu soru zaten üstlenilmiş.'; end if;
  update questions set status = 'assigned', claimed_by = v_teacher, teacher_id = v_teacher where id = p_question_id;
end; $$;

-- ---------- soruyu cevapla ----------
create or replace function public.answer_question(
  p_question_id uuid,
  p_answer_text text,
  p_answer_image_url text default null
) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_teacher uuid := auth.uid();
  v_q record;
  v_earn integer;
begin
  if v_teacher is null then raise exception 'Yetkisiz işlem.'; end if;
  if not exists (select 1 from teacher_profiles where user_id = v_teacher and status = 'approved') then
    raise exception 'Sadece onaylı öğretmenler cevaplayabilir.';
  end if;
  select * into v_q from questions where id = p_question_id for update;
  if not found then raise exception 'Soru bulunamadı.'; end if;
  if v_q.teacher_id is distinct from v_teacher and v_q.claimed_by is distinct from v_teacher then
    raise exception 'Bu soru sana atanmamış.';
  end if;
  if v_q.status = 'answered' then raise exception 'Soru zaten cevaplanmış.'; end if;

  v_earn := case when v_q.priority then 18 else 7 end;

  update questions set
    answer_text = p_answer_text,
    answer_image_url = p_answer_image_url,
    answer_type = case when p_answer_image_url is not null then 'image' else 'text' end,
    status = 'answered',
    answered_at = now(),
    teacher_id = coalesce(teacher_id, v_teacher)
  where id = p_question_id;

  update teacher_profiles set coin_balance = coin_balance + v_earn, answered_questions = answered_questions + 1
  where user_id = v_teacher;

  insert into coin_transactions (user_id, question_id, amount, type, description)
  values (v_teacher, p_question_id, v_earn, 'teacher_earning', 'Soru cevaplama kazancı');
end; $$;
