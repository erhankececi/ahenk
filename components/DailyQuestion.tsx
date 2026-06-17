"use client";

import { useEffect, useState } from "react";
import { Sparkles, Check, Coins } from "lucide-react";

export default function DailyQuestion() {
  const [q, setQ] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [answer, setAnswer] = useState("");
  const [reward, setReward] = useState(20);
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
    setBusy(false);
    if (r.ok) {
      setAnswered(true);
      setOpen(false);
    }
  }

  if (!q) return null;

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
    </div>
  );
}
