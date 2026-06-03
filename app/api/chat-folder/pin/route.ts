import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { createClient, createAdminClient } from "@/lib/supabase/server";

const hash = (pin: string) => createHash("sha256").update(`ahenk:${pin}`).digest("hex");

/** Gizli klasör PIN'i: action 'set' | 'verify' | 'status'. */
export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "yetkisiz" }, { status: 401 });

  const { action, pin } = await req.json().catch(() => ({}));
  const admin = createAdminClient();

  if (action === "status") {
    const { data } = await admin.from("profiles").select("chat_pin_hash").eq("id", user.id).single();
    return NextResponse.json({ ok: true, hasPin: !!data?.chat_pin_hash });
  }

  const p = String(pin || "");
  if (!/^\d{4,8}$/.test(p)) return NextResponse.json({ ok: false, error: "bad_pin" }, { status: 400 });

  if (action === "set") {
    await admin.from("profiles").update({ chat_pin_hash: hash(p) }).eq("id", user.id);
    return NextResponse.json({ ok: true });
  }
  if (action === "verify") {
    const { data } = await admin.from("profiles").select("chat_pin_hash").eq("id", user.id).single();
    return NextResponse.json({ ok: !!data?.chat_pin_hash && data.chat_pin_hash === hash(p) });
  }
  return NextResponse.json({ ok: false, error: "bad_action" }, { status: 400 });
}
