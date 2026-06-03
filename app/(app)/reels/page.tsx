"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Gift as GiftIcon, Volume2, VolumeX, Film, Play } from "lucide-react";
import MomentComments from "@/components/MomentComments";
import GiftStore from "@/components/GiftStore";
import GiftAnimation from "@/components/GiftAnimation";
import { giftByKey, type Gift as GiftT } from "@/lib/gifts";

type Reel = {
  id: string; user_id: string; name: string; video: string; text: string | null;
  reactions: number; comments: number; gifts_off: boolean; comments_off: boolean; mine: boolean;
};

function ReelItem({ reel, muted, onToggleMute, onLike, onComment, onGift }: {
  reel: Reel; muted: boolean; onToggleMute: () => void;
  onLike: () => void; onComment: () => void; onGift: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);

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
      <video ref={ref} src={reel.video} loop playsInline muted={muted} onClick={tap} className="h-full w-full object-contain" />
      {paused && <div className="pointer-events-none absolute inset-0 flex items-center justify-center"><Play size={64} className="text-white/70" /></div>}

      {/* sağ aksiyonlar */}
      <div className="absolute bottom-28 right-3 flex flex-col items-center gap-5 text-white">
        <button onClick={onLike} className="flex flex-col items-center"><Heart size={30} /><span className="text-xs">{reel.reactions}</span></button>
        {!reel.comments_off && <button onClick={onComment} className="flex flex-col items-center"><MessageCircle size={28} /><span className="text-xs">{reel.comments}</span></button>}
        {!reel.gifts_off && !reel.mine && <button onClick={onGift} className="flex flex-col items-center text-accent"><GiftIcon size={28} /><span className="text-xs">Hediye</span></button>}
        <button onClick={onToggleMute}>{muted ? <VolumeX size={26} /> : <Volume2 size={26} />}</button>
      </div>

      {/* alt bilgi */}
      <div className="absolute inset-x-0 bottom-20 bg-gradient-to-t from-black/70 to-transparent p-4 pr-20 text-white">
        <Link href={`/u/${reel.user_id}`} className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand to-accent text-sm font-bold">{reel.name[0]?.toUpperCase()}</span>
          <span className="font-semibold">{reel.name}</span>
        </Link>
        {reel.text && <p className="mt-2 line-clamp-2 text-sm text-white/90">{reel.text}</p>}
      </div>
    </div>
  );
}

export default function Reels() {
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

  if (!reels) return <div className="flex h-[100dvh] items-center justify-center bg-black text-white/60">Yükleniyor…</div>;
  if (reels.length === 0)
    return (
      <div className="flex h-[80dvh] flex-col items-center justify-center gap-3 text-center text-muted">
        <Film size={36} className="text-brand" />
        <p className="font-semibold text-text">Henüz reels yok</p>
        <p className="text-sm">Moments'tan bir <b>video</b> paylaş — burada görünür.</p>
        <Link href="/moments" className="brand-gradient mt-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white">Video paylaş</Link>
      </div>
    );

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
        />
      ))}
      {commentsFor && <MomentComments momentId={commentsFor} onClose={() => setCommentsFor(null)} onCount={(d) => setReels((rs) => rs?.map((r) => (r.id === commentsFor ? { ...r, comments: Math.max(0, r.comments + d) } : r)) || null)} />}
      {giftFor && <GiftStore otherName={giftFor.name} onSend={gift} onClose={() => setGiftFor(null)} />}
      {giftAnim && <GiftAnimation gift={giftAnim} fromMe onDone={() => setGiftAnim(null)} />}
    </div>
  );
}
