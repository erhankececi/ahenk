"use client";

import { useEffect, useState } from "react";
import { Heart, Sparkles, Bookmark, MessageCircle, Plus, X } from "lucide-react";

type Moment = {
  id: string;
  user_id: string;
  name: string;
  type: string;
  text: string | null;
  media: string | null;
  tags: string[];
  highlighted: boolean;
  views: number;
  reactions: number;
  mine: boolean;
};

const REACTS = [
  { type: "begen", label: "Beğen", icon: Heart },
  { type: "ilginc", label: "İlginç", icon: Sparkles },
  { type: "kaydet", label: "Kaydet", icon: Bookmark },
];

export default function MomentsFeed() {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [composing, setComposing] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  function load() {
    fetch("/api/moments")
      .then((r) => r.json())
      .then((d) => {
        setMoments(d.moments || []);
        setLoading(false);
      });
  }
  useEffect(load, []);

  async function paylas() {
    if (!text.trim()) return;
    await fetch("/api/moments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "text", text }),
    });
    setText("");
    setComposing(false);
    load();
  }

  async function react(id: string, type: string) {
    await fetch("/api/moments/react", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moment_id: id, type }),
    });
    setMoments((ms) => ms.map((m) => (m.id === id ? { ...m, reactions: m.reactions + 1 } : m)));
  }

  if (loading)
    return (
      <div className="space-y-4 pb-6">
        {[0, 1].map((i) => (
          <div key={i} className="overflow-hidden rounded-3xl border border-border bg-surface">
            <div className="flex items-center gap-2 p-4">
              <div className="shimmer h-9 w-9 rounded-full" />
              <div className="shimmer h-4 w-24 rounded" />
            </div>
            <div className="shimmer h-40 w-full" />
            <div className="space-y-2 p-4">
              <div className="shimmer h-4 w-full rounded" />
              <div className="shimmer h-4 w-2/3 rounded" />
            </div>
          </div>
        ))}
      </div>
    );

  return (
    <div className="space-y-4 pb-6">
      <button
        onClick={() => setComposing(true)}
        className="brand-gradient flex w-full items-center justify-center gap-2 rounded-2xl py-3 font-semibold text-white"
      >
        <Plus size={18} /> Anını paylaş
      </button>

      {composing && (
        <div className="rounded-3xl border border-border bg-surface p-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Şu an ne yapıyorsun?"
            className="w-full rounded-2xl border border-border bg-elevated px-4 py-3 outline-none focus:border-brand"
          />
          <div className="mt-2 flex gap-2">
            <button
              onClick={paylas}
              className="brand-gradient flex-1 rounded-2xl py-2.5 text-sm font-semibold text-white"
            >
              Paylaş
            </button>
            <button onClick={() => setComposing(false)} className="rounded-2xl px-4 text-muted">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {moments.length === 0 && (
        <div className="flex flex-col items-center py-14 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10">
            <Sparkles size={26} className="text-brand" />
          </div>
          <h2 className="text-lg font-semibold">Henüz an paylaşılmamış</h2>
          <p className="mt-1 text-sm text-muted">İlk anı sen paylaş — 24 saat görünür kalır.</p>
        </div>
      )}

      {moments.map((m) => (
        <div
          key={m.id}
          className={`overflow-hidden rounded-3xl border bg-surface ${
            m.highlighted ? "border-brand/60" : "border-border"
          }`}
        >
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-elevated font-semibold">
                {m.name?.[0]?.toUpperCase() || "?"}
              </span>
              <span className="font-medium">{m.name}</span>
            </div>
            {m.highlighted && <span className="text-xs text-brand">✦ Öne çıkan</span>}
          </div>

          {m.media &&
            (m.type === "video" ? (
              <video src={m.media} controls className="w-full" />
            ) : (
              <img src={m.media} className="w-full" alt="" />
            ))}

          {m.text && <p className="px-4 py-3 text-sm leading-relaxed">{m.text}</p>}

          {m.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 px-4 pb-2">
              {m.tags.map((t) => (
                <span key={t} className="rounded-full bg-elevated px-2 py-0.5 text-xs text-muted">
                  #{t}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-border px-4 py-2 text-muted">
            <div className="flex gap-4">
              {REACTS.map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  onClick={() => react(m.id, type)}
                  className="flex items-center gap-1 text-sm transition hover:text-brand active:scale-95"
                >
                  <Icon size={18} /> {label}
                </button>
              ))}
            </div>
            <span className="flex items-center gap-1 text-xs">
              <MessageCircle size={14} /> {m.reactions}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
