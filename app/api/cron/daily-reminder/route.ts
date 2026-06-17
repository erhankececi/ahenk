import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const ZERO = "00000000-0000-0000-0000-000000000000";

// Günlük re-engagement: bugün soruyu yanıtlamamış sıcak-aktif kullanıcılara
// "Günün sorusu hazır" in-app bildirimi ekler. Vercel Cron tarafından çağrılır.
// Güvenlik: Authorization: Bearer ${CRON_SECRET}. Secret yoksa çalışmaz.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "yetkisiz" }, { status: 401 });
  }

  const admin = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);
  const since14 = new Date(Date.now() - 14 * 86400_000).toISOString();
  const dayStart = `${today}T00:00:00.000Z`;

  // Bugün yanıtlayanlar (onları rahatsız etme).
  const { data: answered } = await admin.from("daily_answers").select("user_id").eq("day", today);
  const answeredIds = new Set((answered || []).map((r: any) => r.user_id as string));

  // Bugün zaten hatırlatma almışlar (mükerrer önleme).
  const { data: already } = await admin
    .from("notifications")
    .select("user_id")
    .eq("type", "daily")
    .gte("created_at", dayStart);
  const alreadyIds = new Set((already || []).map((r: any) => r.user_id as string));

  // Son 14 günde aktif, banlanmamış, silinmemiş kullanıcılar (sıcak-idle havuz).
  const { data: pool } = await admin
    .from("profiles")
    .select("id, notif_prefs")
    .gte("last_active", since14)
    .is("deleted_at", null)
    .or("banned.is.null,banned.eq.false")
    .order("last_active", { ascending: false })
    .limit(2000);

  // notif_prefs.daily === false olanlar günlük hatırlatma istemiyor (opt-out).
  const targets = (pool || [])
    .filter((r: any) => r?.notif_prefs?.daily !== false)
    .map((r: any) => r.id as string)
    .filter((id) => id && id !== ZERO && !answeredIds.has(id) && !alreadyIds.has(id))
    .slice(0, 1000);

  if (targets.length === 0) return NextResponse.json({ ok: true, sent: 0 });

  const rows = targets.map((user_id) => ({
    user_id,
    type: "daily",
    payload: { kind: "daily", text: "Günün sorusu hazır — gün serini koru, 20 jeton seni bekliyor." },
    is_read: false,
  }));

  const { error } = await admin.from("notifications").insert(rows);
  if (error) return NextResponse.json({ ok: false, error: "db", detail: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, sent: rows.length });
}
