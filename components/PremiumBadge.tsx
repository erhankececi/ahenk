import { Crown, BadgeCheck, Sparkles, Gem } from "lucide-react";

export type Tier = "free" | "plus" | "gold" | "platinum" | "legend";

// Tier eşlemesi: plus=PLUS(Silver Club) · gold=PREMIUM(Royal Gold) ·
// platinum=PREMIUM PLUS(Imperial Elite) · legend=LEGEND(Black Diamond)
export function PremiumBadge({ tier, className = "" }: { tier?: string | null; className?: string }) {
  if (tier === "legend")
    return (
      <span
        className={`legend-badge name-tag inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold tracking-wide ${className}`}
      >
        <Gem size={11} /> LEGEND
      </span>
    );
  if (tier === "platinum")
    return (
      <span
        className={`name-tag inline-flex items-center gap-1 rounded-full border border-[#d4af37]/60 bg-black px-2 py-0.5 text-[11px] font-bold text-[#f4e6a1] ${className}`}
      >
        <Crown size={11} /> Premium Plus
      </span>
    );
  if (tier === "gold")
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2 py-0.5 text-[11px] font-semibold text-amber-300 ring-1 ring-amber-400/40 ${className}`}
      >
        <BadgeCheck size={11} /> Premium
      </span>
    );
  if (tier === "plus")
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-slate-300/15 px-2 py-0.5 text-[11px] font-semibold text-slate-200 ring-1 ring-slate-300/40 ${className}`}
      >
        <Sparkles size={11} /> Plus
      </span>
    );
  return null;
}

/** "VIP" / "LEGEND" etiketi. */
export function VipTag({ tier, className = "" }: { tier?: string | null; className?: string }) {
  if (tier === "legend")
    return (
      <span className={`legend-badge name-tag inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-widest ${className}`}>
        VIP · LEGEND
      </span>
    );
  return (
    <span className={`vip-tag inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide ${className}`}>
      VIP
    </span>
  );
}

/** Avatar/kart KENAR çerçevesi. */
export function tierFrame(tier?: string | null): string {
  if (tier === "legend") return "tier-legend";
  if (tier === "platinum") return "tier-premium";
  if (tier === "gold") return "tier-gold";
  if (tier === "plus") return "tier-plus";
  return "";
}

/** Kart YÜZEYİ (tüm kart değişir). */
export function tierCard(tier?: string | null): string {
  if (tier === "legend") return "card-legend";
  if (tier === "platinum") return "card-premium";
  if (tier === "gold") return "card-gold";
  if (tier === "plus") return "card-plus";
  return "";
}

/** Kart ışık (glow). */
export function tierGlow(tier?: string | null): string {
  if (tier === "legend") return "glow-legend";
  if (tier === "platinum") return "glow-premium";
  if (tier === "gold") return "glow-gold";
  if (tier === "plus") return "glow-plus";
  return "";
}

/** İsim renk efekti. */
export function tierName(tier?: string | null): string {
  if (tier === "legend") return "name-legend";
  if (tier === "platinum") return "name-premium";
  if (tier === "gold") return "name-gold";
  if (tier === "plus") return "name-plus";
  return "";
}

/** Sohbet balonu özel sınıfı. */
export function tierBubble(tier?: string | null): string {
  if (tier === "legend") return "bubble-legend";
  if (tier === "platinum") return "bubble-premium";
  if (tier === "gold") return "bubble-gold";
  return "";
}

const CARD_META: Record<string, { label: string; sub: string; Icon: typeof Crown }> = {
  plus: { label: "Silver Club", sub: "Plus Üyelik", Icon: Sparkles },
  gold: { label: "Royal Gold", sub: "Premium Üyelik", Icon: Crown },
  platinum: { label: "Imperial Elite", sub: "Premium Plus", Icon: Crown },
  legend: { label: "Black Diamond", sub: "LEGEND", Icon: Gem },
};

/** Profil üyelik seviyesi kartı (lüks kulüp kartı hissi). Free -> render etmez. */
export function MembershipCard({ tier, name }: { tier?: string | null; name?: string }) {
  const meta = tier ? CARD_META[tier] : undefined;
  if (!meta) return null;
  const Icon = meta.Icon;
  return (
    <div className={`lux-enter relative mb-6 overflow-hidden rounded-3xl border p-5 ${tierCard(tier)}`}>
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className={`text-xs font-semibold ${tierName(tier)}`}>{meta.sub}</p>
          <p className="mt-0.5 text-xl font-bold text-white">{meta.label}</p>
          {name && <p className="mt-2 text-sm text-white/65">{name} · Üyelik kartı</p>}
        </div>
        <Icon className="text-[#f4e6a1]" size={30} />
      </div>
    </div>
  );
}
