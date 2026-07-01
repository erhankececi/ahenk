"use client";

import { useEffect, useRef, useState } from "react";
import { Heart, Sparkles, Bookmark, MessageCircle, Plus, X, ImagePlus, Gift as GiftIcon, MoreVertical, Archive, Trash2, BadgeCheck, Share2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { zamanFarki } from "@/lib/utils";
import { tierFrame } from "@/components/PremiumBadge";
import MomentComments from "@/components/MomentComments";
import GiftStore from "@/components/GiftStore";
import GiftAnimation from "@/components/GiftAnimation";
import { giftByKey, type Gift as GiftT } from "@/lib/gifts";
import { useLang } from "@/components/LangProvider";

type Media = { type: string; url: string };
type Moment = {
  id: string; user_id: string; name: string; text: string | null;
  city?: string | null; verified?: boolean; tier?: string; created_at?: string;
  album: Media[]; tags: string[]; highlighted: boolean;
  reactions: number; comments: number; comments_off: boolean; gifts_off: boolean; mine: boolean;
};

function Carousel({ album }: { album: Media[] }) {
  const [i, setI] = useState(0);
  return (
    <div className="relative bg-black">
      <div
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
        onScroll={(e) => { const el = e.currentTarget; setI(Math.round(el.scrollLeft / el.clientWidth)); }}
      >
        {album.map((m, k) => (
          <div key={k} className="flex w-full shrink-0 snap-center items-center justify-center">
            {m.type === "video"
              ? <video src={m.url} controls playsInline className="max-h-[70vh] w-full object-contain" />
              : <img src={m.url} className="max-h-[70vh] w-full object-contain" alt="" loading="lazy" />}
          </div>
        ))}
      </div>
      {album.length > 1 && (
        <>
          <span className="absolute right-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-xs font-medium text-white">{i + 1}/{album.length}</span>
          <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1">
            {album.map((_, k) => <span key={k} className={`h-1.5 rounded-full transition-all ${k === i ? "w-4 bg-white" : "w-1.5 bg-white/50"}`} />)}
          </div>
        </>
      )}
    </div>
  );
}

export default function MomentsFeed() {
  const supabase = createClient();
  const tmo = useLang().t.moments;
  const [moments, setMoments] = useState<Moment[]>([]);
  const [composing, setComposing] = useState(false);
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [warn, setWarn] = useState("");
  const [loading, setLoading] = useState(true);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [commentsFor, setCommentsFor] = useState<string | null>(null);
  const [giftFor, setGiftFor] = useState<Moment | null>(null);
  const [giftAnim, setGiftAnim] = useState<GiftT | null>(null);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const fileRef = useRef<HTMLInputElement>(null);

  function load() {
    fetch("/api/moments").then((r) => r.json()).then((d) => { setMoments(d.moments || []); setLoading(false); });
  }
  useEffect(load, []);

  // Üst bardaki + butonu composer'ı açar
  useEffect(() => {
    const open = () => setComposing(true);
    window.addEventListener("ahenk:moment-new", open);
    return () => window.removeEventListener("ahenk:moment-new", open);
  }, []);

  function dosyaSec(selected: File[]) {
    const ok = selected.filter((f) => (f.type.startsWith("video") ? f.size <= 50 * 1024 * 1024 : f.type.startsWith("image") ? f.size <= 10 * 1024 * 1024 : false));
    if (ok.length < selected.length) setWarn(tmo.filesSkipped);
    setFiles((p) => [...p, ...ok].slice(0, 10));
  }

  async function paylas() {
    if (uploading || (!files.length && !text.trim())) return;
    setUploading(true);
    setWarn("");
    try {
      const media: { type: string; media_path: string }[] = [];
      if (files.length) {
        const { data } = await supabase.auth.getUser();
        const meId = data.user?.id;
        for (const f of files) {
          const isVid = f.type.startsWith("video");
          const ext = (f.name.split(".").pop() || (isVid ? "mp4" : "jpg")).toLowerCase();
          const path = `${meId}/moments/${crypto.randomUUID()}.${ext}`;
          const { error } = await supabase.storage.from("media").upload(path, f, { contentType: f.type, upsert: false });
          if (!error) media.push({ type: isVid ? "video" : "photo", media_path: path });
        }
      }
      await fetch("/api/moments", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: media[0]?.type || "text", text: text.trim() || null, media }),
      });
    } finally { setUploading(false); }
    setText(""); setFiles([]); setComposing(false); load();
  }

  async function react(id: string, type: string) {
    await fetch("/api/moments/react", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ moment_id: id, type }) });
  }
  function begen(id: string) {
    if (liked.has(id)) return;
    setLiked((s) => new Set(s).add(id));
    setMoments((ms) => ms.map((m) => (m.id === id ? { ...m, reactions: m.reactions + 1 } : m)));
    react(id, "begen");
  }
  function kaydet(id: string) {
    setSaved((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
    react(id, "kaydet");
  }
  async function paylasMoment(m: Moment) {
    const url = `${location.origin}/u/${m.user_id}`;
    try {
      if (navigator.share) await navigator.share({ title: "Ahenk", text: `${m.name} · ${tmo.shareMoment}`, url });
      else { await navigator.clipboard.writeText(url); setWarn(tmo.linkCopied); setTimeout(() => setWarn(""), 2000); }
    } catch {}
  }

  async function sil(id: string) {
    setMenuFor(null);
    if (!confirm(tmo.deleteConfirm)) return;
    await fetch(`/api/moments?id=${id}`, { method: "DELETE" });
    setMoments((ms) => ms.filter((m) => m.id !== id));
  }
  async function patch(id: string, body: any) {
    setMenuFor(null);
    await fetch("/api/moments", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...body }) });
    if (body.archived) setMoments((ms) => ms.filter((m) => m.id !== id));
    else setMoments((ms) => ms.map((m) => (m.id === id ? { ...m, ...body } : m)));
  }

  async function hediyeGonder(key: string) {
    const m = giftFor;
    setGiftFor(null);
    if (!m) return;
    const r = await fetch("/api/gift", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ to_user: m.user_id, gift: key }) });
    const j = await r.json().catch(() => ({}));
    if (r.ok && j.ok) { const g = giftByKey(key); if (g) setGiftAnim(g); }
    else setWarn(j?.error === "insufficient" ? tmo.insufficientGift : tmo.giftFailed);
  }

  if (loading)
    return <div className="space-y-4 pb-6">{[0, 1].map((i) => <div key={i} className="h-72 animate-pulse rounded-[26px] ahenk-panel" />)}</div>;

  return (
    <div className="space-y-5 pb-6" onClick={() => menuFor && setMenuFor(null)}>
      {composing && (
        <div className="rounded-[26px] ahenk-panel p-4">
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} placeholder={tmo.composerPlaceholder} className="w-full rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 outline-none placeholder:text-text/35 focus:border-brand/60" />
          {files.length > 0 && (
            <div className="mt-2 grid grid-cols-4 gap-2">
              {files.map((f, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-xl bg-elevated">
                  {f.type.startsWith("video") ? <video src={URL.createObjectURL(f)} className="h-full w-full object-cover" muted /> : <img src={URL.createObjectURL(f)} alt="" className="h-full w-full object-cover" />}
                  <button onClick={() => setFiles((p) => p.filter((_, k) => k !== i))} className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"><X size={11} /></button>
                </div>
              ))}
            </div>
          )}
          {warn && <p className="mt-2 text-xs text-brand-2">{warn}</p>}
          <input ref={fileRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={(e) => { dosyaSec(Array.from(e.target.files || [])); if (fileRef.current) fileRef.current.value = ""; }} />
          <div className="mt-3 flex items-center gap-2">
            <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 rounded-2xl border border-border px-3 py-2.5 text-sm font-medium text-muted"><ImagePlus size={16} /> {tmo.photoVideo}</button>
            <button onClick={paylas} disabled={uploading || (!files.length && !text.trim())} className="brand-gradient flex-1 rounded-2xl py-2.5 text-sm font-semibold disabled:opacity-50">{uploading ? tmo.sharing : tmo.share}</button>
            <button onClick={() => { setComposing(false); setFiles([]); }} className="rounded-2xl px-4 text-muted"><X size={18} /></button>
          </div>
        </div>
      )}

      {moments.length === 0 && (
        <div className="flex flex-col items-center py-14 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10"><Sparkles size={26} className="text-brand" /></div>
          <h2 className="text-lg font-semibold">{tmo.emptyTitle}</h2>
          <p className="mt-1 text-sm text-muted">{tmo.emptyDesc}</p>
        </div>
      )}

      {moments.map((m) => (
        <div key={m.id} className={`overflow-hidden rounded-[26px] ahenk-card-border ${m.highlighted ? "!border-brand/60" : ""}`}>
          <div className="relative flex items-center justify-between p-3">
            <a href={`/u/${m.user_id}`} className="flex items-center gap-2.5">
              <span className={`rounded-full ${tierFrame(m.tier || "free")}`}>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold text-accent ring-1 ring-accent/20">{m.name?.[0]?.toUpperCase() || "?"}</span>
              </span>
              <div className="leading-tight">
                <p className="flex items-center gap-1 text-sm font-semibold">
                  {m.name}{m.verified && <BadgeCheck size={14} className="text-sky-400" />}
                </p>
                <p className="text-xs text-muted">
                  {m.created_at ? zamanFarki(m.created_at) : ""}{m.city ? ` · ${m.city}` : ""}
                </p>
              </div>
            </a>
            {m.mine && (
              <button onClick={(e) => { e.stopPropagation(); setMenuFor(menuFor === m.id ? null : m.id); }} className="text-muted"><MoreVertical size={18} /></button>
            )}
            {menuFor === m.id && (
              <div className="absolute right-3 top-12 z-10 w-44 overflow-hidden rounded-2xl border border-white/10 bg-[#17151A] shadow-[0_20px_50px_-30px_rgba(0,0,0,0.95)]">
                <button onClick={() => patch(m.id, { archived: true })} className="flex w-full items-center gap-2 px-4 py-3 text-sm hover:bg-surface"><Archive size={15} /> {tmo.archive}</button>
                <button onClick={() => patch(m.id, { comments_off: !m.comments_off })} className="flex w-full items-center gap-2 px-4 py-3 text-sm hover:bg-surface"><MessageCircle size={15} /> {m.comments_off ? tmo.commentsOn : tmo.commentsOff}</button>
                <button onClick={() => patch(m.id, { gifts_off: !m.gifts_off })} className="flex w-full items-center gap-2 px-4 py-3 text-sm hover:bg-surface"><GiftIcon size={15} /> {m.gifts_off ? tmo.giftsOn : tmo.giftsOff}</button>
                <button onClick={() => sil(m.id)} className="flex w-full items-center gap-2 px-4 py-3 text-sm text-error hover:bg-surface"><Trash2 size={15} /> {tmo.delete}</button>
              </div>
            )}
          </div>

          {m.album.length > 0 && <Carousel album={m.album} />}

          {/* Aksiyon çubuğu — Instagram düzeni */}
          <div className="flex items-center gap-4 px-4 pt-3 text-text/88">
            <button onClick={() => begen(m.id)} className="flex items-center gap-1.5 active:scale-90">
              <Heart size={23} className={liked.has(m.id) ? "fill-rose-500 text-rose-500" : "text-text"} />
              <span className="text-sm font-medium">{m.reactions}</span>
            </button>
            {!m.comments_off && (
              <button onClick={() => setCommentsFor(m.id)} className="flex items-center gap-1.5 active:scale-90">
                <MessageCircle size={22} /> <span className="text-sm font-medium">{m.comments}</span>
              </button>
            )}
            <button onClick={() => paylasMoment(m)} className="active:scale-90"><Share2 size={21} /></button>
            <div className="ml-auto flex items-center gap-3.5">
              {!m.gifts_off && !m.mine && (
                <button onClick={() => setGiftFor(m)} className="text-accent active:scale-90"><GiftIcon size={22} /></button>
              )}
              <button onClick={() => kaydet(m.id)} className="active:scale-90">
                <Bookmark size={22} className={saved.has(m.id) ? "fill-accent text-accent" : "text-text"} />
              </button>
            </div>
          </div>

          {/* Açıklama */}
          {m.text && (
            <p className="px-4 pb-3 pt-2 text-sm leading-relaxed">
              <span className="font-semibold">{m.name}</span> {m.text}
            </p>
          )}
          {!m.comments_off && m.comments > 0 && (
            <button onClick={() => setCommentsFor(m.id)} className="px-4 pb-3 text-left text-xs text-muted">
              {tmo.viewAllComments.replace("{n}", String(m.comments))}
            </button>
          )}
        </div>
      ))}

      {commentsFor && <MomentComments momentId={commentsFor} onClose={() => setCommentsFor(null)} onCount={(d) => setMoments((ms) => ms.map((m) => (m.id === commentsFor ? { ...m, comments: Math.max(0, m.comments + d) } : m)))} />}
      {giftFor && <GiftStore otherName={giftFor.name} onSend={hediyeGonder} onClose={() => setGiftFor(null)} />}
      {giftAnim && <GiftAnimation gift={giftAnim} fromMe onDone={() => setGiftAnim(null)} />}
    </div>
  );
}
