const ref = process.env.SUPABASE_REF;
const pat = process.env.SUPABASE_PAT;
const sql = `select
  (select count(*) from information_schema.tables where table_schema='public') as tablo_sayisi,
  (select count(*) from public.coin_packages) as jeton_paketi,
  (select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public') as fonksiyon,
  (select count(*) from pg_policies where schemaname='public') as rls_policy,
  (select count(*) from pg_publication_tables where pubname='supabase_realtime' and tablename='room_messages') as realtime_room_messages,
  (select count(*) from storage.buckets where id='question-images') as soru_bucket;`;
const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: "POST",
  headers: { Authorization: `Bearer ${pat}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query: sql }),
});
console.log(res.ok ? "OK\n" + (await res.text()) : "HATA " + res.status + "\n" + (await res.text()));
