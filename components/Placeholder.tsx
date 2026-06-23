import { GlassCard } from "@/components/ui";
import type { LucideIcon } from "lucide-react";

export function Placeholder({
  title,
  desc,
  cards,
  note,
}: {
  title: string;
  desc?: string;
  cards?: { icon: LucideIcon; label: string; value?: string }[];
  note?: string;
}) {
  return (
    <div className="space-y-5 pb-4">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {desc && <p className="mt-1 text-sm text-muted">{desc}</p>}
      </div>

      {cards && (
        <div className="grid grid-cols-2 gap-3">
          {cards.map((c) => (
            <GlassCard key={c.label} className="p-4">
              <c.icon size={20} className="text-primary" />
              <p className="mt-2 text-xs text-muted">{c.label}</p>
              <p className="text-xl font-bold">{c.value ?? "—"}</p>
            </GlassCard>
          ))}
        </div>
      )}

      <GlassCard className="p-8 text-center">
        <span className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
          Yakında
        </span>
        <p className="mx-auto mt-3 max-w-xs text-sm text-muted">
          {note ?? "Bu bölümün temel yapısı hazır. Tam işlevsellik bir sonraki sürümde aktifleşecek."}
        </p>
      </GlassCard>
    </div>
  );
}
