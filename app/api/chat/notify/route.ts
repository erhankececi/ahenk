import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendPush } from "@/lib/push";

/**
 * Yeni mesaj bildirimi: gönderen mesajı yazınca karşı tarafa push gönderir.
 * Gizlilik: mesaj içeriği gönderilmez. tag=match ile aynı sohbetin bildirimleri
 * tek bildirimde toplanır (spam olmaz).
 */
export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const { matchId } = await req.json().catch(() => ({}));
  if (!matchId) return NextResponse.json({ ok: false }, { status: 400 });

  const admin = createAdminClient();
  const { data: match } = await admin
    .from("matches")
    .select("user_a, user_b")
    .eq("id", matchId)
    .single();
  if (!match || (match.user_a !== user.id && match.user_b !== user.id)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }
  const otherId = match.user_a === user.id ? match.user_b : match.user_a;

  // Gönderenin adı (push başlığı için).
  const { data: me } = await admin.from("profiles_card").select("name").eq("id", user.id).single();

  await sendPush(otherId, {
    title: me?.name ? `${me.name} sana yazdı` : "Yeni mesajın var 💬",
    body: "Sohbeti açıp yanıtla.",
    url: `/sohbet/${matchId}`,
    tag: `chat-${matchId}`,
  });

  return NextResponse.json({ ok: true });
}
