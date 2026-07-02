"use client";

// Ahenk 101 oda bekleme ekranı — masa adı, tipi, şehir, sesli/sessiz, oyuncu sayısı.

import { Crown, MapPin, Mic, MicOff, Users } from "lucide-react";
import type { Room } from "@/lib/game101/rooms";

export interface RoomHeaderCardProps {
  room: Room;
  seatedCount: number;
}

export default function RoomHeaderCard({ room, seatedCount }: RoomHeaderCardProps) {
  return (
    <div className="ahenk-panel rounded-3xl p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="truncate font-display text-xl font-semibold tracking-[-0.03em] text-text">
              {room.name}
            </h1>
            {room.isPremium ? (
              <span className="flex shrink-0 items-center gap-0.5 rounded-full border border-brand/40 bg-brand/10 px-1.5 py-0.5 text-[10px] font-semibold text-brand">
                <Crown size={10} /> Premium
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-sm text-muted">{room.tableType}</p>
        </div>

        <div className="flex shrink-0 items-center gap-1 rounded-full border border-border bg-elevated px-2.5 py-1 text-xs font-semibold text-text">
          <Users size={13} className="text-brand" />
          {seatedCount}/4
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-muted">
        <span className="flex items-center gap-1">
          <MapPin size={12} /> {room.city}
        </span>
        <span className="flex items-center gap-1">
          {room.isVoice ? <Mic size={12} className="text-brand" /> : <MicOff size={12} />}
          {room.isVoice ? "Sesli masa" : "Sessiz masa"}
        </span>
      </div>
    </div>
  );
}
