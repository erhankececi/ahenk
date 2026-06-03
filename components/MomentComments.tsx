"use client";

import { useEffect, useState } from "react";
import { Heart, Send, Pin, Trash2, CornerDownRight, X } from "lucide-react";

type C = {
  id: string; parent_id: string | null; name: string; text: string; created_at: string;
  pinned: boolean; likes: number; liked: boolean; mine: boolean; canRemove: boolean; canPin: boolean;
};

export default function MomentComments({ momentId, onClose, onCount }: { momentId: string; onClose: () => void; onCount?: (d: number) => void }) {
  const [list, setList] = useState<C[] | null>(null);
  const [text, setText] = useState("");
  const [reply, setReply] = useState<{ id: string; name: string } | null>(null);

  function load() {
    fetch(`/api/moments/comments?momentId=${momentId}`).then((r) => r.json()).then((d) => setList(d.comments || []));
  }
  useEffect(load, [momentId]);

  async function ekle() {
    if (!text.trim()) return;
    const t = text;
    setText("");
    await fetch("/api/moments/comments", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "add", momentId, text: t, parentId: reply?.id }),
    });
    setReply(null);
    onCount?.(1);
    load();
  }
  async function act(action: string, commentId: string) {
    await fetch("/api/moments/comments", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, commentId }),
    });
    if (action === "delete") onCount?.(-1);
    load();
  }

  const tops = (list || []).filter((c) => !c.parent_id);
  const repliesOf = (id: string) => (list || []).filter((c) => c.parent_id === id);

  function Row({ c, nested }: { c: C; nested?: boolean }) {
    return (
      <div className={`py-2 ${nested ? "ml-9" : ""}`}>
        <div className="flex items-start gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand/40 to-accent/40 text-xs font-bold">
            {c.name[0]?.toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm">
              <span className="font-semibold">{c.name}</span>{c.pinned && <Pin size={11} className="ml-1 inline text-accent" />} <span className="text-text/90">{c.text}</span>
            </p>
            <div className="mt-0.5 flex items-center gap-3 text-[11px] text-muted">
              {!nested && <button onClick={() => setReply({ id: c.id, name: c.name })} className="hover:text-text">Yanıtla</button>}
              {c.canPin && <button onClick={() => act(c.pinned ? "unpin" : "pin", c.id)} className="hover:text-text">{c.pinned ? "Sabiti kaldır" : "Sabitle"}</button>}
              {c.canRemove && <button onClick={() => act("delete", c.id)} className="hover:text-error"><Trash2 size={12} /></button>}
            </div>
          </div>
          <button onClick={() => act(c.liked ? "unlike" : "like", c.id)} className="flex shrink-0 flex-col items-center text-[10px] text-muted">
            <Heart size={15} className={c.liked ? "fill-error text-error" : ""} />
            {c.likes > 0 && c.likes}
          </button>
        </div>
        {repliesOf(c.id).map((r) => <Row key={r.id} c={r} nested />)}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end bg-black/50" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="flex h-[75dvh] w-full flex-col rounded-t-3xl border-t border-border bg-surface">
        <div className="flex items-center justify-between px-5 py-3">
          <p className="t-h4">Yorumlar</p>
          <button onClick={onClose} aria-label="Kapat" className="text-muted"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5">
          {!list ? (
            <p className="py-8 text-center text-sm text-muted">Yükleniyor…</p>
          ) : tops.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">İlk yorumu sen yaz.</p>
          ) : (
            tops.map((c) => <Row key={c.id} c={c} />)
          )}
        </div>
        <div className="border-t border-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {reply && (
            <p className="mb-1 flex items-center gap-1 px-1 text-xs text-muted">
              <CornerDownRight size={12} /> {reply.name} yanıtlanıyor
              <button onClick={() => setReply(null)} className="ml-1 text-error">iptal</button>
            </p>
          )}
          <div className="flex items-center gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && ekle()}
              placeholder="Yorum yaz…"
              className="flex-1 rounded-full border border-border bg-elevated px-4 py-2.5 text-sm outline-none focus:border-brand"
            />
            <button onClick={ekle} disabled={!text.trim()} className="brand-gradient rounded-full p-2.5 text-white disabled:opacity-40">
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
