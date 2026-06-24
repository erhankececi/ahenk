import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { GlassCard, Button, IconBox } from "@/components/ui";
import { QuestionCard } from "@/components/QuestionCard";
import { Video, Coins, MessageSquare, Crown, ArrowUpRight, Clock, CheckCircle2, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS = {
  pending: { label: "Başvurun değerlendiriliyor", icon: Clock, cls: "border-gold/30 bg-gold/10 text-gold" },
  approved: { label: "Onaylı Öğretmen", icon: CheckCircle2, cls: "border-success/30 bg-success/10 text-success" },
  rejected: { label: "Başvuru reddedildi", icon: XCircle, cls: "border-danger/30 bg-danger/10 text-danger" },
} as const;

export default async function TeacherPanel() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
  const { data: tp } = await supabase.from("teacher_profiles").select("status, coin_balance, answered_questions").eq("user_id", user.id).maybeSingle();
  const { data: qs } = await supabase
    .from("questions")
    .select("id, subject, title, status, priority, teacher_id, claimed_by, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  const firstName = (profile?.full_name || "Öğretmen").split(" ")[0];
  const status = (tp?.status as keyof typeof STATUS) || "pending";
  const coins = tp?.coin_balance ?? 0;
  const answered = tp?.answered_questions ?? 0;
  const s = STATUS[status] ?? STATUS.pending;

  const incoming = (qs || [])
    .filter((q: any) => (q.status === "open" && !q.teacher_id) || (q.status === "assigned" && (q.teacher_id === user.id || q.claimed_by === user.id)))
    .slice(0, 3);

  return (
    <div className="space-y-5 pb-4">
      <div>
        <p className="text-sm text-muted">Hoş geldiniz, {firstName} 👋</p>
        <h1 className="text-2xl font-bold">Öğretmen Panelin</h1>
      </div>

      {/* Başvuru durumu */}
      <div className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium ${s.cls}`}>
        <s.icon size={16} /> {s.label}
      </div>

      <Button href="/odalarim" size="lg" className="w-full"><Video size={18} /> Canlı Oda Aç</Button>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/cuzdan" className="block">
          <GlassCard className="p-4 transition hover:border-primary/30">
            <IconBox tone="gold"><Coins size={18} /></IconBox>
            <p className="mt-3 text-xs uppercase tracking-wide text-muted">Jeton Bakiyesi</p>
            <p className="text-2xl font-bold">{coins.toLocaleString("tr-TR")}</p>
          </GlassCard>
        </Link>
        <Link href="/gelen-sorular" className="block">
          <GlassCard className="p-4 transition hover:border-primary/30">
            <IconBox><CheckCircle2 size={18} /></IconBox>
            <p className="mt-3 text-xs uppercase tracking-wide text-muted">Cevapladığın Soru</p>
            <p className="text-2xl font-bold">{answered.toLocaleString("tr-TR")}</p>
          </GlassCard>
        </Link>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-bold"><MessageSquare size={18} className="text-primary" /> Gelen Sorular</h2>
          <Link href="/gelen-sorular" className="text-sm text-primary">Tümünü Gör</Link>
        </div>
        {incoming.length === 0 ? (
          <GlassCard className="p-6 text-center text-sm text-muted">Henüz gelen sorun yok. Havuza yeni soru düştükçe burada görünür.</GlassCard>
        ) : (
          <div className="space-y-3">
            {incoming.map((q: any) => <QuestionCard key={q.id} q={q} href={`/gelen-sorular/${q.id}`} />)}
          </div>
        )}
      </section>

      {coins === 0 && answered === 0 && (
        <GlassCard className="p-5 text-center text-sm text-muted">
          Kazançların, cevapladığın sorular ve jetonlu odalardan sonra burada birikecek.
        </GlassCard>
      )}

      <GlassCard className="gold-card p-5">
        <div className="flex items-center gap-3">
          <IconBox tone="gold"><Crown size={20} /></IconBox>
          <div className="flex-1">
            <p className="font-bold text-premium">Premium / Pro Yükseltme</p>
            <p className="text-xs text-muted">Gelişmiş istatistik, öncelikli oda yerleşimi ve daha fazla kazanç.</p>
          </div>
        </div>
        <Button href="/premium" variant="gold" size="sm" className="mt-4 w-full">Şimdi Yükselt <ArrowUpRight size={16} /></Button>
      </GlassCard>
    </div>
  );
}
