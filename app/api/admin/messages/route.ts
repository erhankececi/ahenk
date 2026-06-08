import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

// Admin: bir kullanıcının mesajlarını incele (şikayet/yasal). HER erişim audit'e yazılır.
export async function GET(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "yetkisiz" }, { status: 401 });
  const { data: me } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!me?.is_admin) return NextResponse.json({ error: "yetkisiz" }, { status: 403 });

  const url = new URL(req.url);
  const memberNo = url.searchParams.get("memberNo");
  const reason = url.searchParams.get("reason") || "";
  if (!memberNo) return NextResponse.json({ error: "memberNo gerekli" }, { status: 400 });

  const admin = createAdminClient();
  const { data: target } = await admin
    .from("profiles").select("id, name, member_no, city, banned").eq("member_no", parseInt(memberNo, 10)).maybeSingle();
  if (!target) return NextResponse.json({ error: "bulunamadı" }, { status: 404 });

  // DENETİM KAYDI — kim, ne zaman, kime baktı
  await admin.from("admin_audit").insert({
    admin_id: user.id, action: "view_messages", target_user: target.id,
    meta: `member_no=${memberNo}${reason ? ` · sebep: ${reason.slice(0, 200)}` : ""}`,
  });

  // Bu kullanıcının dahil olduğu eşleşmeler + mesajlar
  const { data: matches } = await admin
    .from("matches").select("id, user_a, user_b").or(`user_a.eq.${target.id},user_b.eq.${target.id}`);
  const matchIds = (matches || []).map((m) => m.id);
  const otherOf = new Map<string, string>();
  (matches || []).forEach((m) => otherOf.set(m.id, m.user_a === target.id ? m.user_b : m.user_a));

  const { data: msgs } = matchIds.length
    ? await admin.from("messages")
        .select("id, match_id, sender_id, type, body, orig_body, created_at")
        .in("match_id", matchIds).order("created_at", { ascending: false }).limit(200)
    : { data: [] as any[] };

  const otherIds = Array.from(new Set((matches || []).map((m) => (m.user_a === target.id ? m.user_b : m.user_a))));
  const { data: profs } = otherIds.length
    ? await admin.from("profiles").select("id, name, member_no").in("id", otherIds)
    : { data: [] as any[] };
  const nameMap = new Map((profs || []).map((p: any) => [p.id, `${p.name} (#${p.member_no})`]));

  const messages = (msgs || []).map((m) => ({
    id: m.id,
    fromTarget: m.sender_id === target.id,
    withUser: nameMap.get(otherOf.get(m.match_id) || "") || "—",
    type: m.type,
    body: m.orig_body || m.body, // orijinal (gönderirken çeviri varsa)
    created_at: m.created_at,
  }));

  return NextResponse.json({
    target: { id: target.id, name: target.name, member_no: target.member_no, city: target.city, banned: target.banned },
    messages,
  });
}
