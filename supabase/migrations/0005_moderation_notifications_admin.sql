-- =====================================================================
--  Ahenk Live — Faz 6: Admin onay + moderasyon + bildirimler
--  Uygula: Supabase SQL Editor (0001..0004'ten SONRA).
--  Bildirimler olay tetikleyicileriyle (mevcut RPC'ler değişmez) oluşur.
-- =====================================================================

-- ---------- tablolar ----------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  type text not null default 'info' check (type in ('info','question','answer','room','payment','application','warning')),
  action_url text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications(user_id, created_at desc);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete set null,
  target_type text not null check (target_type in ('question','answer','room','message','teacher','coach','user')),
  target_id uuid not null,
  reason text not null,
  description text,
  status text not null default 'open' check (status in ('open','reviewing','resolved','rejected')),
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.profiles(id) on delete set null,
  action_type text not null,
  target_type text not null,
  target_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.user_blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (blocker_id, blocked_id)
);

create trigger trg_reports_updated before update on public.reports for each row execute function public.set_updated_at();

-- ---------- bildirim yardımcı fonksiyonu (yalnız server/trigger/RPC) ----------
create or replace function public.notify(p_user uuid, p_title text, p_body text, p_type text default 'info', p_action_url text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_user is null then return; end if;
  insert into notifications (user_id, title, body, type, action_url) values (p_user, p_title, p_body, coalesce(p_type, 'info'), p_action_url);
end; $$;
revoke execute on function public.notify(uuid, text, text, text, text) from public, anon, authenticated;

-- =====================================================================
--  Olay bildirimleri (tetikleyiciler — mevcut RPC'ler değişmeden)
-- =====================================================================
create or replace function public.trg_notify_question_insert() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.teacher_id is not null then
    perform public.notify(new.teacher_id, 'Yeni soru', new.subject || ' dersinde yeni bir soru aldın.', 'question', '/gelen-sorular/' || new.id);
  end if;
  return new;
end; $$;
create trigger questions_notify_insert after insert on public.questions for each row execute function public.trg_notify_question_insert();

create or replace function public.trg_notify_question_update() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'answered' and old.status is distinct from 'answered' then
    perform public.notify(new.student_id, 'Sorun cevaplandı', 'Bir öğretmen sorunu cevapladı.', 'answer', '/sorularim/' || new.id);
  elsif new.status = 'assigned' and old.status = 'open' and new.claimed_by is not null then
    perform public.notify(new.student_id, 'Soru üstlenildi', 'Sorun bir öğretmen tarafından üstlenildi.', 'question', '/sorularim/' || new.id);
  end if;
  return new;
end; $$;
create trigger questions_notify_update after update on public.questions for each row execute function public.trg_notify_question_update();

create or replace function public.trg_notify_room_insert() returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.notify(new.host_id, 'Oda oluşturuldu', 'Canlı odan oluşturuldu.', 'room', '/odalar/' || new.id);
  return new;
end; $$;
create trigger live_rooms_notify_insert after insert on public.live_rooms for each row execute function public.trg_notify_room_insert();

create or replace function public.trg_notify_room_join() returns trigger language plpgsql security definer set search_path = public as $$
declare v_host uuid;
begin
  if new.role = 'student' then
    select host_id into v_host from live_rooms where id = new.room_id;
    perform public.notify(v_host, 'Yeni katılımcı', 'Odana yeni bir öğrenci katıldı.', 'room', '/odalar/' || new.room_id);
    if new.paid_coins > 0 then
      perform public.notify(new.user_id, 'Oda katılımı', new.paid_coins || ' jeton ile canlı odaya katıldın.', 'room', '/odalar/' || new.room_id);
    end if;
  end if;
  return new;
end; $$;
create trigger room_participants_notify_insert after insert on public.room_participants for each row execute function public.trg_notify_room_join();

create or replace function public.trg_notify_payment_paid() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'paid' and old.status is distinct from 'paid' then
    perform public.notify(new.user_id, 'Jeton yüklendi', new.total_coins || ' jeton hesabına yüklendi.', 'payment', '/cuzdan');
  end if;
  return new;
end; $$;
create trigger payment_orders_notify_update after update on public.payment_orders for each row execute function public.trg_notify_payment_paid();

create or replace function public.trg_notify_application() returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.notify(new.user_id, 'Başvurun alındı', 'Başvurun incelemeye alındı. Sonuç bildirim olarak iletilecek.', 'application', null);
  return new;
end; $$;
create trigger teacher_app_notify after insert on public.teacher_profiles for each row execute function public.trg_notify_application();
create trigger coach_app_notify after insert on public.coach_profiles for each row execute function public.trg_notify_application();

-- ---------- engellenen kullanıcıların oda mesajlarını gizle ----------
drop policy if exists "rm_select" on public.room_messages;
create policy "rm_select" on public.room_messages for select using (
  public.is_admin()
  or (
    exists (select 1 from public.room_participants p where p.room_id = room_messages.room_id and p.user_id = auth.uid() and p.left_at is null)
    and not exists (select 1 from public.user_blocks b where b.blocker_id = auth.uid() and b.blocked_id = room_messages.user_id)
  )
);

-- ---------- RLS ----------
alter table public.notifications enable row level security;
alter table public.reports enable row level security;
alter table public.admin_actions enable row level security;
alter table public.user_blocks enable row level security;

create policy "notif_select_own" on public.notifications for select using (auth.uid() = user_id or public.is_admin());
-- INSERT/UPDATE client politikası YOK → oluşturma trigger/RPC, okundu işareti RPC ile.

create policy "report_select_own" on public.reports for select using (auth.uid() = reporter_id or public.is_admin());
create policy "report_admin_update" on public.reports for update using (public.is_admin());
-- INSERT yalnız create_report RPC ile.

create policy "admin_actions_select" on public.admin_actions for select using (public.is_admin());

create policy "blocks_select_own" on public.user_blocks for select using (auth.uid() = blocker_id or public.is_admin());
create policy "blocks_insert_own" on public.user_blocks for insert with check (auth.uid() = blocker_id and blocker_id <> blocked_id);
create policy "blocks_delete_own" on public.user_blocks for delete using (auth.uid() = blocker_id);

-- =====================================================================
--  RPC fonksiyonları
-- =====================================================================
create or replace function public.admin_approve_teacher(p_user_id uuid) returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Yetkisiz işlem.'; end if;
  update teacher_profiles set status = 'approved' where user_id = p_user_id;
  perform public.notify(p_user_id, 'Başvurun onaylandı', 'Öğretmen başvurun onaylandı. Artık oda açabilir ve soru cevaplayabilirsin.', 'application', '/ogretmen');
  insert into admin_actions (admin_id, action_type, target_type, target_id) values (auth.uid(), 'approve_teacher', 'teacher', p_user_id);
end; $$;

create or replace function public.admin_reject_teacher(p_user_id uuid, p_note text default null) returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Yetkisiz işlem.'; end if;
  update teacher_profiles set status = 'rejected' where user_id = p_user_id;
  perform public.notify(p_user_id, 'Başvurun reddedildi', coalesce(p_note, 'Öğretmen başvurun şu an onaylanmadı.'), 'application', null);
  insert into admin_actions (admin_id, action_type, target_type, target_id, metadata) values (auth.uid(), 'reject_teacher', 'teacher', p_user_id, jsonb_build_object('note', p_note));
end; $$;

create or replace function public.admin_approve_coach(p_user_id uuid) returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Yetkisiz işlem.'; end if;
  update coach_profiles set status = 'approved' where user_id = p_user_id;
  perform public.notify(p_user_id, 'Başvurun onaylandı', 'Koç başvurun onaylandı. Artık oda açabilirsin.', 'application', '/koc');
  insert into admin_actions (admin_id, action_type, target_type, target_id) values (auth.uid(), 'approve_coach', 'coach', p_user_id);
end; $$;

create or replace function public.admin_reject_coach(p_user_id uuid, p_note text default null) returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Yetkisiz işlem.'; end if;
  update coach_profiles set status = 'rejected' where user_id = p_user_id;
  perform public.notify(p_user_id, 'Başvurun reddedildi', coalesce(p_note, 'Koç başvurun şu an onaylanmadı.'), 'application', null);
  insert into admin_actions (admin_id, action_type, target_type, target_id, metadata) values (auth.uid(), 'reject_coach', 'coach', p_user_id, jsonb_build_object('note', p_note));
end; $$;

create or replace function public.create_report(p_target_type text, p_target_id uuid, p_reason text, p_description text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'Yetkisiz işlem.'; end if;
  insert into reports (reporter_id, target_type, target_id, reason, description)
  values (auth.uid(), p_target_type, p_target_id, p_reason, p_description) returning id into v_id;
  insert into notifications (user_id, title, body, type, action_url)
  select id, 'Yeni bildirim', 'Bir içerik bildirildi: ' || p_reason, 'warning', '/admin/reports' from profiles where role = 'admin';
  return v_id;
end; $$;

create or replace function public.admin_resolve_report(p_report_id uuid, p_status text, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Yetkisiz işlem.'; end if;
  if p_status not in ('open','reviewing','resolved','rejected') then raise exception 'Geçersiz durum.'; end if;
  update reports set status = p_status, admin_note = coalesce(p_note, admin_note) where id = p_report_id;
  insert into admin_actions (admin_id, action_type, target_type, target_id, metadata) values (auth.uid(), 'resolve_report', 'report', p_report_id, jsonb_build_object('status', p_status));
end; $$;

create or replace function public.mark_notification_read(p_id uuid) returns void language plpgsql security definer set search_path = public as $$
begin
  update notifications set read_at = now() where id = p_id and user_id = auth.uid() and read_at is null;
end; $$;

create or replace function public.mark_all_notifications_read() returns void language plpgsql security definer set search_path = public as $$
begin
  update notifications set read_at = now() where user_id = auth.uid() and read_at is null;
end; $$;
