"use client";

import { useState } from "react";
import { GlassCard, Button, Avatar, Stars, LiveBadge } from "@/components/ui";
import { TEACHERS } from "@/lib/mock";
import { MessageSquare, Clock, Target } from "lucide-react";

const TABS = ["Tüm Öğretmenler", "Öğretmenler", "Koçlar"];

export default function Teachers() {
  const [tab, setTab] = useState("Tüm Öğretmenler");
  const list =
    tab === "Öğretmenler" ? TEACHERS.filter((t) => t.kind === "ogretmen")
    : tab === "Koçlar" ? TEACHERS.filter((t) => t.kind === "koc")
    : TEACHERS;

  return (
    <div className="space-y-5 pb-4">
      <div>
        <h1 className="text-2xl font-bold">Öğretmenler ve Koçlar</h1>
        <p className="mt-1 text-sm text-muted">En iyi TYT, AYT ve sınav koçları ile bağlan.</p>
      </div>

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition ${tab === t ? "border-primary bg-primary/10 text-primary" : "border-line bg-surface text-muted hover:text-text"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {list.map((t) => {
          const koc = t.kind === "koc";
          return (
            <GlassCard key={t.id} className="overflow-hidden">
              <div className="relative h-20" style={{ background: `linear-gradient(120deg, ${koc ? "#3a2f5e" : "#0e3a44"}, #0a111f)` }} />
              <div className="-mt-8 px-5 pb-5">
                <div className="flex items-end justify-between">
                  <span className="rounded-full p-1 ring-2 ring-surface" style={{ background: "#0A111F" }}>
                    <Avatar name={t.name} size={56} color={koc ? "#B6C4FF" : "#00E5FF"} />
                  </span>
                  <LiveBadge soon={t.status === "musait"} label={t.status === "canli" ? "Canlı" : "Müsait"} />
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <h3 className="text-lg font-bold">{t.name}</h3>
                  <Stars rating={t.rating} />
                </div>
                <p className="text-xs text-primary">{t.branch}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{t.desc}</p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  {koc ? (
                    <>
                      <Stat icon={<Target size={14} />} label="Başarı Oranı" value={`%${t.successRate}`} />
                      <Stat icon={<MessageSquare size={14} />} label="Koçluk Yapılan" value="120+" />
                    </>
                  ) : (
                    <>
                      <Stat icon={<MessageSquare size={14} />} label="Sorulan Soru" value={`${t.answered}+`} />
                      <Stat icon={<Clock size={14} />} label="Ortalama Yanıt" value={t.avgTime} />
                    </>
                  )}
                </div>

                <Button size="sm" className="mt-4 w-full" variant={t.status === "canli" ? "primary" : "glass"}>
                  {t.status === "canli" ? "Canlı Yayına Katıl" : "Profili Gör"}
                </Button>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface px-3 py-2.5">
      <p className="flex items-center gap-1 text-[11px] text-muted">{icon} {label}</p>
      <p className="mt-0.5 font-bold">{value}</p>
    </div>
  );
}
