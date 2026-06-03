// Ahenk — migration runner. Supabase Management API üzerinden 4 SQL göçünü
// sırayla çalıştırır. Token GÖVDEYE yazılmaz; SUPABASE_PAT env değişkeninden okunur.
// Kullanım:  SUPABASE_PAT=... node scripts/run-migrations.mjs
import { readFileSync } from "node:fs";
import { join } from "node:path";

const REF = "fhuwrwayoenyywexjglj";
const PAT = process.env.SUPABASE_PAT;
const FILES = ["schema.sql", "schema_v2.sql", "schema_v3.sql", "schema_v4_security.sql", "schema_v5_jeton.sql", "schema_v6_store.sql", "schema_v7_subscriptions.sql", "schema_v8_geo.sql", "schema_v9_premium_view.sql", "schema_v10_calls.sql", "schema_v11_theme.sql", "schema_v12_member.sql", "schema_v13_account_deletion.sql", "schema_v14_age_min.sql", "schema_v15_rate_limit.sql", "schema_v16_moderation.sql", "schema_v17_ban_enforce.sql", "schema_v18_profile_guard.sql", "schema_v19_incognito.sql", "schema_v20_push.sql", "schema_v21_feedback.sql", "schema_v22_discover_gender.sql", "schema_v23_prompts.sql", "schema_v24_superlike.sql", "schema_v25_auto_moderate.sql", "schema_v26_gifts.sql", "schema_v27_leaderboard.sql", "schema_v28_withdraw.sql", "schema_v29_withdraw_bigamount.sql", "schema_v30_withdraw_uuidfix.sql", "schema_v31_soft_delete.sql", "schema_v32_event_rsvp.sql", "schema_v33_gift_catalog.sql", "schema_v34_chemistry.sql"];

if (!PAT) {
  console.error("HATA: SUPABASE_PAT env değişkeni yok.");
  process.exit(1);
}

const endpoint = `https://api.supabase.com/v1/projects/${REF}/database/query`;

async function runSql(name, sql) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAT}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`\n❌ ${name} — HTTP ${res.status}`);
    console.error(text.slice(0, 2000));
    return false;
  }
  console.log(`✓ ${name} — OK (HTTP ${res.status})`);
  return true;
}

for (const file of FILES) {
  const sql = readFileSync(join(process.cwd(), "supabase", file), "utf8");
  process.stdout.write(`→ ${file} çalıştırılıyor (${sql.length} bayt)... `);
  const ok = await runSql(file, sql);
  if (!ok) {
    console.error(`\nDURDU: ${file} başarısız oldu. Üstteki hatayı düzeltmeden devam etme.`);
    process.exit(1);
  }
}

console.log(`\n🎉 Tüm göçler başarıyla çalıştı (${FILES.length}/${FILES.length}).`);
