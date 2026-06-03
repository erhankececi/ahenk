import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { meetByKey } from "@/lib/meet";

/** Buluşma öner / yanıtla. action: propose|accept|reject. */
export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "yetkisiz" }, { status: 401 });

  const { matchId, action, kind } = await req.json().catch(() => ({}));
  if (!matchId || !action) return NextResponse.json({ ok: false, error: "eksik" }, { status: 400 });
  const admin = createAdminClient();

  if (action === "propose") {
    const m = meetByKey(kind);
    if (!m) return NextResponse.json({ ok: false, error: "bad" }, { status: 400 });
    const { data, error } = await supabase.rpc("propose_meet", { p_match: matchId, p_kind: kind });
    if (error || !(data as any)?.ok) return NextResponse.json({ ok: false }, { status: 400 });
    await admin.from("messages").insert({
      match_id: matchId,
      sender_id: user.id,
      type: "text",
      body: `📅 ${m.emoji} ${m.label} buluşması önerdi`,
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "accept" || action === "reject") {
    const { data, error } = await supabase.rpc("respond_meet", {
      p_match: matchId,
      p_status: action === "accept" ? "kabul" : "red",
    });
    if (error || !(data as any)?.ok) return NextResponse.json({ ok: false }, { status: 400 });
    if (action === "accept") {
      await admin.from("messages").insert({
        match_id: matchId,
        sender_id: user.id,
        type: "text",
        body: `✅ Buluşma planlandı! 🎉`,
      });
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false, error: "bad_action" }, { status: 400 });
}
