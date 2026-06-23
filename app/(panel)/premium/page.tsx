import { GlassCard, Button } from "@/components/ui";
import { Crown, Check } from "lucide-react";

const PLANS = [
  { name: "Aylık", price: "₺99", per: "/ay", featured: false },
  { name: "Yıllık", price: "₺799", per: "/yıl", featured: true },
];
const FEATURES = ["Sınırsız soru çözümü", "Öncelikli cevap", "Koçluk indirimi", "Reklamsız deneyim", "Tüm canlı odalara erişim"];

export default function Premium() {
  return (
    <div className="space-y-5 pb-4">
      <div className="text-center">
        <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/12 text-gold"><Crown size={28} /></span>
        <h1 className="mt-3 text-2xl font-bold text-premium">Öğrenci Premium</h1>
        <p className="mt-1 text-sm text-muted">Öğrenmeni hızlandır, sınırsız erişim kazan.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {PLANS.map((p) => (
          <GlassCard key={p.name} className={`p-5 text-center ${p.featured ? "gold-card" : ""}`}>
            {p.featured && <span className="mb-2 inline-block rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold">EN AVANTAJLI</span>}
            <p className="text-sm text-muted">{p.name}</p>
            <p className="mt-1 text-3xl font-bold">{p.price}<span className="text-sm font-normal text-muted">{p.per}</span></p>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="p-5">
        <ul className="space-y-3">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-2.5 text-sm">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-primary"><Check size={12} strokeWidth={3} /></span>
              {f}
            </li>
          ))}
        </ul>
      </GlassCard>

      <Button variant="gold" size="lg" className="w-full">Premium'a Geç</Button>
      <p className="text-center text-xs text-muted">Ödeme altyapısı bir sonraki sürümde aktifleşecek.</p>
    </div>
  );
}
