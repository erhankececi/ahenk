import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MEDIA_URL = (path: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${path}`;

// Kullanıcının TÜM geçmiş hikayeleri (süresi dolmuş dahil). Sadece sahibi.
export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "yetkisiz" }, { status: 401 });

  const { data: stories } = await supabase
    .from("stories")
    .select("id, type, text, media_path, created_at, expires_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(200);

  const now = Date.now();
  const items = (stories || []).map((s) => ({
    id: s.id,
    type: s.type,
    text: s.text,
    media: s.media_path ? MEDIA_URL(s.media_path) : null,
    created_at: s.created_at,
    active: new Date(s.expires_at).getTime() > now,
  }));
  return NextResponse.json({ items });
}
