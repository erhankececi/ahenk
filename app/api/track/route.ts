import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

// Site ziyaret kaydı (anonim dahil). Oturum varsa user_id eklenir.
// Client oturum başına 1 kez çağırır (sessionStorage guard). Service-role ile yazılır.
export async function POST(req: Request) {
  try {
    const { path, ref } = await req.json().catch(() => ({}));
    let userId: string | null = null;
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      userId = data.user?.id || null;
    } catch {}
    // İstemci IP'si (Vercel: x-forwarded-for). 5651/KVKK trafik logu.
    const fwd = req.headers.get("x-forwarded-for") || "";
    const ip = fwd.split(",")[0].trim() || req.headers.get("x-real-ip") || null;
    const admin = createAdminClient();
    await admin.from("site_visits").insert({
      user_id: userId,
      path: (path || "/").toString().slice(0, 200),
      ref: (ref || "").toString().slice(0, 300) || null,
      ip,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
