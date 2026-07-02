"use client";

// Ahenk 101 oda bekleme ekranı — 4 koltuklu masa ön izlemesi (2x2 grid).
// Alt: Ben, Üst: rakip, Sol: rakip, Sağ: rakip.

import WaitingSeat from "./WaitingSeat";
import type { WaitingPlayer } from "@/lib/game101/waitingRoom";

export interface RoomSeatMapProps {
  me: { name: string; city: string; isReady: boolean } | null;
  opponents: WaitingPlayer[];
  onSit: () => void;
}

export default function RoomSeatMap({ me, opponents, onSit }: RoomSeatMapProps) {
  const top = opponents.find((p) => p.seat === "top") ?? null;
  const left = opponents.find((p) => p.seat === "left") ?? null;
  const right = opponents.find((p) => p.seat === "right") ?? null;

  return (
    <div className="ahenk-panel relative rounded-3xl p-4">
      <div className="pointer-events-none absolute inset-x-6 top-1/2 h-32 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgb(var(--brand)/0.10),transparent_70%)]" />

      <div className="relative mx-auto grid max-w-xs grid-cols-1 gap-3">
        <WaitingSeat label="Üst Koltuk" player={top} />

        <div className="grid grid-cols-2 gap-3">
          <WaitingSeat label="Sol Koltuk" player={left} />
          <WaitingSeat label="Sağ Koltuk" player={right} />
        </div>

        <WaitingSeat
          label="Alt Koltuk (Ben)"
          player={me}
          isMe
          canSit={!me}
          onSit={onSit}
        />
      </div>
    </div>
  );
}
