import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const CONSENT_VERSION = "2026-06-09";

// Kayıt anında açık rıza kaydı (Koşullar+Gizlilik+KVKK+18). Zaman+IP ile saklanır.
export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const fwd = req.headers.get("x-forwarded-for") || "";
  const ip = fwd.split(",")[0].trim() || req.headers.get("x-real-ip") || null;
  try {
    await supabase.from("consents").insert({
      user_id: user.id, docs: "terms+privacy+kvkk+age18", version: CONSENT_VERSION, ip,
    });
  } catch {}
  return NextResponse.json({ ok: true });
}
