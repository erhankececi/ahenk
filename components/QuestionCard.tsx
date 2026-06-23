import Link from "next/link";
import { GlassCard } from "@/components/ui";
import { statusMeta, shortDate } from "@/lib/questions";
import { Zap, ImageIcon } from "lucide-react";

export function QuestionCard({ q, href }: { q: any; href: string }) {
  const s = statusMeta(q.status);
  return (
    <Link href={href} className="block">
      <GlassCard className="p-4 transition hover:border-primary/30">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-xs font-semibold text-secondary">{q.subject}{q.topic ? ` · ${q.topic}` : ""}</span>
          <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${s.cls}`}>{s.label}</span>
        </div>
        <p className="mt-1.5 font-bold leading-tight">{q.title || "Soru"}</p>
        {q.description && <p className="mt-0.5 line-clamp-1 text-sm text-muted">{q.description}</p>}
        <div className="mt-2 flex items-center gap-3 text-[11px] text-muted">
          {q.priority && <span className="flex items-center gap-0.5 font-semibold text-gold"><Zap size={11} /> Öncelikli</span>}
          {q.image_url && <span className="flex items-center gap-0.5"><ImageIcon size={11} /> Fotoğraf</span>}
          <span className="ml-auto">{shortDate(q.created_at)}</span>
        </div>
      </GlassCard>
    </Link>
  );
}
