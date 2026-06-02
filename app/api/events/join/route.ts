import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "yetkisiz" }, { status: 401 });

  const { event_id } = await request.json();
  if (!event_id) return NextResponse.json({ error: "event_id gerekli" }, { status: 400 });

  const { error } = await supabase
    .from("event_requests")
    .upsert({ event_id, user_id: user.id, status: "bekliyor" }, { onConflict: "event_id,user_id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
