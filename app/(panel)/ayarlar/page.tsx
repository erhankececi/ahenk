import { GlassCard } from "@/components/ui";
import Link from "next/link";
import { User, Bell, Shield, HelpCircle, LogOut, ChevronRight } from "lucide-react";

const ITEMS = [
  { icon: User, label: "Profil Bilgileri" },
  { icon: Bell, label: "Bildirimler" },
  { icon: Shield, label: "Gizlilik ve Güvenlik" },
  { icon: HelpCircle, label: "Yardım ve Destek" },
];

export default function Settings() {
  return (
    <div className="space-y-5 pb-4">
      <h1 className="text-2xl font-bold">Ayarlar</h1>
      <GlassCard className="divide-y divide-line p-2">
        {ITEMS.map((it) => (
          <button key={it.label} className="flex w-full items-center gap-3 px-3 py-3.5 text-left transition hover:text-primary">
            <it.icon size={18} className="text-muted" />
            <span className="flex-1 text-sm font-medium">{it.label}</span>
            <ChevronRight size={16} className="text-muted" />
          </button>
        ))}
      </GlassCard>
      <Link href="/" className="flex items-center justify-center gap-2 rounded-xl border border-line py-3 text-sm font-medium text-danger transition hover:border-danger/40">
        <LogOut size={16} /> Çıkış Yap
      </Link>
    </div>
  );
}
