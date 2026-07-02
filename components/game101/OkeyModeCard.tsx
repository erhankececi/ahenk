// Ahenk 101 lobi — tek giriş kartı (ikon, başlık, açıklama, "Başla" butonu).
// Saf React/Tailwind DOM component'i (PixiJS oyun component'leriyle karışmaz).

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";

export interface OkeyModeCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  /** Küçük vurgu etiketi (opsiyonel), örn. "Premium". */
  badge?: string;
}

export default function OkeyModeCard({ icon: Icon, title, description, href, badge }: OkeyModeCardProps) {
  return (
    <div className="ahenk-card-border flex items-center gap-4 rounded-2xl p-4 transition duration-200 hover:border-accent/30 sm:p-5">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/12 text-accent">
        <Icon size={22} strokeWidth={1.8} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-[15px] font-semibold text-text">{title}</h3>
          {badge && (
            <span className="ahenk-chip shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
              {badge}
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-[13px] leading-relaxed text-muted">{description}</p>
      </div>

      <Link
        href={href}
        className="brand-gradient inline-flex shrink-0 items-center gap-1 rounded-xl px-4 py-2.5 text-[13px] font-semibold shadow-glow transition hover:brightness-110 active:scale-95"
      >
        Başla
        <ChevronRight size={15} strokeWidth={2.2} />
      </Link>
    </div>
  );
}
