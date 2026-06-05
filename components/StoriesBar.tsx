"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Eye, Trash2, Send, ImagePlus, Type as TypeIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Item = { id: string; type: string; text: string | null; media: string | null };
type Group = { user_id: string; name: string; tier?: string; mine?: boolean; items: Item[] };

const STORY_EMOJIS = ["❤️", "🔥", "😍", "👏", "😮", "😂"];

// Mono ince pirinç halka — Instagram gradyan halkaları yok (VISION V1).
function ringClass(_tier?: string): string {
  return "bg-accent/45";
}

export default function StoriesBar() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [active, setActive] = useState<Group | null>(null);
  const [idx, setIdx] = useState(0);
  const [composing, setComposing] = useState(false);
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
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

  function kapat() {
    setComposing(false);
    setText("");
    setFile(null);
  }

  async function paylas() {
    if (!file && !text.trim()) return;
    setUploading(true);
    try {
      let media_path: string | null = null;
      let type: "photo" | "video" | "text" = "text";
      if (file) {
        const { data } = await supabase.auth.getUser();
        if (!data.user) { setUploading(false); return; }
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
        const path = `${data.user.id}/stories/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("media")
          .upload(path, file, { contentType: file.type, upsert: false });
        if (upErr) { alert("Yükleme başarısız: " + upErr.message); setUploading(false); return; }
        media_path = path;
        type = file.type.startsWith("video") ? "video" : "photo";
      }
      await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, text: text.trim() || null, media_path }),
      });
      kapat();
      load();
    } finally {
      setUploading(false);
    }
  }

  const cur = active?.items[idx];

  return (
    <>
      <div className="no-scrollbar mb-4 flex gap-3 overflow-x-auto pb-1">
        <button
          onClick={() => setComposing(true)}
          className="flex shrink-0 flex-col items-center gap-1"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-border text-muted transition hover:border-accent/50 hover:text-text">
            <Plus size={22} strokeWidth={1.6} />
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
            onClick={kapat}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl border border-border bg-surface p-5"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">Hikaye paylaş</h3>
                <button onClick={kapat} className="text-muted"><X size={18} /></button>
              </div>

              {/* Medya seçimi / önizleme */}
              {file ? (
                <div className="relative mb-3 overflow-hidden rounded-2xl bg-black">
                  {file.type.startsWith("video") ? (
                    <video src={URL.createObjectURL(file)} className="max-h-72 w-full object-contain" controls />
                  ) : (
                    <img src={URL.createObjectURL(file)} className="max-h-72 w-full object-contain" alt="" />
                  )}
                  <button onClick={() => setFile(null)} className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white">
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <label className="mb-3 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-elevated py-8 text-muted transition hover:border-brand">
                  <ImagePlus size={26} />
                  <span className="text-sm font-medium">Fotoğraf veya video seç</span>
                  <span className="text-xs">veya aşağıya yazı yaz</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); }}
                  />
                </label>
              )}

              <div className="flex items-start gap-2 rounded-2xl border border-border bg-elevated px-3 py-2">
                <TypeIcon size={16} className="mt-2.5 text-muted" />
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={file ? "Yazı ekle (isteğe bağlı)…" : "Ne düşünüyorsun?"}
                  rows={file ? 1 : 3}
                  className="w-full resize-none bg-transparent py-2 outline-none"
                />
              </div>

              <button
                onClick={paylas}
                disabled={uploading || (!file && !text.trim())}
                className="brand-gradient mt-3 flex w-full items-center justify-center gap-2 rounded-2xl py-3 font-semibold text-white disabled:opacity-50"
              >
                {uploading ? <><Loader2 size={18} className="animate-spin" /> Yükleniyor…</> : "Paylaş"}
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
              ) : (
                <div className="relative flex max-h-full items-center justify-center">
                  {cur.type === "video" ? (
                    <video src={cur.media || ""} autoPlay controls className="max-h-[80dvh] rounded-2xl" />
                  ) : (
                    <img src={cur.media || ""} className="max-h-[80dvh] rounded-2xl" alt="" />
                  )}
                  {cur.text && (
                    <p className="absolute bottom-4 left-1/2 max-w-[90%] -translate-x-1/2 rounded-2xl bg-black/50 px-4 py-2 text-center text-base font-medium text-white backdrop-blur-sm">
                      {cur.text}
                    </p>
                  )}
                </div>
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
