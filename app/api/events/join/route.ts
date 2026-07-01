import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "yetkisiz" }, { status: 401 });

  const { event_id, rsvp } = await request.json();
  if (!event_id || !rsvp) return NextResponse.json({ error: "eksik" }, { status: 400 });

  // RSVP'yi RPC ile ayarla (kullanıcı kendi niyetini değiştirebilir — RLS update
  // host'a kapalı olduğundan SECURITY DEFINER set_rsvp kullanılır).
  const { data, error } = await supabase.rpc("set_rsvp", { p_event: event_id, p_rsvp: rsvp });
  if (error) return NextResponse.json({ error: "db" }, { status: 400 });
  const res = data as { ok: boolean; error?: string };
  return NextResponse.json(res, { status: res?.ok ? 200 : 400 });
}
