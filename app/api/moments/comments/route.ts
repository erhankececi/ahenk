import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

const ZERO = "00000000-0000-0000-0000-000000000000";

export async function GET(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "yetkisiz" }, { status: 401 });
  const momentId = new URL(req.url).searchParams.get("momentId");
  if (!momentId) return NextResponse.json({ error: "eksik" }, { status: 400 });

  const admin = createAdminClient();
  const [{ data: moment }, { data: comments }] = await Promise.all([
    admin.from("moments").select("user_id").eq("id", momentId).single(),
    admin.from("moment_comments").select("*").eq("moment_id", momentId).order("pinned", { ascending: false }).order("created_at", { ascending: true }),
  ]);
  const ids = (comments || []).map((c) => c.id);
  const uids = Array.from(new Set((comments || []).map((c) => c.user_id)));
  const [{ data: likes }, { data: profs }] = await Promise.all([
    admin.from("moment_comment_likes").select("comment_id, user_id").in("comment_id", ids.length ? ids : [ZERO]),
    admin.from("profiles_card").select("id, name").in("id", uids.length ? uids : [ZERO]),
  ]);
  const nameMap = new Map((profs || []).map((p) => [p.id, p.name]));
  const likeCount = new Map<string, number>();
  const likedByMe = new Set<string>();
  (likes || []).forEach((l) => {
    likeCount.set(l.comment_id, (likeCount.get(l.comment_id) || 0) + 1);
    if (l.user_id === user.id) likedByMe.add(l.comment_id);
  });

  const isOwner = moment?.user_id === user.id;
  const list = (comments || []).map((c) => ({
    id: c.id,
    parent_id: c.parent_id as string | null,
    user_id: c.user_id,
    name: nameMap.get(c.user_id) || "Biri",
    text: c.text,
    created_at: c.created_at,
    pinned: !!c.pinned,
    likes: likeCount.get(c.id) || 0,
    liked: likedByMe.has(c.id),
    mine: c.user_id === user.id,
    canRemove: c.user_id === user.id || isOwner,
    canPin: isOwner,
  }));
  return NextResponse.json({ comments: list, isOwner });
}

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "yetkisiz" }, { status: 401 });
  const { action, momentId, commentId, text, parentId } = await req.json().catch(() => ({}));
  const admin = createAdminClient();

  if (action === "add") {
    if (!momentId || !text?.trim()) return NextResponse.json({ ok: false }, { status: 400 });
    const { data: m } = await admin.from("moments").select("comments_off").eq("id", momentId).single();
    if (m?.comments_off) return NextResponse.json({ ok: false, error: "kapali" }, { status: 403 });
    const { data, error } = await supabase
      .from("moment_comments")
      .insert({ moment_id: momentId, user_id: user.id, text: text.trim().slice(0, 500), parent_id: parentId || null })
      .select()
      .single();
    if (error) return NextResponse.json({ ok: false }, { status: 400 });
    return NextResponse.json({ ok: true, id: data.id });
  }
  if (action === "like" || action === "unlike") {
    if (action === "like") await supabase.from("moment_comment_likes").upsert({ comment_id: commentId, user_id: user.id });
    else await supabase.from("moment_comment_likes").delete().eq("comment_id", commentId).eq("user_id", user.id);
    return NextResponse.json({ ok: true });
  }
  if (action === "delete") {
    const { data: c } = await admin.from("moment_comments").select("user_id, moment_id").eq("id", commentId).single();
    if (!c) return NextResponse.json({ ok: false }, { status: 404 });
    const { data: m } = await admin.from("moments").select("user_id").eq("id", c.moment_id).single();
    if (c.user_id !== user.id && m?.user_id !== user.id) return NextResponse.json({ ok: false }, { status: 403 });
    await admin.from("moment_comments").delete().eq("id", commentId);
    return NextResponse.json({ ok: true });
  }
  if (action === "pin" || action === "unpin") {
    const { data: c } = await admin.from("moment_comments").select("moment_id").eq("id", commentId).single();
    const { data: m } = await admin.from("moments").select("user_id").eq("id", c?.moment_id).single();
    if (m?.user_id !== user.id) return NextResponse.json({ ok: false }, { status: 403 });
    await admin.from("moment_comments").update({ pinned: action === "pin" }).eq("id", commentId);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false, error: "bad_action" }, { status: 400 });
}
