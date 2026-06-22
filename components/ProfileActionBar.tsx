"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Heart, Gift } from "lucide-react";

// Profil detay alt aksiyon barı — yalnız UI; mevcut endpoint/route'ları kullanır
// (interact like, sohbet, mağaza). Backend/mantık değişmez.
export default function ProfileActionBar({
  targetId,
  matchId,
  t,
}: {
  targetId: string;
  matchId: string | null;
  t: { message: string; like: string; liked: string; gift: string };
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [liked, setLiked] = useState(false);

  async function begen() {
    if (busy || liked) return;
    setBusy(true);
    try {
      const res = await fetch("/api/interact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to_user: targetId, type: "tanis" }),
      });
      const data = await res.json().catch(() => ({}));
      if (data?.matched && data?.matchId) {
        router.push(`/sohbet/${data.matchId}`);
        return;
      }
      setLiked(true);
    } finally {
      setBusy(false);
    }
  }

  const goldBtn =
    "flex h-14 flex-1 items-center justify-center gap-2.5 rounded-2xl text-[15px] font-bold text-[#1c1407] shadow-[0_14px_36px_-12px_rgba(199,169,119,0.5)] transition active:scale-[0.98] disabled:opacity-60";
  const goldBg = { background: "linear-gradient(150deg,#DBBF8E,#C7A977 55%,#b2945f)" };
  const ghostBtn =
    "flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-accent backdrop-blur-md transition active:scale-[0.98] disabled:opacity-60";

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+86px)] z-40 mx-auto max-w-[460px] px-5">
      <div className="pointer-events-auto flex gap-3">
        {matchId ? (
          <button onClick={() => router.push(`/sohbet/${matchId}`)} className={goldBtn} style={goldBg}>
            <MessageCircle size={19} /> {t.message}
          </button>
        ) : (
          <button onClick={begen} disabled={busy} className={goldBtn} style={goldBg}>
            <Heart size={19} fill="currentColor" strokeWidth={0} /> {liked ? t.liked : t.like}
          </button>
        )}

        {matchId && (
          <button onClick={begen} disabled={busy || liked} aria-label={t.like} className={ghostBtn}>
            <Heart size={22} fill={liked ? "currentColor" : "none"} strokeWidth={liked ? 0 : 1.9} />
          </button>
        )}

        <button
          onClick={() => router.push(matchId ? `/sohbet/${matchId}` : "/magaza")}
          aria-label={t.gift}
          className={ghostBtn}
        >
          <Gift size={22} strokeWidth={1.9} />
        </button>
      </div>
    </div>
  );
}
