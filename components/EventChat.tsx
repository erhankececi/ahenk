"use client";

import { useEffect, useRef, useState } from "react";
import { X, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { saat } from "@/lib/utils";
import { useLang } from "@/components/LangProvider";

type Msg = { id: string; body: string; created_at: string; sender_id: string; name: string; mine: boolean };

export default function EventChat({ eventId, title, onClose }: { eventId: string; title: string; onClose: () => void }) {
  const supabase = createClient();
  const ec = useLang().t.eventchat;
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [me, setMe] = useState<string>("");
  const endRef = useRef<HTMLDivElement>(null);

  function load() {
    fetch(`/api/events/chat?eventId=${eventId}`).then((r) => r.json()).then((d) => {
      setMsgs(d.messages || []);
      setMe(d.me || "");
    });
  }
  useEffect(load, [eventId]);

  // realtime
  useEffect(() => {
    const ch = supabase
      .channel(`event-${eventId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "event_messages", filter: `event_id=eq.${eventId}` },
        () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  async function gonder() {
    const t = text.trim();
    if (!t) return;
    setText("");
    await fetch("/api/events/chat", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId, body: t }),
    });
    load();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="flex h-[80dvh] w-full flex-col rounded-t-3xl border-t border-border bg-bg">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="min-w-0">
            <p className="truncate font-display font-semibold">{title}</p>
            <p className="text-xs text-muted">{ec.subtitle}</p>
          </div>
          <button onClick={onClose} className="text-muted" aria-label={ec.close}><X size={20} /></button>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {msgs.length === 0 ? (
            <p className="mt-12 text-center text-sm text-muted">{ec.empty}</p>
          ) : (
            msgs.map((m) => (
              <div key={m.id} className={`flex flex-col ${m.mine ? "items-end" : "items-start"}`}>
                {!m.mine && <span className="px-1 text-[11px] text-muted">{m.name}</span>}
                <div className={`max-w-[78%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2 text-sm ${m.mine ? "brand-gradient text-[#1c1407]" : "border border-border bg-surface"}`}>
                  {m.body}
                </div>
                <span className="mt-0.5 px-1 text-[10px] text-muted">{saat(m.created_at)}</span>
              </div>
            ))
          )}
          <div ref={endRef} />
        </div>

        <div className="flex items-center gap-2 border-t border-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && gonder()}
            placeholder={ec.placeholder}
            className="flex-1 rounded-full border border-border bg-elevated px-4 py-2.5 text-sm outline-none focus:border-brand"
          />
          <button onClick={gonder} disabled={!text.trim()} className="brand-gradient flex h-10 w-10 items-center justify-center rounded-full disabled:opacity-40" aria-label={ec.send}>
            <Send size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}
