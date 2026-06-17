import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { todayQuestion } from "@/lib/dailyQuestions";

function bugun() {
  return new Date().toISOString().slice(0, 10);
}
function gunOnce(n: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

// Bugün (varsa) veya dünden geriye doğru kesintisiz gün serisi.
function seriHesapla(gunler: Set<string>): number {
  const offset = gunler.has(bugun()) ? 0 : 1;
  let seri = 0;
  for (let i = offset; i < 400; i++) {
    if (gunler.has(gunOnce(i))) seri++;
    else break;
  }
  return seri;
}

async function gunSeti(supabase: any, userId: string): Promise<Set<string>> {
  const { data } = await supabase
    .from("daily_answers")
    .select("day")
    .eq("user_id", userId)
    .order("day", { ascending: false })
    .limit(40);
  return new Set((data || []).map((r: any) => r.day as string));
}

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "yetkisiz" }, { status: 401 });

  const today = bugun();
  const gunler = await gunSeti(supabase, user.id);
  const answered = gunler.has(today);
  const { data: row } = answered
    ? await supabase.from("daily_answers").select("answer").eq("user_id", user.id).eq("day", today).maybeSingle()
    : { data: null };

  return NextResponse.json({
    question: todayQuestion().text,
    answered,
    answer: row?.answer ?? null,
    reward: 20,
    streak: seriHesapla(gunler),
  });
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

  const admin = createAdminClient();
  // Günlük temel ödül (idempotent).
  const { data: bal } = await admin.rpc("award_jeton", {
    p_user: user.id,
    p_key: `task:daily:${today}`,
    p_amount: 20,
    p_reason: "Günün sorusu yanıtlandı",
  });

  // Bugünü dahil ederek seriyi hesapla; 3. ve 7. gün bonus (idempotent, güne özgü key).
  const gunler = await gunSeti(supabase, user.id);
  gunler.add(today);
  const streak = seriHesapla(gunler);
  let bonus = 0;
  if (streak === 3) bonus = 50;
  else if (streak === 7) bonus = 150;
  if (bonus > 0) {
    await admin.rpc("award_jeton", {
      p_user: user.id,
      p_key: `streak:${streak}:${today}`,
      p_amount: bonus,
      p_reason: `${streak} günlük seri bonusu`,
    });
  }

  return NextResponse.json({ ok: true, balance: bal, streak, bonus });
}
