import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button, GlassCard, LiveBadge, Avatar, Stars, IconBox } from "@/components/ui";
import { QuestionCard } from "@/components/QuestionCard";
import { TEACHERS } from "@/lib/mock";
import Link from "next/link";
import { Camera, Coins, Crown, Users, ArrowRight, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentDashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
  const { data: sp } = await supabase.from("student_profiles").select("coin_balance").eq("user_id", user.id).maybeSingle();
  const firstName = (profile?.full_name || "Öğrenci").split(" ")[0];
  const coins = sp?.coin_balance ?? 0;
  const { data: recentQ } = await supabase.from("questions").select("*").eq("student_id", user.id).order("created_at", { ascending: false }).limit(3);

  const { data: liveRooms } = await supabase.from("live_rooms").select("*, profiles(full_name)").in("status", ["live", "scheduled"]).order("created_at", { ascending: false }).limit(3);
  const activeRooms = liveRooms || [];
  const recommended = TEACHERS.filter((t) => t.kind === "ogretmen").slice(0, 3);

  return (
    <div className="space-y-6 pb-4">
      <div>
        <p className="text-sm text-muted">Hoş geldin, {firstName} 👋</p>
        <h1 className="text-2xl font-bold">Bugün neye çalışıyoruz?</h1>
      </div>

      <GlassCard className="flex items-center justify-between p-5">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">Jeton Bakiyen</p>
          <p className="mt-1 flex items-center gap-2 text-3xl font-bold text-gold"><Coins size={24} /> {coins.toLocaleString("tr-TR")}</p>
        </div>
        <Button href="/cuzdan" variant="glass" size="sm">Jeton Al</Button>
      </GlassCard>

      <Link href="/soru-sor" className="btn-primary flex items-center justify-between rounded-2xl px-5 py-4">
        <span className="flex items-center gap-3 font-bold"><Camera size={22} /> Fotoğrafla Soru Sor</span>
        <ArrowRight size={20} />
      </Link>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold">Aktif Canlı Odalar</h2>
          <Link href="/odalar" className="text-sm text-primary">Tümü</Link>
        </div>
        {activeRooms.length === 0 ? (
          <GlassCard className="p-6 text-center text-sm text-muted">Şu an aktif oda yok. Yakında yeni odalar açılacak.</GlassCard>
        ) : (
          <div className="space-y-3">
            {activeRooms.map((r: any) => (
              <Link key={r.id} href={`/odalar/${r.id}`} className="block">
                <GlassCard className="p-4 transition hover:border-primary/30">
                  <div className="flex items-start justify-between">
                    <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-muted">{r.exam_type || r.subject}</span>
                    <LiveBadge soon={r.status !== "live"} label={r.status === "live" ? "Canlı" : "Yakında"} />
                  </div>
                  <h3 className="mt-2 font-bold">{r.title}</h3>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs text-muted"><Users size={14} /> {r.participant_count}</span>
                    <Button size="sm">{r.status === "live" ? "Katıl" : "Gör"}</Button>
                  </div>
                </GlassCard>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold">Son Sorularım</h2>
          <Link href="/sorularim" className="text-sm text-primary">Tümü</Link>
        </div>
        {recentQ && recentQ.length > 0 ? (
          <div className="space-y-3">
            {recentQ.map((q) => <QuestionCard key={q.id} q={q} href={`/sorularim/${q.id}`} />)}
          </div>
        ) : (
          <GlassCard className="p-6 text-center text-sm text-muted">
            Henüz soru sormadın. <Link href="/soru-sor" className="font-medium text-primary">İlk soruyu sor →</Link>
          </GlassCard>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold">Önerilen Öğretmenler</h2>
          <Link href="/ogretmenler" className="text-sm text-primary">Tümü</Link>
        </div>
        <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4">
          {recommended.map((t) => (
            <GlassCard key={t.id} className="w-44 shrink-0 p-4 text-center">
              <Avatar name={t.name} size={48} color="#B6C4FF" />
              <p className="mt-2 truncate text-sm font-bold">{t.name}</p>
              <p className="truncate text-xs text-muted">{t.branch}</p>
              <div className="mt-1 flex justify-center"><Stars rating={t.rating} /></div>
              <Button href="/ogretmenler" variant="glass" size="sm" className="mt-3 w-full">Profili Gör</Button>
            </GlassCard>
          ))}
        </div>
      </section>

      <GlassCard className="gold-card p-5">
        <div className="flex items-center gap-3">
          <IconBox tone="gold"><Crown size={20} /></IconBox>
          <div className="flex-1">
            <p className="font-bold text-premium">Öğrenci Premium</p>
            <p className="text-xs text-muted">Sınırsız soru, öncelikli cevap, koçluk indirimi.</p>
          </div>
        </div>
        <Button href="/premium" variant="gold" size="sm" className="mt-4 w-full"><TrendingUp size={16} /> Premium'a Yükselt</Button>
      </GlassCard>
    </div>
  );
}
