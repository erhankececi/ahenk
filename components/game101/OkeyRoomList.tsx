"use client";

import type { Room } from "@/lib/game101/rooms";
import OkeyRoomCard from "./OkeyRoomCard";

export interface OkeyRoomListProps {
  rooms: Room[];
  onJoin: (roomId: string) => void;
}

/** Masa kartlarının liste/grid düzeni; boş sonuç durumunu da yönetir. */
export default function OkeyRoomList({ rooms, onJoin }: OkeyRoomListProps) {
  if (rooms.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-border py-14 text-center">
        <p className="font-display text-base font-semibold text-text">Uygun masa bulunamadı</p>
        <p className="mt-1 max-w-[220px] text-sm text-muted">
          Farklı bir filtre dene veya Tümü&apos;ne dön.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
      {rooms.map((room) => (
        <OkeyRoomCard key={room.id} room={room} onJoin={onJoin} />
      ))}
    </div>
  );
}
