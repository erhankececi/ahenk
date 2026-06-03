import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { todayQuestion } from "@/lib/dailyQuestions";

function bugun() {
  return new Date().toISOString().slice(0, 10);
}

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "yetkisiz" }, { status: 401 });

  const today = bugun();
  const { data: row } = await supabase
    .from("daily_answers")
    .select("answer")
    .eq("user_id", user.id)
    .eq("day", today)
    .maybeSingle();

  return NextResponse.json({ question: todayQuestion().text, answered: !!row, answer: row?.answer ?? null, reward: 20 });
}

export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "yetkisiz" }, { status: 401 });

  const { answer } = await req.json().catch(() => ({}));
  const a = String(answer || "").trim().slice(0, 500);
  if (!a) return NextResponse.json({ ok: false, error: "bos" }, { status: 400 });

  const today = bugun();
  const { error } = await supabase
    .from("daily_answers")
    .upsert({ user_id: user.id, day: today, answer: a }, { onConflict: "user_id,day" });
  if (error) return NextResponse.json({ ok: false, error: "db" }, { status: 500 });

  // Günde bir kez jeton ödülü (idempotent key).
  const admin = createAdminClient();
  const { data: bal } = await admin.rpc("award_jeton", {
    p_user: user.id,
    p_key: `task:daily:${today}`,
    p_amount: 20,
    p_reason: "Günün sorusu yanıtlandı",
  });
  return NextResponse.json({ ok: true, balance: bal });
}
