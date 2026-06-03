-- =====================================================================
--  AHENK — Şema v25 (OTOMATİK MODERASYON: 3+ şikayet → kuyruğa)
--  ADDITIVE + idempotent. 3 FARKLI kullanıcıdan açık şikayet alan hesap
--  otomatik moderation_queue'ya düşer (admin panelde görünür + aksiyon).
-- =====================================================================

create or replace function fn_auto_moderate_reports() returns trigger as $$
declare rep_count int;
begin
  select count(distinct reporter_id) into rep_count
    from reports where reported_id = new.reported_id and status = 'acik';

  if rep_count >= 3 then
    insert into moderation_queue (user_id, risk_score, reasons, status)
    values (new.reported_id, least(rep_count * 25, 100),
            jsonb_build_array(rep_count || ' farklı kullanıcıdan şikayet'), 'acik')
    on conflict (user_id) do update
      set risk_score = excluded.risk_score,
          reasons = excluded.reasons,
          status = 'acik';
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_auto_moderate on reports;
create trigger trg_auto_moderate after insert on reports
  for each row execute function fn_auto_moderate_reports();
