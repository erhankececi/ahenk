import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendPush } from "@/lib/push";

/**
 * Hediye gönder: gönderenin jetonu düşer, alıcı %70 kazanır (send_gift RPC,
 * atomik). Varsa sohbete hediye mesajı bırakılır.
 */
export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "yetkisiz" }, { status: 401 });

  const { to_user, gift, matchId } = await req.json().catch(() => ({}));
  if (!to_user || !gift) return NextResponse.json({ ok: false, error: "bad" }, { status: 400 });

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("send_gift", {
    p_from: user.id,
    p_to: to_user,
    p_gift: gift,
  });
  if (error) return NextResponse.json({ ok: false, error: "db" }, { status: 500 });

  const res = data as { ok: boolean; error?: string; cost?: number; earned?: number; label?: string };
  if (!res?.ok) return NextResponse.json(res ?? { ok: false }, { status: 400 });

  if (matchId) {
    await admin.from("messages").insert({
      match_id: matchId,
      sender_id: user.id,
      type: "text",
      body: `🎁 ${res.label} gönderdi`,
    });
    // Hediye kimyayı ekstra artırır.
    await admin.rpc("add_chemistry", { p_match: matchId, p_amount: 8 });
  }

  // Alıcıya bildirim: hediye geldiğini ve kaç jeton kazandığını gör.
  await admin.from("notifications").insert({
    user_id: to_user,
    type: "gift",
    payload: { from: user.id, label: res.label, earned: res.earned },
  });
  await sendPush(to_user, {
    title: "Sana bir hediye geldi! 🎁",
    body: `${res.label} aldın — +${res.earned} jeton kazandın.`,
    url: "/eslesmeler",
    tag: "gift",
  });

  return NextResponse.json(res);
}
