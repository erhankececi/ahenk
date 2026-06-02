import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendPush } from "@/lib/push";

const VALID = ["ilginc", "tanis", "ortak", "daha_fazla", "gec"];
const POSITIVE = ["ilginc", "tanis", "ortak"];

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "yetkisiz" }, { status: 401 });

  const { to_user, type } = await request.json();
  if (!to_user || !VALID.includes(type))
    return NextResponse.json({ error: "geçersiz istek" }, { status: 400 });
  if (to_user === user.id)
    return NextResponse.json({ error: "kendine işlem yapılamaz" }, { status: 400 });

  await supabase
    .from("interactions")
    .upsert({ from_user: user.id, to_user, type }, { onConflict: "from_user,to_user" });

  // profil ziyareti kaydet (premium "kimler baktı" özelliği)
  await supabase
    .from("profile_visits")
    .upsert(
      { visitor_id: user.id, visited_id: to_user, visited_at: new Date().toISOString() },
      { onConflict: "visitor_id,visited_id" }
    );

  // eşleşme oluştu mu? (trigger oluşturur, biz kontrol ederiz)
  const a = user.id < to_user ? user.id : to_user;
  const b = user.id < to_user ? to_user : user.id;
  const { data: match } = await supabase
    .from("matches")
    .select("id")
    .eq("user_a", a)
    .eq("user_b", b)
    .maybeSingle();

  // Eşleşme olmadıysa karşı tarafa "beğeni" bildirimi gönder. Alıcı ≠ aktör
  // olduğu için notifications RLS'i (auth.uid() = user_id) anon client'ı engeller
  // → server-authored insert service-role ile. (Eşleşmede bildirimi SQL trigger atar.)
  if (match) {
    // Eşleşme bildirimini SQL trigger atar; burada yalnız push gönderiyoruz.
    await sendPush(to_user, {
      title: "Yeni eşleşme! 💜",
      body: "Biriyle eşleştiniz — sohbete başla.",
      url: "/eslesmeler",
      tag: "match",
    });
  } else if (POSITIVE.includes(type)) {
    const admin = createAdminClient();
    await admin
      .from("notifications")
      .insert({ user_id: to_user, type: "like", payload: { from: user.id, kind: type } });
    await sendPush(to_user, {
      title: "Yeni beğeni 👀",
      body: "Birinin ilgisini çektin.",
      url: "/begenenler",
      tag: "like",
    });
  }

  return NextResponse.json({ matched: !!match, matchId: match?.id ?? null });
}
