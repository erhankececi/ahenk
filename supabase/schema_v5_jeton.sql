-- =====================================================================
--  AHENK — Şema v5 (JETON ekonomisi)
--  ADDITIVE + idempotent. schema.sql, _v2, _v3, _v4_security sonrası çalıştır.
--  Görevleri tamamladıkça jeton kazanılır (10 en kolay → 250 en zor/davet).
--  Eski "1 hafta Premium" davet ödülü yerine "her katılan arkadaş için 250 jeton".
-- =====================================================================

-- 1) Bakiye kolonu
alter table profiles add column if not exists jeton int not null default 0;

-- 2) Defter (çift ödül engeli): aynı (user_id, key) bir kez ödüllenir
create table if not exists jeton_ledger (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references profiles(id) on delete cascade,
  key        text not null,        -- ör: 'task:vibe:2026-06-01', 'task:profil', 'ref:<uuid>'
  amount     int  not null,
  reason     text,
  created_at timestamptz default now(),
  unique (user_id, key)
);
create index if not exists idx_jeton_user on jeton_ledger(user_id, created_at desc);

alter table jeton_ledger enable row level security;
-- Sahibi kendi geçmişini okur; yazma yalnız sunucu (security definer fn / service_role).
drop policy if exists p_jeton_read on jeton_ledger;
create policy p_jeton_read on jeton_ledger for select using (auth.uid() = user_id);

-- 3) Atomik ödül fonksiyonu — aynı key ikinci kez ödül vermez.
create or replace function award_jeton(p_user uuid, p_key text, p_amount int, p_reason text default null)
returns int as $$
begin
  insert into public.jeton_ledger(user_id, key, amount, reason)
  values (p_user, p_key, p_amount, p_reason)
  on conflict (user_id, key) do nothing;
  if found then
    update public.profiles set jeton = coalesce(jeton,0) + p_amount where id = p_user;
  end if;
  return (select coalesce(jeton,0) from public.profiles where id = p_user);
end;
$$ language plpgsql security definer set search_path = public;

-- Normal kullanıcı bu fonksiyonu çağırıp keyfî jeton basamasın (yalnız server).
revoke all on function award_jeton(uuid, text, int, text) from anon, authenticated;

-- 4) Yeni kullanıcı trigger'ını referral işleme + ödülle güncelle.
--    Davetle gelen 25 jeton hoşgeldin, davet eden 250 jeton kazanır.
create or replace function fn_handle_new_user() returns trigger as $$
declare ref_code text; ref_id uuid;
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)))
  on conflict (id) do nothing;

  ref_code := nullif(upper(trim(new.raw_user_meta_data->>'ref')), '');
  if ref_code is not null then
    select id into ref_id from public.profiles where upper(referral_code) = ref_code limit 1;
    if ref_id is not null and ref_id <> new.id then
      update public.profiles set referred_by = ref_id where id = new.id;
      perform public.award_jeton(ref_id, 'ref:' || new.id::text, 250, 'Arkadaş daveti');
      perform public.award_jeton(new.id, 'welcome:ref', 25, 'Davetle hoş geldin');
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_new_user on auth.users;
create trigger trg_new_user after insert on auth.users
  for each row execute function fn_handle_new_user();
