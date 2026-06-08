import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "yetkisiz" }, { status: 401 });
  const { data: me } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!me?.is_admin) return NextResponse.json({ error: "yetkisiz" }, { status: 403 });

  const admin = createAdminClient();
  const now = Date.now();
  const iso = (ms: number) => new Date(ms).toISOString();
  const DAY = 24 * 3600 * 1000;
  const dayAgo = iso(now - DAY);
  const weekAgo = iso(now - 7 * DAY);
  const monthAgo = iso(now - 30 * DAY);
  const twoWeekAgo = iso(now - 14 * DAY);

  const [
    { count: totalUsers },
    { count: dau },
    { count: wau },
    { count: mau },
    { count: newToday },
    { count: new7d },
    { count: new30d },
    { count: matches },
    { count: interactions },
    { count: premium },
    { count: churned },
    { count: messages },
    { count: openReports },
    { count: referred },
    { count: visitsToday },
    { count: visits7d },
    { count: visits30d },
    { count: visitsTotal },
    { data: signupRows },
    { data: visitRows },
  ] = await Promise.all([
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin.from("profiles").select("*", { count: "exact", head: true }).gt("last_active", dayAgo),
    admin.from("profiles").select("*", { count: "exact", head: true }).gt("last_active", weekAgo),
    admin.from("profiles").select("*", { count: "exact", head: true }).gt("last_active", monthAgo),
    admin.from("profiles").select("*", { count: "exact", head: true }).gt("created_at", dayAgo),
    admin.from("profiles").select("*", { count: "exact", head: true }).gt("created_at", weekAgo),
    admin.from("profiles").select("*", { count: "exact", head: true }).gt("created_at", monthAgo),
    admin.from("matches").select("*", { count: "exact", head: true }),
    admin.from("interactions").select("*", { count: "exact", head: true }).neq("type", "gec"),
    admin.from("profiles").select("*", { count: "exact", head: true }).neq("premium_plan", "free"),
    admin.from("profiles").select("*", { count: "exact", head: true }).lt("last_active", twoWeekAgo),
    admin.from("messages").select("*", { count: "exact", head: true }),
    admin.from("reports").select("*", { count: "exact", head: true }).eq("status", "acik"),
    admin.from("profiles").select("*", { count: "exact", head: true }).not("referred_by", "is", null),
    admin.from("site_visits").select("*", { count: "exact", head: true }).gt("created_at", dayAgo),
    admin.from("site_visits").select("*", { count: "exact", head: true }).gt("created_at", weekAgo),
    admin.from("site_visits").select("*", { count: "exact", head: true }).gt("created_at", monthAgo),
    admin.from("site_visits").select("*", { count: "exact", head: true }),
    admin.from("profiles").select("created_at").gt("created_at", iso(now - 365 * DAY)).limit(100000),
    admin.from("site_visits").select("created_at").gt("created_at", monthAgo).limit(200000),
  ]);

  // --- zaman serileri (JS'te kovala) ---
  const hourly = Array.from({ length: 24 }, (_, i) => ({ label: `${i}:00`, n: 0 }));
  const daily = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now - (29 - i) * DAY);
    return { key: d.toISOString().slice(0, 10), label: d.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" }), n: 0 };
  });
  const monthly = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - (11 - i));
    return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, label: d.toLocaleDateString("tr-TR", { month: "short", year: "2-digit" }), n: 0 };
  });
  const dailyIdx = new Map(daily.map((d, i) => [d.key, i]));
  const monthlyIdx = new Map(monthly.map((m, i) => [m.key, i]));

  (signupRows || []).forEach((r: any) => {
    const t = new Date(r.created_at).getTime();
    if (t > now - DAY) hourly[new Date(r.created_at).getHours()].n++;
    const dk = new Date(r.created_at).toISOString().slice(0, 10);
    if (dailyIdx.has(dk)) daily[dailyIdx.get(dk)!].n++;
    const mk = r.created_at.slice(0, 7);
    if (monthlyIdx.has(mk)) monthly[monthlyIdx.get(mk)!].n++;
  });

  // ziyaret günlük serisi
  const visitDaily = daily.map((d) => ({ ...d, n: 0 }));
  const vIdx = new Map(visitDaily.map((d, i) => [d.key, i]));
  const visitHourly = Array.from({ length: 24 }, (_, i) => ({ label: `${i}:00`, n: 0 }));
  (visitRows || []).forEach((r: any) => {
    const dk = new Date(r.created_at).toISOString().slice(0, 10);
    if (vIdx.has(dk)) visitDaily[vIdx.get(dk)!].n++;
    if (new Date(r.created_at).getTime() > now - DAY) visitHourly[new Date(r.created_at).getHours()].n++;
  });

  const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);

  return NextResponse.json({
    // mevcut özet
    dau: dau ?? 0, totalUsers: totalUsers ?? 0,
    avgMessagesPerMatch: matches ? Math.round(((messages ?? 0) / matches) * 10) / 10 : 0,
    matchConversion: pct(matches ?? 0, interactions ?? 0),
    premiumConversion: pct(premium ?? 0, totalUsers ?? 0),
    churnRate: pct(churned ?? 0, totalUsers ?? 0),
    openReports: openReports ?? 0,
    // üyeler
    members: {
      total: totalUsers ?? 0, today: newToday ?? 0, week: new7d ?? 0, month: new30d ?? 0,
      referred: referred ?? 0, organic: (totalUsers ?? 0) - (referred ?? 0),
    },
    active: { dau: dau ?? 0, wau: wau ?? 0, mau: mau ?? 0 },
    traffic: {
      total: visitsTotal ?? 0, today: visitsToday ?? 0, week: visits7d ?? 0, month: visits30d ?? 0,
    },
    signups: { hourly, daily, monthly },
    visits: { hourly: visitHourly, daily: visitDaily },
  });
}
