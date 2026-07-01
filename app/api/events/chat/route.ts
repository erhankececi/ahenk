import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/events/chat?eventId=...  → etkinlik sohbet mesajları (RLS: yalnız katılımcı)
export async function GET(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "yetkisiz" }, { status: 401 });
  const eventId = new URL(req.url).searchParams.get("eventId");
  if (!eventId) return NextResponse.json({ error: "eksik" }, { status: 400 });

  const { data: msgs, error } = await supabase
    .from("event_messages")
    .select("id, sender_id, body, created_at")
    .eq("event_id", eventId)
    .order("created_at")
    .limit(200);
  if (error) return NextResponse.json({ messages: [], me: user.id });

  const ids = Array.from(new Set((msgs || []).map((m) => m.sender_id)));
  const { data: profs } = await supabase
    .from("profiles_card").select("id, name")
    .in("id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
  const nameMap = new Map((profs || []).map((p) => [p.id, p.name]));

  const messages = (msgs || []).map((m) => ({
    id: m.id, body: m.body, created_at: m.created_at,
    sender_id: m.sender_id, name: nameMap.get(m.sender_id) || "Biri", mine: m.sender_id === user.id,
  }));
  return NextResponse.json({ messages, me: user.id });
}

// POST /api/events/chat  body:{ eventId, body }
export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const { eventId, body } = await req.json().catch(() => ({}));
  if (!eventId || !body?.trim()) return NextResponse.json({ ok: false }, { status: 400 });

  const { error } = await supabase
    .from("event_messages")
    .insert({ event_id: eventId, sender_id: user.id, body: body.trim().slice(0, 1000) });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 403 });
  return NextResponse.json({ ok: true });
}
