import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { isActivePremium } from "@/lib/plans";

const WEEK = 7 * 24 * 60 * 60 * 1000;

/** Premium Plus profil & görünürlük analizi. */
export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "yetkisiz" }, { status: 401 });

  const { data: me } = await supabase
    .from("profiles")
    .select("premium_plan, premium_until, bio, voice_card_path")
    .eq("id", user.id)
    .single();

  const plan = isActivePremium(me) ? me?.premium_plan : "free";
  const isPlus = plan === "platinum" || plan === "legend";
  if (!isPlus) return NextResponse.json({ locked: true });

  const uid = user.id;
  const since = new Date(Date.now() - WEEK).toISOString();
  const admin = createAdminClient();

  const [
    { count: viewsWeek },
    { count: repeatViewers },
    { count: totalViewers },
    { count: calledYou },
    { count: likesWeek },
    { count: matchesWeek },
    { count: photoCount },
  ] = await Promise.all([
    admin.from("profile_visits").select("*", { count: "exact", head: true }).eq("visited_id", uid).gt("visited_at", since),
    admin.from("profile_visits").select("*", { count: "exact", head: true }).eq("visited_id", uid).gte("visit_count", 2),
    admin.from("profile_visits").select("*", { count: "exact", head: true }).eq("visited_id", uid),
    admin.from("calls").select("*", { count: "exact", head: true }).eq("callee_id", uid),
    admin.from("interactions").select("*", { count: "exact", head: true }).eq("to_user", uid).neq("type", "gec").gt("created_at", since),
    admin.from("matches").select("*", { count: "exact", head: true }).or(`user_a.eq.${uid},user_b.eq.${uid}`).gt("created_at", since),
    admin.from("photos").select("*", { count: "exact", head: true }).eq("user_id", uid),
  ]);

  const tips: string[] = [];
  if ((photoCount ?? 0) < 3) tips.push("3+ fotoğraf ekleyenler 2 kat daha fazla beğeni alıyor.");
  if (!me?.bio) tips.push("Kısa bir biyografi eklemek profil ziyaretlerini artırır.");
  if (!me?.voice_card_path) tips.push("Sesli tanıtım kartı ekleyenler daha hızlı eşleşiyor.");
  if (!tips.length) tips.push("Profilin güçlü görünüyor — aktif kalman görünürlüğünü artırır.");

  return NextResponse.json({
    locked: false,
    viewsWeek: viewsWeek ?? 0,
    repeatViewers: repeatViewers ?? 0,
    totalViewers: totalViewers ?? 0,
    calledYou: calledYou ?? 0,
    likesWeek: likesWeek ?? 0,
    matchesWeek: matchesWeek ?? 0,
    tips,
  });
}
