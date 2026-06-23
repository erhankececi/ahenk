import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GlassCard, Button, IconBox, Progress, Stars } from "@/components/ui";
import { INCOMING_QUESTIONS, REVIEWS } from "@/lib/mock";
import Link from "next/link";
import { Video, TrendingUp, Coins, MessageSquare, Crown, ArrowUpRight, Clock, CheckCircle2, XCircle } from "lucide-react";

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
  const { data: tp } = await supabase.from("teacher_profiles").select("status, coin_balance").eq("user_id", user.id).maybeSingle();
  const firstName = (profile?.full_name || "Öğretmen").split(" ")[0];
  const status = (tp?.status as keyof typeof STATUS) || "pending";
  const coins = tp?.coin_balance ?? 0;
  const s = STATUS[status] ?? STATUS.pending;

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
        <GlassCard className="p-4">
          <IconBox tone="gold"><Coins size={18} /></IconBox>
          <p className="mt-3 text-xs uppercase tracking-wide text-muted">Jeton Bakiyesi</p>
          <p className="text-2xl font-bold">{coins.toLocaleString("tr-TR")}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <IconBox><TrendingUp size={18} /></IconBox>
            <span className="text-xs font-semibold text-success">+12%</span>
          </div>
          <p className="mt-3 text-xs uppercase tracking-wide text-muted">Günlük Kazanç</p>
          <p className="text-2xl font-bold">₺250</p>
        </GlassCard>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-bold"><MessageSquare size={18} className="text-primary" /> Gelen Sorular</h2>
          <Link href="/gelen-sorular" className="text-sm text-primary">Tümünü Gör</Link>
        </div>
        <div className="space-y-3">
          {INCOMING_QUESTIONS.slice(0, 2).map((q) => (
            <GlassCard key={q.id} className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-secondary">{q.subject} · {q.title}</span>
                {q.priority && <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold">ÖNCELİKLİ</span>}
              </div>
              <p className="mt-1.5 text-sm text-muted">{q.desc}</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" className="flex-1">Odada Cevapla</Button>
                <Button size="sm" variant="glass" className="flex-1">Metinle Cevapla</Button>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      <GlassCard className="p-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="font-bold">Profil Gücü</p>
          <span className="text-sm font-bold text-primary">%75</span>
        </div>
        <Progress value={75} />
        <p className="mt-2 text-xs text-muted">Tanıtım videosu ekle (+%15) ve daha çok öğrenciye ulaş.</p>
      </GlassCard>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold">Son Yorumlar</h2>
          <Stars rating={4.9} />
        </div>
        <div className="space-y-3">
          {REVIEWS.map((r) => (
            <GlassCard key={r.id} className="p-4">
              <p className="text-sm italic text-text/90">“{r.text}”</p>
              <p className="mt-2 text-xs text-muted">— {r.author}</p>
            </GlassCard>
          ))}
        </div>
      </section>

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
