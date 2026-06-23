import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GlassCard, Button, IconBox, Progress } from "@/components/ui";
import { Coins, Target, CalendarCheck, ArrowUpRight, Crown, Clock, CheckCircle2, XCircle, Video } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS = {
  pending: { label: "Başvurun değerlendiriliyor", icon: Clock, cls: "border-gold/30 bg-gold/10 text-gold" },
  approved: { label: "Onaylı Koç", icon: CheckCircle2, cls: "border-success/30 bg-success/10 text-success" },
  rejected: { label: "Başvuru reddedildi", icon: XCircle, cls: "border-danger/30 bg-danger/10 text-danger" },
} as const;

export default async function CoachDashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
  const { data: cp } = await supabase.from("coach_profiles").select("status, coin_balance").eq("user_id", user.id).maybeSingle();
  const { data: rooms } = await supabase.from("live_rooms").select("id, title, status, participant_count").eq("host_id", user.id).order("created_at", { ascending: false }).limit(3);
  const firstName = (profile?.full_name || "Koç").split(" ")[0];
  const status = (cp?.status as keyof typeof STATUS) || "pending";
  const coins = cp?.coin_balance ?? 0;
  const s = STATUS[status] ?? STATUS.pending;

  return (
    <div className="space-y-5 pb-4">
      <div>
        <p className="text-sm text-muted">Hoş geldiniz, {firstName} 👋</p>
        <h1 className="text-2xl font-bold">Koç Panelin</h1>
      </div>

      <div className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium ${s.cls}`}>
        <s.icon size={16} /> {s.label}
      </div>

      <Button href="/odalarim" size="lg" className="w-full"><Video size={18} /> Canlı Oda Aç</Button>

      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="p-4">
          <IconBox tone="gold"><Coins size={18} /></IconBox>
          <p className="mt-3 text-xs uppercase tracking-wide text-muted">Jeton Kazancı</p>
          <p className="text-2xl font-bold">{coins.toLocaleString("tr-TR")}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <IconBox tone="gold"><Target size={18} /></IconBox>
          <p className="mt-3 text-xs uppercase tracking-wide text-muted">Başarı Oranı</p>
          <p className="text-2xl font-bold">%94</p>
        </GlassCard>
      </div>

      <section>
        <h2 className="mb-3 font-bold">Odalarım</h2>
        {!rooms || rooms.length === 0 ? (
          <GlassCard className="p-6 text-center text-sm text-muted">Henüz oda açmadın. Deneme analizi, koçluk veya motivasyon odası aç.</GlassCard>
        ) : (
          <div className="space-y-2">
            {rooms.map((r) => (
              <a key={r.id} href={`/odalar/${r.id}`} className="flex items-center justify-between rounded-xl border border-line bg-surface px-4 py-3">
                <div>
                  <p className="text-sm font-semibold">{r.title}</p>
                  <p className="text-xs text-muted">{r.status === "live" ? "Canlı" : r.status === "scheduled" ? "Yakında" : "Bitti"} · {r.participant_count} katılımcı</p>
                </div>
                <ArrowUpRight size={16} className="text-primary" />
              </a>
            ))}
          </div>
        )}
      </section>

      <GlassCard className="p-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="font-bold">Profil Gücü</p>
          <span className="text-sm font-bold text-primary">%80</span>
        </div>
        <Progress value={80} />
        <p className="mt-2 text-xs text-muted">Referans ekle ve daha çok öğrenciye önerilen koç ol.</p>
      </GlassCard>

      <GlassCard className="gold-card p-5">
        <div className="flex items-center gap-3">
          <IconBox tone="gold"><Crown size={20} /></IconBox>
          <div className="flex-1">
            <p className="font-bold text-premium">Koç Pro</p>
            <p className="text-xs text-muted">Sınırsız öğrenci, gelişmiş analiz ve öncelikli görünürlük.</p>
          </div>
        </div>
        <Button href="/premium" variant="gold" size="sm" className="mt-4 w-full">Şimdi Yükselt <ArrowUpRight size={16} /></Button>
      </GlassCard>
    </div>
  );
}
