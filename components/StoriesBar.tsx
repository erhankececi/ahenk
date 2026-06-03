"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Eye, Trash2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Item = { id: string; type: string; text: string | null; media: string | null };
type Group = { user_id: string; name: string; tier?: string; mine?: boolean; items: Item[] };

const STORY_EMOJIS = ["❤️", "🔥", "😍", "👏", "😮", "😂"];

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
  const [reacted, setReacted] = useState<string | null>(null);
  const [viewers, setViewers] = useState<{ count: number; viewers: any[] } | null>(null);
  const [replyText, setReplyText] = useState("");
  const supabase = createClient();
  const router = useRouter();

  function load() {
    fetch("/api/stories")
      .then((r) => r.json())
      .then((d) => setGroups(d.stories || []));
  }
  useEffect(load, []);

  // Görüntüleme kaydı + tepki sıfırlama (başkasının hikayesi açılınca)
  const curId = active?.items[idx]?.id;
  useEffect(() => {
    setReacted(null);
    setViewers(null);
    if (!active || active.mine || !curId) return;
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) supabase.from("story_views").upsert({ story_id: curId, viewer_id: data.user.id }).then(() => {});
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curId]);

  async function tepkiVer(emoji: string) {
    if (!curId) return;
    setReacted(emoji);
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      await supabase.from("story_reactions").upsert({ story_id: curId, user_id: data.user.id, emoji });
    }
  }

  async function izleyenleriAc() {
    if (!curId) return;
    const r = await fetch(`/api/stories/viewers?storyId=${curId}`);
    const d = await r.json().catch(() => ({}));
    if (d.viewers) setViewers({ count: d.count, viewers: d.viewers });
  }

  async function hikayeSil() {
    if (!curId || !confirm("Bu hikayeyi silmek istediğine emin misin?")) return;
    await fetch(`/api/stories?id=${curId}`, { method: "DELETE" });
    setActive(null);
    load();
  }

  async function yanitla() {
    if (!curId || !replyText.trim()) return;
    const t = replyText;
    setReplyText("");
    const r = await fetch("/api/stories/reply", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ storyId: curId, text: t }),
    });
    const j = await r.json().catch(() => ({}));
    setActive(null);
    if (j.matchId) router.push(`/sohbet/${j.matchId}`);
    else if (j.ownerId) router.push(`/u/${j.ownerId}`);
  }

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
            <div className="flex gap-1 px-4 pt-3">
              {active.items.map((_, k) => (
                <span
                  key={k}
                  className={`h-1 flex-1 rounded-full ${k <= idx ? "bg-white" : "bg-white/30"}`}
                />
              ))}
            </div>

            {/* Alt: kendi (izleyenler+sil) / başkası (yanıt + emoji) */}
            <div className="space-y-3 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              {active.mine ? (
                <div className="flex items-center gap-2">
                  <button onClick={izleyenleriAc} className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white">
                    <Eye size={16} /> Görüntüleyenler
                  </button>
                  <button onClick={hikayeSil} className="rounded-full bg-white/10 p-2.5 text-white" aria-label="Hikayeyi sil">
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center gap-3">
                    {STORY_EMOJIS.map((e) => (
                      <button key={e} onClick={() => tepkiVer(e)} className={`text-2xl transition active:scale-125 ${reacted === e ? "scale-125" : reacted ? "opacity-40" : ""}`}>
                        {e}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      value={replyText}
                      onChange={(ev) => setReplyText(ev.target.value)}
                      onKeyDown={(ev) => ev.key === "Enter" && yanitla()}
                      placeholder="Hikayeye yanıt yaz…"
                      className="flex-1 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/50"
                    />
                    <button onClick={yanitla} disabled={!replyText.trim()} className="rounded-full bg-white p-2.5 text-black disabled:opacity-40" aria-label="Gönder">
                      <Send size={16} />
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* İzleyenler listesi */}
            {viewers && (
              <div className="absolute inset-0 z-10 flex items-end bg-black/70" onClick={() => setViewers(null)}>
                <div onClick={(e) => e.stopPropagation()} className="max-h-[60dvh] w-full overflow-y-auto rounded-t-3xl bg-surface p-5">
                  <p className="mb-3 flex items-center gap-2 t-h4">
                    <Eye size={18} /> {viewers.count} görüntüleme
                  </p>
                  {viewers.viewers.length === 0 ? (
                    <p className="text-sm text-muted">Henüz görüntüleyen yok.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {viewers.viewers.map((v) => (
                        <div key={v.id} className="flex items-center gap-3 rounded-xl border border-border bg-elevated px-3 py-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand/40 to-accent/40 text-sm font-bold">
                            {v.name?.[0]?.toUpperCase() || "?"}
                          </span>
                          <span className="flex-1 truncate text-sm font-medium">{v.name}</span>
                          {v.emoji && <span className="text-lg">{v.emoji}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
