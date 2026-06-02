"use client";

import { PremiumBadge, tierFrame } from "@/components/PremiumBadge";

type Cand = any;

function Rail({
  title,
  items,
  onPick,
}: {
  title: string;
  items: { c: Cand; idx: number }[];
  onPick: (i: number) => void;
}) {
  if (!items.length) return null;
  return (
    <div className="mb-5">
      <p className="mb-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted">{title}</p>
      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
        {items.map(({ c, idx }) => (
          <button key={c.id} onClick={() => onPick(idx)} className="w-28 shrink-0 text-left">
            <div className={`rounded-2xl ${tierFrame(c.tier)}`}>
              <div className="relative h-32 w-28 overflow-hidden rounded-2xl bg-elevated">
                {c.photos?.[0] ? (
                  <img src={c.photos[0]} loading="lazy" className="h-full w-full scale-110 object-cover blur-xl" alt="" />
                ) : (
                  <div className="brand-gradient h-full w-full opacity-30" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
                {c.online && (
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-success ring-2 ring-black/40" />
                )}
                <div className="absolute inset-x-2 bottom-1">
                  <p className="truncate text-xs font-semibold text-white">
                    {c.name}
                    {c.age ? `, ${c.age}` : ""}
                  </p>
                  {c.mesafe != null && (
                    <p className="text-[10px] text-white/80">
                      {c.sameCity || c.mesafe === 0 ? "yakınında" : `${c.mesafe} km`}
                    </p>
                  )}
                </div>
              </div>
            </div>
            {c.tier && c.tier !== "free" && (
              <div className="mt-1">
                <PremiumBadge tier={c.tier} />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function DiscoveryRails({
  cands,
  onPick,
}: {
  cands: Cand[];
  onPick: (i: number) => void;
}) {
  if (cands.length < 2) return null;
  const idx = cands.map((c, i) => ({ c, idx: i }));
  const yakin = idx.slice(0, 12);
  const oneri = idx.slice(0, 12); // SQL zaten proximity/uyum sıralı
  const aktif = idx.filter((x) => x.c.online).slice(0, 12);
  const yeni = idx.filter((x) => x.c.isNew).slice(0, 12);
  const benzer = [...idx].sort((a, b) => (b.c.ortakYuzde || 0) - (a.c.ortakYuzde || 0)).slice(0, 12);

  return (
    <div className="mt-8 border-t border-border pt-6">
      <Rail title="Yakındakiler" items={yakin} onPick={onPick} />
      <Rail title="Senin için" items={oneri} onPick={onPick} />
      <Rail title="Bugün aktif" items={aktif} onPick={onPick} />
      <Rail title="Yeni katılanlar" items={yeni} onPick={onPick} />
      <Rail title="Ortak ilgiler" items={benzer} onPick={onPick} />
    </div>
  );
}
