"use client";

// Ahenk 101 oda bekleme ekranı — küçük "oda sohbeti" ön izlemesi (mock, salt okunur).

import { MessageCircle } from "lucide-react";
import { MOCK_ROOM_CHAT } from "@/lib/game101/waitingRoom";

export default function RoomChatPreview() {
  return (
    <div className="ahenk-panel rounded-3xl p-4">
      <div className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-text">
        <MessageCircle size={15} className="text-brand" />
        Oda Sohbeti
      </div>

      <div className="flex flex-col gap-2">
        {MOCK_ROOM_CHAT.map((msg) => (
          <div key={msg.id} className="rounded-2xl bg-elevated px-3 py-2">
            <p className="text-[11px] font-semibold text-brand">{msg.author}</p>
            <p className="mt-0.5 text-[13px] text-text">{msg.text}</p>
          </div>
        ))}
      </div>

      <p className="mt-3 text-[11px] text-muted">Sohbet oyun içinde devam edecek.</p>
    </div>
  );
}
