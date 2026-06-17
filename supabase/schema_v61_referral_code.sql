-- =====================================================================
--  AHENK — Şema v61 (DAVET KODU otomatik üretimi + backfill)
--  ADDITIVE + idempotent. Davet sistemi (referral_code) artık her üyede
--  dolu olur → davet linki (ahenk.live/register?ref=KOD) çalışır.
--  Davet eden 250 jeton, davetle gelen 25 jeton (mevcut handler).
-- =====================================================================

-- 1) Mevcut null kodları doldur — id'den deterministik 8 hex (unique index güvenli).
update public.profiles
  set referral_code = upper(substr(md5(id::text), 1, 8))
  where referral_code is null;

-- 2) Yeni kullanıcı handler'ı: profil eklenirken referral_code da atanır.
--    (INSERT yolu; BEFORE UPDATE guard'ı tetiklemez.)
create or replace function fn_handle_new_user() returns trigger as $$
declare ref_code text; ref_id uuid;
begin
  insert into public.profiles (id, name, referral_code)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    upper(substr(md5(new.id::text), 1, 8))
  )
  on conflict (id) do nothing;

  -- Eski profillerde (ör. conflict) kod boşsa tamamla.
  update public.profiles
    set referral_code = upper(substr(md5(new.id::text), 1, 8))
    where id = new.id and referral_code is null;

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
