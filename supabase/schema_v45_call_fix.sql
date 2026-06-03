-- =====================================================================
--  AHENK — Şema v45 (ÇAĞRI DÜZELTME — takılı arama + kilit + gating)
--  Sorun: takılı 'ringing'/'active' satırlar 'already_active' kilidi yapıyordu.
--  Ayrıca video premium-kilitliydi; #13 jeton akışıyla çelişiyordu → kamera açılmıyordu.
--  Çözüm: start_call önce BAYAT aramaları kapatır; eşleşen herkes arayabilir
--  (video ücreti UI'da jeton ile alınır).
-- =====================================================================

create or replace function start_call(p_match uuid, p_type text)
returns jsonb as $$
declare caller uuid := auth.uid(); callee uuid; m record; recent int; cid uuid;
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

  -- BAYAT aramaları kapat (takılı kalıp bloke etmesin):
  --   cevaplanmamış 'ringing' 45 sn sonra missed; 'active' 2 saat sonra ended.
  update calls set status = 'missed', ended_at = now(), end_reason = 'timeout'
    where match_id = p_match and status = 'ringing' and created_at < now() - interval '45 seconds';
  update calls set status = 'ended', ended_at = now(), end_reason = 'stale'
    where match_id = p_match and status = 'active' and created_at < now() - interval '2 hours';

  -- rate-limit: son 60 sn'de 5+ arama başlatılamaz
  select count(*) into recent from calls where caller_id = caller and created_at > now() - interval '60 seconds';
  if recent >= 5 then return jsonb_build_object('ok', false, 'error', 'rate_limited'); end if;

  -- gerçekten devam eden arama varsa engelle
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

-- Acil kurtarma: bir eşleşmedeki tüm açık aramaları kapat (UI cleanup yedeği).
create or replace function clear_calls(p_match uuid)
returns void as $$
begin
  update calls set status = 'ended', ended_at = now(), end_reason = 'cleanup'
    where match_id = p_match and status in ('ringing','active')
      and (caller_id = auth.uid() or callee_id = auth.uid());
end;
$$ language plpgsql security definer set search_path = public;
grant execute on function clear_calls(uuid) to authenticated;
