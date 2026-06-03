-- =====================================================================
--  AHENK — Şema v32 (ETKİNLİK RSVP: katılacağım/belki/ilgileniyor/gelemem)
--  event_requests.status (req_status_t: bekliyor/kabul/red) = SAHİBİN onayı.
--  Yeni event_requests.rsvp (text) = KATILIMCININ niyeti (ayrı katman).
--  RLS update yalnız host'a açık olduğundan kullanıcının kendi rsvp'sini
--  değiştirebilmesi için SECURITY DEFINER RPC kullanılır.
-- =====================================================================

alter table event_requests add column if not exists rsvp text;
create index if not exists idx_event_req_event on event_requests (event_id);

-- Katılımcı kendi niyetini belirler/değiştirir.
create or replace function set_rsvp(p_event uuid, p_rsvp text)
returns jsonb as $$
declare uid uuid := auth.uid();
begin
  if uid is null then return jsonb_build_object('ok', false, 'error', 'unauth'); end if;
  if p_rsvp not in ('gidecek', 'belki', 'ilgileniyor', 'gelemem') then
    return jsonb_build_object('ok', false, 'error', 'bad');
  end if;
  insert into event_requests (event_id, user_id, rsvp)
    values (p_event, uid, p_rsvp)
    on conflict (event_id, user_id) do update set rsvp = excluded.rsvp;
  return jsonb_build_object('ok', true);
end;
$$ language plpgsql security definer set search_path = public;
revoke all on function set_rsvp(uuid, text) from anon;
grant execute on function set_rsvp(uuid, text) to authenticated;

-- Etkinlik sahibi katılımcıyı onaylar/reddeder.
create or replace function manage_rsvp(p_event uuid, p_user uuid, p_status text)
returns jsonb as $$
declare uid uuid := auth.uid();
begin
  if p_status not in ('kabul', 'red', 'bekliyor') then
    return jsonb_build_object('ok', false, 'error', 'bad');
  end if;
  if uid is null or uid <> (select host_id from events where id = p_event) then
    return jsonb_build_object('ok', false, 'error', 'yasak');
  end if;
  update event_requests set status = p_status::req_status_t
    where event_id = p_event and user_id = p_user;
  return jsonb_build_object('ok', true);
end;
$$ language plpgsql security definer set search_path = public;
revoke all on function manage_rsvp(uuid, uuid, text) from anon;
grant execute on function manage_rsvp(uuid, uuid, text) to authenticated;
