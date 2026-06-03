import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { profilTamamlanma } from "@/lib/energy";

function bugun() {
  return new Date().toISOString().slice(0, 10);
}
function dunMu(d: string | null) {
  if (!d) return false;
  const dun = new Date();
  dun.setDate(dun.getDate() - 1);
  return d === dun.toISOString().slice(0, 10);
}

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "yetkisiz" }, { status: 401 });

  const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!p) return NextResponse.json({ error: "profil yok" }, { status: 404 });

  const today = bugun();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const sod = startOfDay.toISOString();

  const [
    { count: photoCount },
    { count: msgsToday },
    { count: momentsToday },
    { count: totalMsgs },
    { count: matchCount },
    { count: giftToday },
    { count: promptCount },
    { count: invitedCount },
  ] = await Promise.all([
    supabase.from("photos").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("sender_id", user.id)
      .gt("created_at", sod),
    supabase
      .from("moments")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gt("created_at", sod),
    supabase.from("messages").select("*", { count: "exact", head: true }).eq("sender_id", user.id),
    supabase
      .from("matches")
      .select("*", { count: "exact", head: true })
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`),
    supabase
      .from("gift_sends")
      .select("*", { count: "exact", head: true })
      .eq("from_user", user.id)
      .gt("created_at", sod),
    supabase.from("prompt_answers").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("referred_by", user.id),
  ]);

  // ---------- streak güncelle ----------
  let streak = p.streak_count || 0;
  if (p.streak_last !== today) {
    streak = dunMu(p.streak_last) ? streak + 1 : 1;
  }

  // ---------- referans kodu (yoksa üret) ----------
  let code = p.referral_code as string | null;
  if (!code) {
    code = (user.id.replace(/-/g, "").slice(0, 4) + Math.random().toString(36).slice(2, 6)).toUpperCase();
  }

  await supabase
    .from("profiles")
    .update({ streak_count: streak, streak_last: today, referral_code: code })
    .eq("id", user.id);
  await supabase
    .from("activity_log")
    .upsert({ user_id: user.id, day: today, events: 1 }, { onConflict: "user_id,day" });

  const completion = profilTamamlanma({ ...p, photoCount: photoCount ?? 0 });

  const tasks = [
    { id: "profil", label: "Profilini tamamla", reward: 50, key: "task:profil", done: completion >= 1 },
    { id: "vibe", label: "Bugünkü modunu seç", reward: 10, key: `task:vibe:${today}`, done: p.vibe_at?.slice(0, 10) === today },
    { id: "ses", label: "Sesli tanıtım kartı ekle", reward: 40, key: "task:ses", done: !!p.voice_card_path },
    { id: "mesaj", label: "Bir mesaj gönder", reward: 10, key: `task:mesaj:${today}`, done: (msgsToday ?? 0) > 0 },
    { id: "an", label: "Bir an paylaş", reward: 15, key: `task:an:${today}`, done: (momentsToday ?? 0) > 0 },
    { id: "foto3", label: "3 fotoğraf ekle", reward: 40, key: "task:foto3", done: (photoCount ?? 0) >= 3 },
    { id: "ilkmesaj", label: "İlk sohbetini başlat", reward: 30, key: "task:ilkmesaj", done: (totalMsgs ?? 0) > 0 },
    { id: "ilkeslesme", label: "İlk eşleşmeni yap", reward: 75, key: "task:ilkeslesme", done: (matchCount ?? 0) > 0 },
    { id: "seri7", label: "7 gün üst üste gir", reward: 100, key: "task:seri7", done: streak >= 7 },
    { id: "prompt", label: "Bir soruya yanıt ver (prompt)", reward: 25, key: "task:prompt", done: (promptCount ?? 0) > 0 },
    { id: "hediye", label: "Bir hediye gönder", reward: 20, key: `task:hediye:${today}`, done: (giftToday ?? 0) > 0 },
    { id: "davet", label: "Bir arkadaşını davet et", reward: 150, key: "task:davet", done: (invitedCount ?? 0) > 0 },
  ];

  // Tamamlanan görevlerin jetonunu ver (server-only RPC, idempotent — aynı key tekrar ödemez).
  const admin = createAdminClient();
  await Promise.all(
    tasks
      .filter((t) => t.done)
      .map((t) =>
        admin.rpc("award_jeton", { p_user: user.id, p_key: t.key, p_amount: t.reward, p_reason: t.label })
      )
  );
  const { data: bal } = await supabase.from("profiles").select("jeton").eq("id", user.id).single();

  return NextResponse.json({
    streak,
    completion: Math.round(completion * 100),
    referralCode: code,
    jeton: bal?.jeton ?? 0,
    tasks: tasks.map(({ id, label, reward, done }) => ({ id, label, reward, done })),
  });
}
