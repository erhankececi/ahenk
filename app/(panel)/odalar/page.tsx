"use client";

import { useState } from "react";
import { GlassCard, LiveBadge, Avatar, Button } from "@/components/ui";
import { ROOMS } from "@/lib/mock";
import { Users, Coins } from "lucide-react";

const TABS = ["Tüm Odalar", "TYT", "AYT", "LGS"];

export default function Rooms() {
  const [tab, setTab] = useState("Tüm Odalar");
  const rooms = tab === "Tüm Odalar" ? ROOMS : ROOMS.filter((r) => r.tag.includes(tab));

  return (
    <div className="space-y-5 pb-4">
      <div>
        <h1 className="text-2xl font-bold">Canlı Odalar</h1>
        <p className="mt-1 text-sm text-muted">Etkileşimli oturumlara katıl ve hazırlığını geliştir.</p>
      </div>

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition ${tab === t ? "border-primary bg-primary/10 text-primary" : "border-line bg-surface text-muted hover:text-text"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {rooms.map((r) => (
          <GlassCard key={r.id} className="p-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-muted">{r.tag}</span>
              <LiveBadge soon={r.status === "yakinda"} label={r.status === "yakinda" ? "Yakında" : "Canlı"} />
            </div>
            <h3 className="text-lg font-bold">{r.name}</h3>
            <div className="mt-3 flex items-center gap-2.5">
              <Avatar name={r.teacher} size={36} />
              <div className="text-sm">
                <p className="font-semibold">{r.teacher}</p>
                <p className="text-xs text-muted">{r.teacherTitle}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
              <div className="flex items-center gap-3 text-xs text-muted">
                <span className="flex items-center gap-1"><Users size={14} /> {r.participants}</span>
                <span className={`flex items-center gap-1 font-semibold ${r.cost === 0 ? "text-success" : "text-gold"}`}>
                  {r.cost === 0 ? "Ücretsiz" : <><Coins size={12} /> {r.cost}</>}
                </span>
              </div>
              {r.status === "canli" ? <Button size="sm">Katıl</Button> : <Button size="sm" variant="glass">Hatırlat</Button>}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
