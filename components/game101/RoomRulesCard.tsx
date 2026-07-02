"use client";

// Ahenk 101 oda bekleme ekranı — oda kuralları kartı (sosyal oyun, bahis yok).

import { Ban, MessagesSquare, ShieldAlert, Wallet } from "lucide-react";

const RULES = [
  { icon: Ban, text: "Bahis yok" },
  { icon: Wallet, text: "Para çekme yok" },
  { icon: MessagesSquare, text: "Saygılı sohbet" },
  { icon: ShieldAlert, text: "Rahatsız edenleri raporla" },
] as const;

export default function RoomRulesCard() {
  return (
    <div className="ahenk-panel rounded-3xl p-4">
      <p className="mb-3 text-sm font-semibold text-text">Oda Kuralları</p>
      <ul className="flex flex-col gap-2">
        {RULES.map((rule) => (
          <li key={rule.text} className="flex items-center gap-2 text-[13px] text-muted">
            <rule.icon size={14} className="shrink-0 text-accent" />
            {rule.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
