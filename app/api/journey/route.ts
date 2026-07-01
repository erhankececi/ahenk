import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { kurucuUye } from "@/lib/utils";

// İlk 7 Gün Yolculuğu — 7 görevin tamamlanma durumu (retention onboarding).
export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "yetkisiz" }, { status: 401 });
  const uid = user.id;
  const admin = createAdminClient();

  const head = (q: any) => q.then((r: any) => (r.count ?? 0) > 0);

  const [p, photoOk, daily, like, msg, moment, davet] = await Promise.all([
    supabase.from("profiles").select("bio, interests, city, profession, member_no").eq("id", uid).single(),
    head(supabase.from("photos").select("id", { count: "exact", head: true }).eq("user_id", uid)),
    head(supabase.from("daily_answers").select("day", { count: "exact", head: true }).eq("user_id", uid)),
    head(supabase.from("interactions").select("to_user", { count: "exact", head: true }).eq("from_user", uid)),
    head(supabase.from("messages").select("id", { count: "exact", head: true }).eq("sender_id", uid)),
    head(supabase.from("moments").select("id", { count: "exact", head: true }).eq("user_id", uid)),
    head(admin.from("profiles").select("id", { count: "exact", head: true }).eq("referred_by", uid)),
  ]);

  const prof: any = p.data || {};
  const profilTamam = !!prof.bio && !!prof.city && (prof.interests?.length || 0) > 0 && photoOk;

  const steps = [
    { key: "profil", done: profilTamam },
    { key: "gunluk", done: daily },
    { key: "begeni", done: like },
    { key: "mesaj", done: msg },
    { key: "moment", done: moment },
    { key: "davet", done: davet },
    { key: "kurucu", done: kurucuUye(prof.member_no) },
  ];

  return NextResponse.json({ steps, done: steps.filter((s) => s.done).length, total: steps.length });
}
