import Link from "next/link";
import { Logo } from "@/components/Logo";
import { GlassCard } from "@/components/ui";
import { Users, UserCheck, Radio, MessageSquare, Coins, Flag } from "lucide-react";

const METRICS = [
  { icon: Users, label: "Toplam Kullanıcı", value: "—", tone: "primary" },
  { icon: UserCheck, label: "Bekleyen Öğretmen Başvuruları", value: "—", tone: "gold" },
  { icon: Radio, label: "Canlı Odalar", value: "—", tone: "primary" },
  { icon: MessageSquare, label: "Sorular", value: "—", tone: "primary" },
  { icon: Coins, label: "Jeton Satışları", value: "—", tone: "gold" },
  { icon: Flag, label: "Şikayetler", value: "—", tone: "primary" },
];

export default function Admin() {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-3xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between border-b border-line pb-4">
        <Link href="/"><Logo size={22} /></Link>
        <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Admin Panel</span>
      </header>

      <h1 className="text-2xl font-bold">Genel Bakış</h1>
      <p className="mt-1 text-sm text-muted">Platform metrikleri ve yönetim. (Placeholder — gerçek veriler Supabase ile gelecek.)</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {METRICS.map((m) => (
          <GlassCard key={m.label} className="p-5">
            <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${m.tone === "gold" ? "bg-gold/12 text-gold" : "bg-primary/12 text-primary"}`}>
              <m.icon size={20} />
            </span>
            <p className="mt-3 text-3xl font-bold">{m.value}</p>
            <p className="mt-1 text-xs leading-tight text-muted">{m.label}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
