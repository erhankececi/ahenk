import { Button, GlassCard, LiveBadge, Avatar, Stars, IconBox } from "@/components/ui";
import { ROOMS, RECENT_ANSWERS, TEACHERS } from "@/lib/mock";
import Link from "next/link";
import { Camera, Coins, Crown, Users, ArrowRight, CheckCircle2, TrendingUp } from "lucide-react";

export default function StudentDashboard() {
  const activeRooms = ROOMS.filter((r) => r.status === "canli").slice(0, 3);
  const recommended = TEACHERS.filter((t) => t.kind === "ogretmen").slice(0, 3);

  return (
    <div className="space-y-6 pb-4">
      {/* Hoş geldin */}
      <div>
        <p className="text-sm text-muted">Hoş geldin 👋</p>
        <h1 className="text-2xl font-bold">Bugün neye çalışıyoruz?</h1>
      </div>

      {/* Jeton bakiyesi */}
      <GlassCard className="flex items-center justify-between p-5">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">Jeton Bakiyen</p>
          <p className="mt-1 flex items-center gap-2 text-3xl font-bold text-gold"><Coins size={24} /> 1.250</p>
        </div>
        <Button href="/cuzdan" variant="glass" size="sm">Jeton Al</Button>
      </GlassCard>

      {/* Soru sor CTA */}
      <Link href="/soru-sor" className="btn-primary flex items-center justify-between rounded-2xl px-5 py-4">
        <span className="flex items-center gap-3 font-bold"><Camera size={22} /> Fotoğrafla Soru Sor</span>
        <ArrowRight size={20} />
      </Link>

      {/* Aktif canlı odalar */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold">Aktif Canlı Odalar</h2>
          <Link href="/odalar" className="text-sm text-primary">Tümü</Link>
        </div>
        <div className="space-y-3">
          {activeRooms.map((r) => (
            <GlassCard key={r.id} className="p-4">
              <div className="flex items-start justify-between">
                <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-muted">{r.tag}</span>
                <LiveBadge />
              </div>
              <h3 className="mt-2 font-bold">{r.name}</h3>
              <div className="mt-3 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs text-muted"><Users size={14} /> {r.participants}</span>
                <Button href="/odalar" size="sm">Katıl</Button>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Son cevaplar */}
      <section>
        <h2 className="mb-3 font-bold">Son Cevaplar</h2>
        <div className="space-y-2">
          {RECENT_ANSWERS.map((a) => (
            <GlassCard key={a.id} className="flex items-center gap-3 p-4">
              <IconBox><CheckCircle2 size={18} /></IconBox>
              <div className="flex-1">
                <p className="text-sm font-semibold">{a.subject} sorusu</p>
                <p className="text-xs text-muted">{a.teacher} · {a.time}</p>
              </div>
              <span className="text-xs font-medium text-success">{a.status}</span>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Önerilen öğretmenler */}
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

      {/* Premium yükseltme */}
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
