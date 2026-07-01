"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Gift as GiftIcon, Volume2, VolumeX, Film, Play } from "lucide-react";
import MomentComments from "@/components/MomentComments";
import GiftStore from "@/components/GiftStore";
import GiftAnimation from "@/components/GiftAnimation";
import { giftByKey, type Gift as GiftT } from "@/lib/gifts";
import { useLang } from "@/components/LangProvider";
import type { AppDict } from "@/lib/i18n";

type Reel = {
  id: string; user_id: string; name: string; video: string; text: string | null;
  reactions: number; comments: number; gifts_off: boolean; comments_off: boolean; mine: boolean;
};

function ReelItem({ reel, muted, onToggleMute, onLike, onComment, onGift, tr }: {
  reel: Reel; muted: boolean; onToggleMute: () => void;
  onLike: () => void; onComment: () => void; onGift: () => void; tr: AppDict["reels"];
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting && e.intersectionRatio > 0.6) { v.play().catch(() => {}); setPaused(false); } else v.pause(); },
      { threshold: [0, 0.6, 1] }
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  function tap() {
    const v = ref.current; if (!v) return;
    if (v.paused) { v.play().catch(() => {}); setPaused(false); } else { v.pause(); setPaused(true); }
  }

  return (
    <div className="relative h-[100dvh] w-full shrink-0 snap-start snap-always bg-black">
      <video ref={ref} src={reel.video} loop playsInline muted={muted} onClick={tap} className="h-full w-full object-cover" />
      {paused && <div className="pointer-events-none absolute inset-0 flex items-center justify-center"><Play size={60} className="text-white/60" fill="currentColor" strokeWidth={0} /></div>}

      {/* sağ aksiyonlar — ince, sessiz */}
      <div className="absolute bottom-28 right-3.5 flex flex-col items-center gap-6 text-white">
        <button onClick={() => { if (!liked) { setLiked(true); onLike(); } }} aria-label={tr.like} className="flex flex-col items-center gap-1">
          <Heart size={29} strokeWidth={1.6} className={liked ? "fill-rose-500 text-rose-500" : ""} />
          <span className="text-xs font-medium">{reel.reactions}</span>
        </button>
        {!reel.comments_off && (
          <button onClick={onComment} aria-label={tr.comment} className="flex flex-col items-center gap-1">
            <MessageCircle size={28} strokeWidth={1.6} /><span className="text-xs font-medium">{reel.comments}</span>
          </button>
        )}
        {!reel.gifts_off && !reel.mine && (
          <button onClick={onGift} aria-label={tr.gift} className="flex flex-col items-center gap-1 text-accent">
            <GiftIcon size={27} strokeWidth={1.6} />
          </button>
        )}
        <button onClick={onToggleMute} aria-label={muted ? tr.soundOn : tr.soundOff}>{muted ? <VolumeX size={25} strokeWidth={1.6} /> : <Volume2 size={25} strokeWidth={1.6} />}</button>
      </div>

      {/* alt bilgi — sessiz overlay */}
      <div className="absolute inset-x-0 bottom-20 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 pr-20 pt-12 text-white">
        <Link href={`/u/${reel.user_id}`} className="flex items-center gap-2.5">
          <span className="lp-monogram flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ring-1 ring-white/20">{reel.name[0]?.toUpperCase()}</span>
          <span className="font-semibold">{reel.name}</span>
        </Link>
        {reel.text && <p className="mt-2.5 line-clamp-2 text-sm text-white/85">{reel.text}</p>}
      </div>
    </div>
  );
}

export default function Reels() {
  const tr = useLang().t.reels;
  const [reels, setReels] = useState<Reel[] | null>(null);
  const [muted, setMuted] = useState(true);
  const [commentsFor, setCommentsFor] = useState<string | null>(null);
  const [giftFor, setGiftFor] = useState<Reel | null>(null);
  const [giftAnim, setGiftAnim] = useState<GiftT | null>(null);

  useEffect(() => { fetch("/api/reels").then((r) => r.json()).then((d) => setReels(d.reels || [])); }, []);

  async function like(id: string) {
    await fetch("/api/moments/react", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ moment_id: id, type: "begen" }) });
    setReels((rs) => rs?.map((r) => (r.id === id ? { ...r, reactions: r.reactions + 1 } : r)) || null);
  }
  async function gift(key: string) {
    const r = giftFor; setGiftFor(null); if (!r) return;
    const res = await fetch("/api/gift", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ to_user: r.user_id, gift: key }) });
    const j = await res.json().catch(() => ({}));
    if (res.ok && j.ok) { const g = giftByKey(key); if (g) setGiftAnim(g); }
  }

  if (!reels) return <div className="flex h-[100dvh] items-center justify-center bg-black text-white/60">{tr.loading}</div>;
  if (reels.length === 0) {
    const [pre, post] = tr.emptyDesc.split("{video}");
    return (
      <div className="lp-page flex h-[80dvh] flex-col items-center justify-center gap-3 text-center text-muted">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-accent"><Film size={26} /></span>
        <p className="mt-1 font-display text-lg font-semibold text-text">{tr.emptyTitle}</p>
        <p className="text-sm">{pre}<b className="text-text">{tr.videoWord}</b>{post}</p>
        <Link href="/moments" className="lp-cta-gold mt-2 rounded-full px-5 py-2.5 text-sm font-semibold">{tr.shareVideo}</Link>
      </div>
    );
  }

  return (
    <div className="no-scrollbar -mt-6 h-[100dvh] snap-y snap-mandatory overflow-y-scroll bg-black">
      {reels.map((r) => (
        <ReelItem
          key={r.id}
          reel={r}
          muted={muted}
          onToggleMute={() => setMuted((v) => !v)}
          onLike={() => like(r.id)}
          onComment={() => setCommentsFor(r.id)}
          onGift={() => setGiftFor(r)}
          tr={tr}
        />
      ))}
      {commentsFor && <MomentComments momentId={commentsFor} onClose={() => setCommentsFor(null)} onCount={(d) => setReels((rs) => rs?.map((r) => (r.id === commentsFor ? { ...r, comments: Math.max(0, r.comments + d) } : r)) || null)} />}
      {giftFor && <GiftStore otherName={giftFor.name} onSend={gift} onClose={() => setGiftFor(null)} />}
      {giftAnim && <GiftAnimation gift={giftAnim} fromMe onDone={() => setGiftAnim(null)} />}
    </div>
  );
}
