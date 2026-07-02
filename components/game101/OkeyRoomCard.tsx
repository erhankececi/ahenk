"use client";

import { Crown, MapPin, Mic, MicOff, Users } from "lucide-react";
import type { Room } from "@/lib/game101/rooms";

export interface OkeyRoomCardProps {
  room: Room;
  onJoin: (roomId: string) => void;
}

/** Tek masa kartı: masa adı, tipi, oyuncu sayısı, şehir, sesli/premium etiketleri ve Katıl butonu. */
export default function OkeyRoomCard({ room, onJoin }: OkeyRoomCardProps) {
  const isFull = room.playerCount >= 4;

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 transition hover:border-brand/30">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-brand/20 bg-elevated text-brand">
        <Users size={20} strokeWidth={1.7} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate font-display text-[15px] font-semibold text-text">{room.name}</p>
          {room.isPremium ? (
            <span className="flex items-center gap-0.5 rounded-full border border-brand/40 bg-brand/10 px-1.5 py-0.5 text-[10px] font-semibold text-brand">
              <Crown size={10} /> Premium
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 truncate text-xs text-muted">{room.tableType}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
          <span className="flex items-center gap-1">
            <MapPin size={11} /> {room.city}
          </span>
          <span className="flex items-center gap-1">
            <Users size={11} /> {room.playerCount}/4
          </span>
          <span className="flex items-center gap-1">
            {room.isVoice ? <Mic size={11} className="text-brand" /> : <MicOff size={11} />}
            {room.isVoice ? "Sesli" : "Sessiz"}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onJoin(room.id)}
        disabled={isFull}
        className="brand-gradient shrink-0 rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-40"
      >
        {isFull ? "Dolu" : "Katıl"}
      </button>
    </div>
  );
}
