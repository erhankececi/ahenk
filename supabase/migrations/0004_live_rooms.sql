-- =====================================================================
--  Ahenk Live — Faz 5: Canlı odalar + realtime sohbet + jetonlu giriş
--  Uygula: Supabase SQL Editor (0001..0003'ten SONRA).
--  Katılım + jeton kesimi YALNIZ güvenli RPC ile (transaction güvenliği).
-- =====================================================================

-- coach_profiles.coin_balance (oda kazancı için)
alter table public.coach_profiles add column if not exists coin_balance integer not null default 0;

-- coin_transactions tip seti (oda işlemleri eklendi)
alter table public.coin_transactions drop constraint if exists coin_transactions_type_check;
alter table public.coin_transactions add constraint coin_transactions_type_check
  check (type in ('spend_question','spend_priority','teacher_earning','refund','admin_adjustment','purchase_credit','spend_room','room_host_earning','coach_earning'));

-- ---------- tablolar ----------
create table if not exists public.live_rooms (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  subject text not null,
  exam_type text,
  room_type text not null default 'study' check (room_type in ('study','question_solution','coaching','motivation','exam_analysis')),
  status text not null default 'scheduled' check (status in ('scheduled','live','ended','canceled')),
  is_paid boolean not null default false,
  coin_cost integer not null default 0,
  max_participants integer not null default 100,
  starts_at timestamptz,
  ended_at timestamptz,
  participant_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists live_rooms_status_idx on public.live_rooms(status, created_at desc);
create index if not exists live_rooms_host_idx on public.live_rooms(host_id);

create table if not exists public.room_participants (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.live_rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'student' check (role in ('student','host','moderator')),
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  paid_coins integer not null default 0,
  unique (room_id, user_id)
);

create table if not exists public.room_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.live_rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  message_type text not null default 'text' check (message_type in ('text','system','announcement')),
  created_at timestamptz not null default now()
);
create index if not exists room_messages_room_idx on public.room_messages(room_id, created_at);

create trigger trg_live_rooms_updated before update on public.live_rooms for each row execute function public.set_updated_at();

-- realtime (mesajlar anlık aksın)
alter publication supabase_realtime add table public.room_messages;

-- ---------- RLS ----------
alter table public.live_rooms enable row level security;
alter table public.room_participants enable row level security;
alter table public.room_messages enable row level security;

-- live_rooms
create policy "lr_select_public" on public.live_rooms for select using (status in ('scheduled','live') or host_id = auth.uid() or public.is_admin());
create policy "lr_insert_host" on public.live_rooms for insert with check (
  host_id = auth.uid() and (
    exists (select 1 from public.teacher_profiles t where t.user_id = auth.uid() and t.status = 'approved')
    or exists (select 1 from public.coach_profiles c where c.user_id = auth.uid() and c.status = 'approved')
  )
);
create policy "lr_update_host" on public.live_rooms for update using (host_id = auth.uid() or public.is_admin());

-- room_participants (insert/update YALNIZ RPC ile)
create policy "rp_select" on public.room_participants for select using (
  user_id = auth.uid() or public.is_admin()
  or exists (select 1 from public.live_rooms r where r.id = room_participants.room_id and r.host_id = auth.uid())
);

-- room_messages (yalnız aktif katılımcı okur/yazar; yazma RPC ile)
create policy "rm_select" on public.room_messages for select using (
  public.is_admin()
  or exists (select 1 from public.room_participants p where p.room_id = room_messages.room_id and p.user_id = auth.uid() and p.left_at is null)
);

-- =====================================================================
--  Güvenli RPC fonksiyonları
-- =====================================================================

create or replace function public.create_live_room(
  p_title text, p_description text, p_subject text, p_exam_type text,
  p_room_type text, p_is_paid boolean, p_coin_cost integer, p_max_participants integer, p_starts_at timestamptz
) returns uuid language plpgsql security definer set search_path = public as $$
declare v_host uuid := auth.uid(); v_rid uuid;
begin
  if v_host is null then raise exception 'Yetkisiz işlem.'; end if;
  if not exists (select 1 from teacher_profiles where user_id = v_host and status = 'approved')
     and not exists (select 1 from coach_profiles where user_id = v_host and status = 'approved') then
    raise exception 'Sadece onaylı öğretmen veya koç oda açabilir.';
  end if;
  insert into live_rooms (host_id, title, description, subject, exam_type, room_type, is_paid, coin_cost, max_participants, starts_at, status, participant_count)
  values (v_host, p_title, p_description, p_subject, p_exam_type, coalesce(p_room_type, 'study'),
          coalesce(p_is_paid, false), greatest(coalesce(p_coin_cost, 0), 0), coalesce(p_max_participants, 100), p_starts_at,
          case when p_starts_at is null or p_starts_at <= now() then 'live' else 'scheduled' end, 1)
  returning id into v_rid;
  insert into room_participants (room_id, user_id, role) values (v_rid, v_host, 'host');
  return v_rid;
end; $$;

create or replace function public.join_live_room(p_room_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_user uuid := auth.uid(); v_room live_rooms%rowtype; v_balance integer; v_earn integer;
begin
  if v_user is null then raise exception 'Yetkisiz işlem.'; end if;
  select * into v_room from live_rooms where id = p_room_id for update;
  if not found then raise exception 'Oda bulunamadı.'; end if;
  if v_room.status not in ('scheduled','live') then raise exception 'Oda aktif değil.'; end if;
  if v_room.host_id = v_user then return; end if;

  -- zaten aktif katılımcı → idempotent
  if exists (select 1 from room_participants where room_id = p_room_id and user_id = v_user and left_at is null) then
    return;
  end if;
  -- daha önce katılıp ayrılmış → tekrar ücret YOK
  if exists (select 1 from room_participants where room_id = p_room_id and user_id = v_user) then
    update room_participants set left_at = null, joined_at = now() where room_id = p_room_id and user_id = v_user;
    update live_rooms set participant_count = participant_count + 1 where id = p_room_id;
    return;
  end if;

  if v_room.participant_count >= v_room.max_participants then raise exception 'Oda dolu.'; end if;

  if v_room.is_paid and v_room.coin_cost > 0 then
    select coin_balance into v_balance from student_profiles where user_id = v_user for update;
    if v_balance is null then raise exception 'Öğrenci profili bulunamadı.'; end if;
    if v_balance < v_room.coin_cost then raise exception 'Yetersiz jeton.'; end if;
    update student_profiles set coin_balance = coin_balance - v_room.coin_cost where user_id = v_user;
    insert into coin_transactions (user_id, amount, type, description) values (v_user, -v_room.coin_cost, 'spend_room', 'Canlı oda katılımı');

    v_earn := floor(v_room.coin_cost * 0.7);
    if exists (select 1 from teacher_profiles where user_id = v_room.host_id) then
      update teacher_profiles set coin_balance = coin_balance + v_earn where user_id = v_room.host_id;
      insert into coin_transactions (user_id, amount, type, description) values (v_room.host_id, v_earn, 'room_host_earning', 'Canlı oda kazancı');
    elsif exists (select 1 from coach_profiles where user_id = v_room.host_id) then
      update coach_profiles set coin_balance = coin_balance + v_earn where user_id = v_room.host_id;
      insert into coin_transactions (user_id, amount, type, description) values (v_room.host_id, v_earn, 'coach_earning', 'Canlı oda kazancı');
    end if;
    insert into room_participants (room_id, user_id, role, paid_coins) values (p_room_id, v_user, 'student', v_room.coin_cost);
  else
    insert into room_participants (room_id, user_id, role, paid_coins) values (p_room_id, v_user, 'student', 0);
  end if;
  update live_rooms set participant_count = participant_count + 1 where id = p_room_id;
end; $$;

create or replace function public.leave_live_room(p_room_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update room_participants set left_at = now() where room_id = p_room_id and user_id = auth.uid() and left_at is null;
  if found then
    update live_rooms set participant_count = greatest(participant_count - 1, 0) where id = p_room_id;
  end if;
end; $$;

create or replace function public.send_room_message(p_room_id uuid, p_message text, p_message_type text default 'text')
returns uuid language plpgsql security definer set search_path = public as $$
declare v_user uuid := auth.uid(); v_is_host boolean; v_type text; v_mid uuid;
begin
  if v_user is null then raise exception 'Yetkisiz işlem.'; end if;
  if coalesce(trim(p_message), '') = '' then raise exception 'Mesaj boş olamaz.'; end if;
  if not exists (select 1 from room_participants where room_id = p_room_id and user_id = v_user and left_at is null) then
    raise exception 'Mesaj göndermek için odaya katılmalısın.';
  end if;
  v_is_host := exists (select 1 from live_rooms where id = p_room_id and host_id = v_user);
  v_type := coalesce(p_message_type, 'text');
  if v_type = 'announcement' and not v_is_host then v_type := 'text'; end if;
  insert into room_messages (room_id, user_id, message, message_type) values (p_room_id, v_user, p_message, v_type) returning id into v_mid;
  return v_mid;
end; $$;
