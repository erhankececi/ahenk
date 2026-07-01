import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Etkinlik sahibi bir katılımcıyı onaylar/reddeder (manage_rsvp RPC, host kontrolü
 * fonksiyon içinde). status: 'kabul' | 'red' | 'bekliyor'.
 */
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "yetkisiz" }, { status: 401 });

  const { event_id, user_id, status } = await request.json();
  if (!event_id || !user_id || !status) return NextResponse.json({ error: "eksik" }, { status: 400 });

  const { data, error } = await supabase.rpc("manage_rsvp", {
    p_event: event_id,
    p_user: user_id,
    p_status: status,
  });
  if (error) return NextResponse.json({ error: "db" }, { status: 400 });
  const res = data as { ok: boolean; error?: string };
  return NextResponse.json(res, { status: res?.ok ? 200 : 400 });
}
