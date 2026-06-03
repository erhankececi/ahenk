import { ShieldCheck, Shield, ShieldAlert } from "lucide-react";
import { computeTrust, type TrustInput } from "@/lib/trust";

const TONE = {
  success: { text: "text-success", bg: "bg-success/10 border-success/30", Icon: ShieldCheck },
  accent: { text: "text-accent", bg: "bg-accent/10 border-accent/30", Icon: Shield },
  muted: { text: "text-muted", bg: "bg-surface border-border", Icon: ShieldAlert },
};

/** Güven puanı + doğrulama durumu rozeti. compact=küçük etiket. */
export default function TrustBadge({ data, compact }: { data: TrustInput; compact?: boolean }) {
  const t = computeTrust(data);
  const c = TONE[t.tone];

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${c.bg} ${c.text}`}>
        <c.Icon size={11} /> {t.status}
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-3 rounded-2xl border p-3 ${c.bg}`}>
      <c.Icon size={22} className={c.text} />
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold ${c.text}`}>{t.status}</p>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-elevated">
          <div className="h-full rounded-full bg-gradient-to-r from-brand to-accent" style={{ width: `${t.score}%` }} />
        </div>
      </div>
      <span className={`shrink-0 text-sm font-bold ${c.text}`}>{t.score}</span>
    </div>
  );
}
