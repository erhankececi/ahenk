"use client";

import { useEffect, useState } from "react";
import { X, Plus, Trash2, Check, Archive as ArchiveIcon, Loader2 } from "lucide-react";

type Item = { id: string; type: string; text: string | null; media: string | null; created_at?: string; active?: boolean };
type Highlight = { id: string; title: string; cover: string | null; items: Item[] };

function Thumb({ it, className = "" }: { it: Item; className?: string }) {
  if (it.media && it.type === "video")
    return <video src={it.media} className={`h-full w-full object-cover ${className}`} muted />;
  if (it.media) return <img src={it.media} className={`h-full w-full object-cover ${className}`} alt="" />;
  return (
    <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-brand/40 to-accent/30 p-1 text-center text-[10px] font-medium text-white ${className}`}>
      {it.text?.slice(0, 40) || "Yazı"}
    </div>
  );
}

export default function StoryHighlights({ userId, mine }: { userId: string; mine: boolean }) {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [archive, setArchive] = useState<Item[]>([]);
  const [view, setView] = useState<{ items: Item[]; idx: number; title: string } | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);

  function loadHighlights() {
    fetch(`/api/highlights?userId=${userId}`).then((r) => r.json()).then((d) => setHighlights(d.highlights || []));
  }
  useEffect(() => {
    loadHighlights();
    if (mine) fetch("/api/stories/archive").then((r) => r.json()).then((d) => setArchive(d.items || []));
  }, [userId, mine]);

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  async function olustur() {
    if (!title.trim() || selected.length === 0) return;
    setBusy(true);
    const r = await fetch("/api/highlights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), storyIds: selected }),
    }).then((x) => x.json()).catch(() => ({}));
    setBusy(false);
    if (r.ok) {
      setSelectMode(false); setSelected([]); setTitle("");
      loadHighlights();
    } else alert("Koleksiyon oluşturulamadı.");
  }

  async function sil(id: string) {
    if (!confirm("Bu koleksiyonu sil?")) return;
    await fetch(`/api/highlights?id=${id}`, { method: "DELETE" });
    loadHighlights();
  }

  const hasContent = highlights.length > 0 || (mine && archive.length > 0);
  if (!hasContent) return null;

  return (
    <div className="mt-6">
      {/* Kalıcı koleksiyon baloncukları */}
      {(highlights.length > 0 || mine) && (
        <div className="no-scrollbar flex gap-4 overflow-x-auto pb-1">
          {mine && (
            <button
              onClick={() => { setSelectMode(true); setSelected([]); }}
              className="flex shrink-0 flex-col items-center gap-1"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-border text-muted">
                <Plus size={22} />
              </span>
              <span className="text-xs text-muted">Yeni</span>
            </button>
          )}
          {highlights.map((h) => (
            <div key={h.id} className="flex shrink-0 flex-col items-center gap-1">
              <button
                onClick={() => h.items.length && setView({ items: h.items, idx: 0, title: h.title })}
                className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-border"
              >
                {h.cover ? (
                  <img src={h.cover} className="h-full w-full object-cover" alt="" />
                ) : h.items[0] ? (
                  <Thumb it={h.items[0]} />
                ) : (
                  <div className="brand-gradient h-full w-full opacity-40" />
                )}
              </button>
              <span className="max-w-16 truncate text-xs text-muted">{h.title}</span>
              {mine && (
                <button onClick={() => sil(h.id)} className="text-[10px] text-error">sil</button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Hikaye Arşivi (sadece sahibi) */}
      {mine && archive.length > 0 && (
        <div className="mt-5">
          <div className="mb-2 flex items-center gap-2">
            <ArchiveIcon size={16} className="text-muted" />
            <h3 className="text-sm font-semibold">Hikaye Arşivi</h3>
            <span className="text-xs text-muted">· sadece sen görürsün</span>
            {!selectMode && (
              <button onClick={() => { setSelectMode(true); setSelected([]); }} className="ml-auto text-xs font-medium text-brand">
                Koleksiyon oluştur
              </button>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
            {archive.map((it) => {
              const sel = selected.includes(it.id);
              return (
                <button
                  key={it.id}
                  onClick={() => (selectMode ? toggle(it.id) : setView({ items: [it], idx: 0, title: "Arşiv" }))}
                  className={`relative aspect-[9/16] overflow-hidden rounded-xl border ${sel ? "border-brand ring-2 ring-brand" : "border-border"}`}
                >
                  <Thumb it={it} />
                  {it.active && (
                    <span className="absolute left-1 top-1 rounded-full bg-success/90 px-1.5 py-0.5 text-[9px] font-semibold text-white">canlı</span>
                  )}
                  {selectMode && (
                    <span className={`absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full border ${sel ? "border-brand bg-brand text-white" : "border-white/70 bg-black/30"}`}>
                      {sel && <Check size={12} />}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Koleksiyon oluşturma alt çubuğu */}
      {selectMode && (
        <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-border bg-surface/95 p-4 backdrop-blur">
          <p className="mb-2 text-xs text-muted">{selected.length} hikaye seçildi — koleksiyona ad ver</p>
          <div className="flex items-center gap-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Seyahat, Spor, Kahve…"
              className="flex-1 rounded-full border border-border bg-elevated px-4 py-2.5 text-sm outline-none focus:border-brand"
            />
            <button
              onClick={olustur}
              disabled={busy || !title.trim() || selected.length === 0}
              className="brand-gradient flex items-center gap-1 rounded-full px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : "Oluştur"}
            </button>
            <button onClick={() => { setSelectMode(false); setSelected([]); setTitle(""); }} className="rounded-full p-2.5 text-muted">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Koleksiyon / arşiv görüntüleyici */}
      {view && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black">
          <div className="flex items-center justify-between p-4">
            <span className="font-semibold text-white">{view.title}</span>
            <button onClick={() => setView(null)}><X className="text-white" /></button>
          </div>
          <div className="flex gap-1 px-4">
            {view.items.map((_, k) => (
              <span key={k} className={`h-1 flex-1 rounded-full ${k <= view.idx ? "bg-white" : "bg-white/30"}`} />
            ))}
          </div>
          <div
            className="flex flex-1 items-center justify-center px-6"
            onClick={() => setView((v) => (v && v.idx + 1 < v.items.length ? { ...v, idx: v.idx + 1 } : null))}
          >
            {(() => {
              const it = view.items[view.idx];
              if (!it) return null;
              if (it.type === "text") return <p className="text-center text-2xl font-semibold text-white">{it.text}</p>;
              return (
                <div className="relative flex max-h-full items-center justify-center">
                  {it.type === "video" ? (
                    <video src={it.media || ""} autoPlay controls className="max-h-[80dvh] rounded-2xl" />
                  ) : (
                    <img src={it.media || ""} className="max-h-[80dvh] rounded-2xl" alt="" />
                  )}
                  {it.text && (
                    <p className="absolute bottom-4 left-1/2 max-w-[90%] -translate-x-1/2 rounded-2xl bg-black/50 px-4 py-2 text-center text-base font-medium text-white">
                      {it.text}
                    </p>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
