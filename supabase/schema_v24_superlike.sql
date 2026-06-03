-- =====================================================================
--  AHENK — Şema v24 (SÜPER BEĞENİ — "Çok ilgimi çektin")
--  ADDITIVE + idempotent. Günde 1 ücretsiz; fazlası 30 jeton.
--  Süper beğeni ayrıca normal pozitif etkileşim ('tanis') yaratır → eşleşme
--  mantığı aynen işler; super_likes satırı "süper" işaretidir.
-- =====================================================================

create table if not exists super_likes (
  from_user  uuid not null references profiles(id) on delete cascade,
  to_user    uuid not null references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (from_user, to_user)
);
create index if not exists idx_super_to on super_likes (to_user);

alter table super_likes enable row level security;
drop policy if exists p_super_rw on super_likes;
create policy p_super_rw on super_likes for all
  using (auth.uid() = from_user) with check (auth.uid() = from_user);
drop policy if exists p_super_read_in on super_likes;
create policy p_super_read_in on super_likes for select using (auth.uid() = to_user);

-- Günlük 1 ücretsiz; fazlası 30 jeton. Atomik (server-only).
create or replace function super_like_charge(p_user uuid) returns jsonb as $$
declare cnt int; cost int := 30; bal int;
begin
  select count(*) into cnt from super_likes
    where from_user = p_user and created_at::date = current_date;
  if cnt < 1 then
    return jsonb_build_object('ok', true, 'free', true);
  end if;
  select coalesce(jeton, 0) into bal from profiles where id = p_user for update;
  if bal < cost then
    return jsonb_build_object('ok', false, 'error', 'insufficient', 'cost', cost, 'balance', bal);
  end if;
  update profiles set jeton = jeton - cost where id = p_user;
  insert into jeton_ledger(user_id, key, amount, reason)
    values (p_user, 'super:' || gen_random_uuid()::text, -cost, 'Süper beğeni');
  return jsonb_build_object('ok', true, 'free', false, 'spent', cost);
end;
$$ language plpgsql security definer set search_path = public;
revoke all on function super_like_charge(uuid) from anon, authenticated;
