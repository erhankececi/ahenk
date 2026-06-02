-- =====================================================================
--  AHENK — Şema v10 (SESLİ & GÖRÜNTÜLÜ GÖRÜŞME — WebRTC sinyalizasyon + kayıt)
--  ADDITIVE + idempotent. Medya P2P (WebRTC); bu katman: arama kaydı + izin
--  + rate-limit + geçmiş. Sinyalizasyon Supabase Realtime broadcast (ephemeral).
--  İzin: Free yok, Plus sesli, Premium Plus sesli+görüntülü (gold=sesli).
-- =====================================================================

do $$ begin create type call_type   as enum ('voice','video'); exception when duplicate_object then null; end $$;
do $$ begin create type call_status as enum ('ringing','active','ended','missed','declined','cancelled','failed'); exception when duplicate_object then null; end $$;

create table if not exists calls (
  id          uuid primary key default gen_random_uuid(),
  match_id    uuid not null references matches(id) on delete cascade,
  caller_id   uuid not null references profiles(id) on delete cascade,
  callee_id   uuid not null references profiles(id) on delete cascade,
  type        call_type not null,
  status      call_status not null default 'ringing',
  created_at  timestamptz default now(),
  answered_at timestamptz,
  ended_at    timestamptz,
  duration_seconds int,
  end_reason  text
);
create index if not exists idx_calls_callee on calls (callee_id, status);
create index if not exists idx_calls_caller_time on calls (caller_id, created_at desc);
create index if not exists idx_calls_match on calls (match_id, created_at desc);

alter table calls enable row level security;
-- Yalnız taraflar okur; YAZMA yok (yalnız aşağıdaki security definer fonksiyonlar).
drop policy if exists p_calls_read on calls;
create policy p_calls_read on calls for select using (auth.uid() = caller_id or auth.uid() = callee_id);

-- Realtime: callee gelen aramayı postgres_changes ile alsın (yayına ekle, idempotent).
do $$ begin
  if not exists (select 1 from pg_publication_tables
                 where pubname='supabase_realtime' and schemaname='public' and tablename='calls') then
    alter publication supabase_realtime add table calls;
  end if;
end $$;

-- ---------------------------------------------------------------------
--  start_call: eşleşme + çift-yönlü blok + plan + rate-limit kontrolü.
--  auth.uid() = arayan (PostgREST JWT'sinden). authenticated çağırabilir.
-- ---------------------------------------------------------------------
create or replace function start_call(p_match uuid, p_type text)
returns jsonb as $$
declare caller uuid := auth.uid(); callee uuid; m record; cplan premium_plan; cuntil timestamptz; recent int; cid uuid;
begin
  if caller is null then return jsonb_build_object('ok', false, 'error', 'unauth'); end if;
  if p_type not in ('voice','video') then return jsonb_build_object('ok', false, 'error', 'bad_type'); end if;

  select * into m from matches where id = p_match;
  if m is null or (m.user_a <> caller and m.user_b <> caller) then
    return jsonb_build_object('ok', false, 'error', 'not_matched');
  end if;
  callee := case when m.user_a = caller then m.user_b else m.user_a end;

  if exists (select 1 from blocks b
             where (b.blocker_id = caller and b.blocked_id = callee)
                or (b.blocker_id = callee and b.blocked_id = caller)) then
    return jsonb_build_object('ok', false, 'error', 'blocked');
  end if;

  select premium_plan, premium_until into cplan, cuntil from profiles where id = caller;
  if cuntil is not null and cuntil < now() then cplan := 'free'; end if;
  if cplan = 'free' then return jsonb_build_object('ok', false, 'error', 'need_plus'); end if;
  -- Sesli: plus+ · Görüntülü: Premium (gold) + Premium Plus (platinum). HD/1080p client'ta plana göre.
  if p_type = 'video' and cplan not in ('gold', 'platinum', 'legend') then
    return jsonb_build_object('ok', false, 'error', 'need_premium');
  end if;

  -- spam/rate-limit: son 60 sn'de 5+ arama başlatılamaz
  select count(*) into recent from calls where caller_id = caller and created_at > now() - interval '60 seconds';
  if recent >= 5 then return jsonb_build_object('ok', false, 'error', 'rate_limited'); end if;

  -- aynı eşleşmede zaten çalan/aktif arama varsa
  if exists (select 1 from calls where match_id = p_match and status in ('ringing','active')) then
    return jsonb_build_object('ok', false, 'error', 'already_active');
  end if;

  insert into calls (match_id, caller_id, callee_id, type, status)
  values (p_match, caller, callee, p_type::call_type, 'ringing')
  returning id into cid;
  return jsonb_build_object('ok', true, 'call_id', cid, 'callee_id', callee, 'caller_id', caller);
end;
$$ language plpgsql security definer set search_path = public;
grant execute on function start_call(uuid, text) to authenticated;

-- answer_call: yalnız callee, yalnız ringing iken
create or replace function answer_call(p_call uuid)
returns jsonb as $$
declare me uuid := auth.uid(); c record;
begin
  select * into c from calls where id = p_call;
  if c is null or c.callee_id <> me then return jsonb_build_object('ok', false, 'error', 'forbidden'); end if;
  if c.status <> 'ringing' then return jsonb_build_object('ok', false, 'error', 'not_ringing'); end if;
  update calls set status = 'active', answered_at = now() where id = p_call;
  return jsonb_build_object('ok', true);
end;
$$ language plpgsql security definer set search_path = public;
grant execute on function answer_call(uuid) to authenticated;

-- end_call: her iki taraf; süreyi hesaplar, geçmişe yazar
create or replace function end_call(p_call uuid, p_status text default 'ended', p_reason text default null)
returns jsonb as $$
declare me uuid := auth.uid(); c record; dur int;
begin
  select * into c from calls where id = p_call;
  if c is null or (c.caller_id <> me and c.callee_id <> me) then
    return jsonb_build_object('ok', false, 'error', 'forbidden');
  end if;
  if c.status in ('ended','declined','missed','cancelled','failed') then
    return jsonb_build_object('ok', true, 'noop', true);
  end if;
  dur := case when c.answered_at is not null
              then greatest(0, extract(epoch from (now() - c.answered_at))::int) else 0 end;
  update calls set
    status = (case when p_status in ('ended','declined','missed','cancelled','failed')
                   then p_status::call_status else 'ended'::call_status end),
    ended_at = now(), duration_seconds = dur, end_reason = p_reason
  where id = p_call;
  return jsonb_build_object('ok', true, 'duration', dur);
end;
$$ language plpgsql security definer set search_path = public;
grant execute on function end_call(uuid, text, text) to authenticated;
