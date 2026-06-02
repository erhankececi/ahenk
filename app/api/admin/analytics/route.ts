import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "yetkisiz" }, { status: 401 });

  const { data: me } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!me?.is_admin) return NextResponse.json({ error: "yetkisiz" }, { status: 403 });

  const admin = createAdminClient();
  const now = Date.now();
  const dayAgo = new Date(now - 24 * 3600 * 1000).toISOString();
  const weekAgo = new Date(now - 14 * 24 * 3600 * 1000).toISOString();

  const [
    { count: totalUsers },
    { count: dau },
    { count: matches },
    { count: interactions },
    { count: premium },
    { count: churned },
    { count: messages },
    { count: openReports },
  ] = await Promise.all([
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin.from("profiles").select("*", { count: "exact", head: true }).gt("last_active", dayAgo),
    admin.from("matches").select("*", { count: "exact", head: true }),
    admin.from("interactions").select("*", { count: "exact", head: true }).neq("type", "gec"),
    admin.from("profiles").select("*", { count: "exact", head: true }).neq("premium_plan", "free"),
    admin.from("profiles").select("*", { count: "exact", head: true }).lt("last_active", weekAgo),
    admin.from("messages").select("*", { count: "exact", head: true }),
    admin.from("reports").select("*", { count: "exact", head: true }).eq("status", "acik"),
  ]);

  const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);

  return NextResponse.json({
    dau: dau ?? 0,
    totalUsers: totalUsers ?? 0,
    avgMessagesPerMatch: matches ? Math.round(((messages ?? 0) / matches) * 10) / 10 : 0,
    matchConversion: pct(matches ?? 0, interactions ?? 0),       // eşleşme dönüşümü
    premiumConversion: pct(premium ?? 0, totalUsers ?? 0),       // premium dönüşümü
    churnRate: pct(churned ?? 0, totalUsers ?? 0),               // kayıp oranı
    openReports: openReports ?? 0,
  });
}
