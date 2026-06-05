-- =====================================================================
--  AHENK — Şema v49 (Sohbet: silince iletişim kopmasın — WhatsApp mantığı)
--  "Benim için sil" = chat_states.state='deleted' (mesajlar DB'de kalır).
--  Yeni mesaj geldiğinde (her iki taraf da) silinen sohbet otomatik
--  'normal'e döner ve listede yeniden görünür. Arşiv/Gizli dokunulmaz.
-- =====================================================================

create or replace function fn_restore_deleted_chat() returns trigger as $$
begin
  -- bu eşleşmeye ait, kimde silinmiş varsa geri getir (gizli/arşiv kalsın)
  update chat_states
     set state = 'normal', updated_at = now()
   where match_id = new.match_id
     and state = 'deleted';
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_restore_deleted_chat on messages;
create trigger trg_restore_deleted_chat
  after insert on messages
  for each row execute function fn_restore_deleted_chat();

-- trigger her mesajda match_id ile chat_states tarar — index ekle
create index if not exists idx_chat_states_match on chat_states(match_id);
