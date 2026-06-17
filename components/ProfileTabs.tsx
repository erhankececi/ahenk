"use client";

import { useState } from "react";
import { User, Images, Award } from "lucide-react";

type TabKey = "profil" | "icerik" | "rozetler";

const TABS: { key: TabKey; label: string; Icon: any }[] = [
  { key: "profil", label: "Profil", Icon: User },
  { key: "icerik", label: "İçerik", Icon: Images },
  { key: "rozetler", label: "Rozetler", Icon: Award },
];

export default function ProfileTabs({
  profil,
  icerik,
  rozetler,
}: {
  profil: React.ReactNode;
  icerik: React.ReactNode;
  rozetler: React.ReactNode;
}) {
  const [tab, setTab] = useState<TabKey>("profil");

  return (
    <div>
      <div className="mb-5 grid grid-cols-3 gap-1.5 rounded-2xl border border-white/10 bg-[#151318]/70 p-1.5">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "border border-[#C7A977]/40 bg-[#C7A977]/12 text-accent shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
                  : "border border-transparent text-muted hover:text-text"
              }`}
              aria-pressed={active}
            >
              <t.Icon size={16} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      <div className={tab === "profil" ? "block" : "hidden"}>{profil}</div>
      <div className={tab === "icerik" ? "block" : "hidden"}>{icerik}</div>
      <div className={tab === "rozetler" ? "block" : "hidden"}>{rozetler}</div>
    </div>
  );
}
