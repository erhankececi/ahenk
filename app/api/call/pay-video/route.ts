import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const VIDEO_COST = 50;

/** Kimya %100'ün altındayken ücretli görüntülü görüşme (50 jeton). */
export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "yetkisiz" }, { status: 401 });

  const { data, error } = await supabase.rpc("spend_jeton", {
    p_amount: VIDEO_COST,
    p_reason: "Görüntülü görüşme",
  });
  if (error) return NextResponse.json({ ok: false, error: "db" }, { status: 400 });
  const res = data as { ok: boolean; error?: string };
  return NextResponse.json({ ...res, cost: VIDEO_COST }, { status: res?.ok ? 200 : 400 });
}
