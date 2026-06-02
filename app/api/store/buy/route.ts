import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

const ITEMS = new Set(["boost", "premium_day", "premium_week"]);

export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "yetkisiz" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const item = body?.item as string | undefined;
  if (!item || !ITEMS.has(item)) {
    return NextResponse.json({ ok: false, error: "bad_item" }, { status: 400 });
  }

  // Harcama + etki tek atomik DB fonksiyonunda (bakiye kontrolü dahil). Server-only.
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("buy_item", { p_user: user.id, p_item: item });
  if (error) return NextResponse.json({ ok: false, error: "db" }, { status: 500 });

  const res = data as { ok: boolean; error?: string; balance?: number; cost?: number };
  if (!res?.ok) {
    return NextResponse.json(res ?? { ok: false, error: "fail" }, { status: 400 });
  }
  return NextResponse.json(res);
}
