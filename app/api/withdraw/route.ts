import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

/**
 * Para çekme talebi. Jeton anında düşülür (request_withdraw RPC, atomik),
 * talep "pending" olarak admin onayına düşer. Kur ve min eşik sunucuda sabit.
 */
export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "yetkisiz" }, { status: 401 });

  const { jeton, iban, name } = await req.json().catch(() => ({}));
  const j = Number(jeton);
  if (!Number.isFinite(j) || j <= 0) {
    return NextResponse.json({ ok: false, error: "bad" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("request_withdraw", {
    p_user: user.id,
    p_jeton: Math.floor(j),
    p_iban: String(iban || ""),
    p_name: String(name || ""),
  });
  if (error) return NextResponse.json({ ok: false, error: "db" }, { status: 500 });

  const res = data as { ok: boolean; error?: string; amount_try?: number; min?: number; balance?: number };
  return NextResponse.json(res, { status: res?.ok ? 200 : 400 });
}
