// Ahenk Live — migration runner (Faz 1-6).
// 5 migration'ı Supabase Management API ile sırayla çalıştırır.
// REF, .env.local içindeki NEXT_PUBLIC_SUPABASE_URL'den okunur (yeni proje).
// Token gövdeye yazılmaz; SUPABASE_PAT env değişkeninden okunur.
// Kullanım:  SUPABASE_PAT=sbp_xxx node scripts/run-ahenk-migrations.mjs
import { readFileSync } from "node:fs";
import { join } from "node:path";

const PAT = process.env.SUPABASE_PAT;
if (!PAT) { console.error("HATA: SUPABASE_PAT env değişkeni yok."); process.exit(1); }

// REF: önce SUPABASE_REF env'den, yoksa .env.local'deki URL'den.
let REF = process.env.SUPABASE_REF;
if (!REF) {
  const env = readFileSync(join(process.cwd(), ".env.local"), "utf8");
  const line = env.split(/\r?\n/).find((l) => l.startsWith("NEXT_PUBLIC_SUPABASE_URL="));
  const url = line ? line.split("=").slice(1).join("=").trim().replace(/^["']|["']$/g, "") : null;
  REF = url ? new URL(url).host.split(".")[0] : null;
}
if (!REF) { console.error("HATA: SUPABASE_REF yok ve .env.local'den de okunamadı."); process.exit(1); }

const FILES = [
  "0001_ahenk_live_init.sql",
  "0002_questions_and_coins.sql",
  "0003_payments_and_coin_packages.sql",
  "0004_live_rooms.sql",
  "0005_moderation_notifications_admin.sql",
];
const endpoint = `https://api.supabase.com/v1/projects/${REF}/database/query`;

async function runSql(name, sql) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${PAT}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: sql }),
  });
  const text = await res.text();
  if (!res.ok) { console.error(`\n❌ ${name} — HTTP ${res.status}\n${text.slice(0, 3000)}`); return false; }
  console.log(`✓ ${name} — OK`);
  return true;
}

console.log(`Hedef proje: ${REF}\n`);
for (const f of FILES) {
  const sql = readFileSync(join(process.cwd(), "supabase", "migrations", f), "utf8");
  process.stdout.write(`→ ${f} (${sql.length} bayt)... `);
  if (!(await runSql(f, sql))) { console.error(`\nDURDU: ${f} başarısız. Üstteki hatayı çöz, sonra tekrar dene.`); process.exit(1); }
}
console.log(`\n🎉 5/5 migration başarıyla çalıştı.`);
