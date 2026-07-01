import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { BADGES } from "@/lib/achievements";

/** Kullanıcının başarı/rozet durumu — mevcut verilerden hesaplanır. */
export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "yetkisiz" }, { status: 401 });
  const uid = user.id;
  const admin = createAdminClient();

  const [
    { count: matches },
    { count: messages },
    { count: voiceCalls },
    { count: videoCalls },
    { count: eventsJoined },
    { count: eventsHosted },
    { count: giftsSent },
    { count: invited },
    { data: prof },
  ] = await Promise.all([
    admin.from("matches").select("*", { count: "exact", head: true }).or(`user_a.eq.${uid},user_b.eq.${uid}`),
    admin.from("messages").select("*", { count: "exact", head: true }).eq("sender_id", uid),
    admin.from("calls").select("*", { count: "exact", head: true }).eq("type", "voice").eq("status", "ended").or(`caller_id.eq.${uid},callee_id.eq.${uid}`),
    admin.from("calls").select("*", { count: "exact", head: true }).eq("type", "video").eq("status", "ended").or(`caller_id.eq.${uid},callee_id.eq.${uid}`),
    admin.from("event_requests").select("*", { count: "exact", head: true }).eq("user_id", uid),
    admin.from("events").select("*", { count: "exact", head: true }).eq("host_id", uid),
    admin.from("gift_sends").select("*", { count: "exact", head: true }).eq("from_user", uid),
    admin.from("profiles").select("*", { count: "exact", head: true }).eq("referred_by", uid),
    admin.from("profiles").select("streak_count").eq("id", uid).single(),
  ]);

  const stats: Record<string, number> = {
    matches: matches ?? 0,
    messages: messages ?? 0,
    voiceCalls: voiceCalls ?? 0,
    videoCalls: videoCalls ?? 0,
    eventsJoined: eventsJoined ?? 0,
    eventsHosted: eventsHosted ?? 0,
    giftsSent: giftsSent ?? 0,
    invited: invited ?? 0,
    streak: prof?.streak_count ?? 0,
  };

  const badges = BADGES.map((b) => {
    const cur = stats[b.stat] ?? 0;
    return { ...b, current: Math.min(cur, b.need), earned: cur >= b.need };
  });

  return NextResponse.json({ badges, earned: badges.filter((b) => b.earned).length, total: BADGES.length });
}
