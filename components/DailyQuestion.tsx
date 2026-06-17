"use client";

import { useEffect, useState } from "react";
import { Sparkles, Check, Coins, Flame } from "lucide-react";

export default function DailyQuestion() {
  const [q, setQ] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [answer, setAnswer] = useState("");
  const [reward, setReward] = useState(20);
  const [streak, setStreak] = useState(0);
  const [bonus, setBonus] = useState(0);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/daily")
      .then((r) => r.json())
      .then((d) => {
        if (d.question) {
          setQ(d.question);
          setAnswered(!!d.answered);
          if (d.answer) setAnswer(d.answer);
          if (d.reward) setReward(d.reward);
          if (typeof d.streak === "number") setStreak(d.streak);
        }
      })
      .catch(() => {});
  }, []);

  async function gonder() {
    if (busy || !answer.trim()) return;
    setBusy(true);
    const r = await fetch("/api/daily", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer }),
    });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (r.ok && j.ok) {
      setAnswered(true);
      setOpen(false);
      if (typeof j.streak === "number") setStreak(j.streak);
      if (j.bonus) setBonus(j.bonus);
    }
  }

  if (!q) return null;

  // Gün serisi göstergesi: 7'lik döngü; tamamlanmış günler pirinç dolu.
  const dolu = answered ? streak : streak; // mevcut seri
  const dotCount = 7;
  const ringIndex = ((dolu - 1) % dotCount + dotCount) % dotCount; // bugünün noktası (0-tabanlı)
  const filled = dolu === 0 ? 0 : ringIndex + 1;
  const nextHint = !answered
    ? `Bugün yanıtla, +${reward} jeton kazan`
    : filled === 3
      ? "Süper — 3 günlük seri! Yarın da gel."
      : filled >= 7
        ? "7 günlük seri tamam — efsane!"
        : filled === 2
          ? "Yarın 3. gün: +50 jeton bonus"
          : filled === 6
            ? "Yarın 7. gün: +150 jeton bonus"
            : "Serini koru, yarın tekrar 20 jeton";

  return (
    <div className="rounded-2xl border border-accent/25 bg-gradient-to-br from-accent/10 to-transparent p-4">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm font-semibold text-accent">
          <Sparkles size={15} /> Günün Sorusu
        </p>
        {answered ? (
          <span className="flex items-center gap-1 text-xs text-success">
            <Check size={13} /> Yanıtlandı
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-accent">
            <Coins size={12} /> +{reward}
          </span>
        )}
      </div>
      <p className="mt-1.5 font-medium">{q}</p>

      {!answered && !open && (
        <button
          onClick={() => setOpen(true)}
          className="mt-3 rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-[#1c1407]"
        >
          Yanıtla
        </button>
      )}
      {!answered && open && (
        <div className="mt-3 space-y-2">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={2}
            autoFocus
            placeholder="Yanıtın…"
            className="w-full rounded-xl border border-white/10 bg-[#0E0D10] px-3 py-2 text-sm text-text outline-none focus:border-accent/50"
          />
          <button
            onClick={gonder}
            disabled={busy || !answer.trim()}
            className="rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-[#1c1407] disabled:opacity-50"
          >
            {busy ? "…" : `Gönder · +${reward} jeton`}
          </button>
        </div>
      )}
      {answered && answer && <p className="mt-2 text-sm text-muted">“{answer}”</p>}

      {/* Gün serisi (streak) */}
      <div className="mt-3 border-t border-white/10 pt-3">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-accent">
            <Flame size={13} /> Gün serin{streak > 0 ? ` · ${streak}` : ""}
          </p>
          <div className="flex items-center gap-1">
            {Array.from({ length: dotCount }).map((_, i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full ${i < filled ? "bg-accent" : "bg-white/15"}`}
              />
            ))}
          </div>
        </div>
        <p className="mt-1.5 text-[11px] leading-4 text-muted">{nextHint}</p>
        {bonus > 0 && (
          <p className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-accent">
            <Coins size={11} /> +{bonus} seri bonusu kazandın!
          </p>
        )}
      </div>
    </div>
  );
}
