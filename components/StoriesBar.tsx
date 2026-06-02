"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";

type Item = { id: string; type: string; text: string | null; media: string | null };
type Group = { user_id: string; name: string; tier?: string; items: Item[] };

function ringClass(tier?: string): string {
  if (tier === "legend" || tier === "platinum") return "ring-premium";
  if (tier === "gold") return "ring-gold";
  if (tier === "plus") return "bg-gradient-to-tr from-slate-300 to-slate-100";
  return "bg-gradient-to-tr from-brand to-brand-2";
}

export default function StoriesBar() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [active, setActive] = useState<Group | null>(null);
  const [idx, setIdx] = useState(0);
  const [composing, setComposing] = useState(false);
  const [text, setText] = useState("");

  function load() {
    fetch("/api/stories")
      .then((r) => r.json())
      .then((d) => setGroups(d.stories || []));
  }
  useEffect(load, []);

  async function paylas() {
    if (!text.trim()) return;
    await fetch("/api/stories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "text", text }),
    });
    setText("");
    setComposing(false);
    load();
  }

  const cur = active?.items[idx];

  return (
    <>
      <div className="no-scrollbar mb-4 flex gap-3 overflow-x-auto pb-1">
        <button
          onClick={() => setComposing(true)}
          className="flex shrink-0 flex-col items-center gap-1"
        >
          <span className="brand-gradient flex h-16 w-16 items-center justify-center rounded-full">
            <Plus className="text-white" size={22} />
          </span>
          <span className="text-xs text-muted">Ekle</span>
        </button>
        {groups.map((g) => (
          <button
            key={g.user_id}
            onClick={() => {
              setActive(g);
              setIdx(0);
            }}
            className="flex shrink-0 flex-col items-center gap-1"
          >
            <span className={`rounded-full p-[2px] ${ringClass(g.tier)}`}>
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface text-lg font-semibold">
                {g.name?.[0]?.toUpperCase() || "?"}
              </span>
            </span>
            <span className="max-w-16 truncate text-xs text-muted">{g.name}</span>
          </button>
        ))}
      </div>

      {/* Hikaye oluştur */}
      <AnimatePresence>
        {composing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6"
            onClick={() => setComposing(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full rounded-3xl border border-border bg-surface p-5"
            >
              <h3 className="mb-3 font-semibold">Hikaye paylaş</h3>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ne düşünüyorsun?"
                rows={3}
                className="w-full rounded-2xl border border-border bg-elevated px-4 py-3 outline-none focus:border-brand"
              />
              <button
                onClick={paylas}
                className="brand-gradient mt-3 w-full rounded-2xl py-3 font-semibold text-white"
              >
                Paylaş
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hikaye görüntüleyici */}
      <AnimatePresence>
        {active && cur && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-black"
          >
            <div className="flex items-center justify-between p-4">
              <span className="font-semibold text-white">{active.name}</span>
              <button onClick={() => setActive(null)}>
                <X className="text-white" />
              </button>
            </div>
            <div
              className="flex flex-1 items-center justify-center px-6"
              onClick={() => {
                if (idx + 1 < active.items.length) setIdx(idx + 1);
                else setActive(null);
              }}
            >
              {cur.type === "text" ? (
                <p className="text-center text-2xl font-semibold text-white">{cur.text}</p>
              ) : cur.type === "video" ? (
                <video src={cur.media || ""} autoPlay controls className="max-h-full rounded-2xl" />
              ) : (
                <img src={cur.media || ""} className="max-h-full rounded-2xl" alt="" />
              )}
            </div>
            <div className="flex gap-1 p-4">
              {active.items.map((_, k) => (
                <span
                  key={k}
                  className={`h-1 flex-1 rounded-full ${k <= idx ? "bg-white" : "bg-white/30"}`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
