"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Send, Megaphone } from "lucide-react";

type Msg = { id: string; user_id: string; message: string; message_type: string; created_at: string };

export function RoomChat({ roomId, meId, hostId, isHost, initial }: {
  roomId: string; meId: string; hostId: string; isHost: boolean; initial: Msg[];
}) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Msg[]>(initial);
  const [text, setText] = useState("");
  const [announce, setAnnounce] = useState(false);
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ch = supabase
      .channel(`room-${roomId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "room_messages", filter: `room_id=eq.${roomId}` }, (payload) => {
        const m = payload.new as Msg;
        setMessages((cur) => (cur.some((x) => x.id === m.id) ? cur : [...cur, m]));
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send() {
    const msg = text.trim();
    if (!msg || busy) return;
    setBusy(true);
    setText("");
    const { error } = await supabase.rpc("send_room_message", { p_room_id: roomId, p_message: msg, p_message_type: announce ? "announcement" : "text" });
    setBusy(false);
    if (error) setText(msg);
    else setAnnounce(false);
  }

  return (
    <div className="flex h-[60dvh] flex-col">
      <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 && <p className="mt-10 text-center text-sm text-muted">Henüz mesaj yok, ilk mesajı sen gönder.</p>}
        {messages.map((m) => {
          if (m.message_type === "announcement") {
            return (
              <div key={m.id} className="gold-card flex items-start gap-2 rounded-xl px-4 py-3">
                <Megaphone size={16} className="mt-0.5 shrink-0 text-gold" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-gold">Duyuru</p>
                  <p className="text-sm text-text/90">{m.message}</p>
                </div>
              </div>
            );
          }
          const mine = m.user_id === meId;
          const fromHost = m.user_id === hostId;
          return (
            <div key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
              <span className="mb-0.5 px-1 text-[10px] text-muted">{mine ? "Sen" : fromHost ? "Eğitmen" : "Katılımcı"}</span>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${mine ? "btn-primary rounded-br-md" : fromHost ? "rounded-bl-md border border-primary/30 bg-primary/10 text-text" : "glass rounded-bl-md"}`}>
                {m.message}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div className="mt-3 border-t border-line pt-3">
        {isHost && (
          <button onClick={() => setAnnounce((a) => !a)} className={`mb-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${announce ? "border-gold/50 bg-gold/10 text-gold" : "border-line text-muted hover:text-text"}`}>
            <Megaphone size={12} /> {announce ? "Duyuru modu açık" : "Duyuru olarak gönder"}
          </button>
        )}
        <div className="flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Mesaj yaz…"
            className="flex-1 rounded-full border border-line bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary/50"
          />
          <button onClick={send} disabled={!text.trim() || busy} className="btn-primary flex h-11 w-11 items-center justify-center rounded-full disabled:opacity-40"><Send size={18} /></button>
        </div>
      </div>
    </div>
  );
}
