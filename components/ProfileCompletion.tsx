import Link from "next/link";
import { Sparkles } from "lucide-react";

/**
 * Profil tamamlama ölçeri — eksik alanları tek tıkla doldurmaya yönlendirir.
 * %100 olunca gizlenir. Saf sunum bileşeni (veri profil sayfasında hesaplanır).
 */
export default function ProfileCompletion({
  items,
}: {
  items: { label: string; done: boolean; href?: string }[];
}) {
  const done = items.filter((i) => i.done).length;
  const pct = Math.round((done / items.length) * 100);
  if (pct >= 100) return null;
  const missing = items.filter((i) => !i.done);

  return (
    <div className="mb-6 rounded-3xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 font-semibold">
          <Sparkles size={16} className="text-brand" /> Profilini tamamla
        </p>
        <span className="text-sm font-bold text-brand">%{pct}</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-elevated">
        <div
          className="brand-gradient h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-3 text-xs text-muted">Daha dolu profiller daha çok ve daha isabetli eşleşir.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {missing.map((m) =>
          m.href ? (
            <Link
              key={m.label}
              href={m.href}
              className="rounded-full border border-border px-3 py-1.5 text-xs transition hover:border-brand"
            >
              + {m.label}
            </Link>
          ) : (
            <span key={m.label} className="rounded-full border border-border px-3 py-1.5 text-xs text-muted">
              + {m.label}
            </span>
          )
        )}
      </div>
    </div>
  );
}
