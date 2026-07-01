import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

/** Hikaye sahibinin izleyenleri + tepkileri görmesi (admin; sahip doğrulanır). */
export async function GET(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "yetkisiz" }, { status: 401 });

  const storyId = new URL(req.url).searchParams.get("storyId");
  if (!storyId) return NextResponse.json({ error: "eksik" }, { status: 400 });

  const admin = createAdminClient();
  const { data: story } = await admin.from("stories").select("user_id").eq("id", storyId).single();
  if (!story || story.user_id !== user.id) return NextResponse.json({ error: "yasak" }, { status: 403 });

  const [{ data: views }, { data: reactions }] = await Promise.all([
    admin.from("story_views").select("viewer_id, viewed_at").eq("story_id", storyId).order("viewed_at", { ascending: false }),
    admin.from("story_reactions").select("user_id, emoji").eq("story_id", storyId),
  ]);

  const ids = Array.from(new Set([...(views || []).map((v) => v.viewer_id), ...(reactions || []).map((r) => r.user_id)]));
  const { data: profs } = await admin
    .from("profiles_card")
    .select("id, name")
    .in("id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
  const nameMap = new Map((profs || []).map((p) => [p.id, p.name]));
  const reactMap = new Map((reactions || []).map((r) => [r.user_id, r.emoji]));

  const viewers = (views || []).map((v) => ({
    id: v.viewer_id,
    name: nameMap.get(v.viewer_id) || "Biri",
    emoji: reactMap.get(v.viewer_id) || null,
  }));

  return NextResponse.json({ count: viewers.length, viewers });
}
