import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

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
  }

  return NextResponse.json(res);
}
