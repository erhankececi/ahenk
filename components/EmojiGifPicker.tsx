"use client";

import { useState } from "react";
import { Smile, Film } from "lucide-react";

const EMOJIS = [
  "😀", "😂", "🥹", "😍", "😎", "🤩", "😘", "😅", "🙃", "😇",
  "🥰", "😋", "🤗", "🤔", "😴", "😭", "😡", "🥳", "😱", "🤯",
  "👍", "👎", "👏", "🙏", "🤝", "💪", "🫶", "👀", "🔥", "✨",
  "💯", "🎉", "❤️", "💜", "💔", "💋", "🌹", "☕", "🍀", "🌙",
];

const GIPHY_KEY = process.env.NEXT_PUBLIC_GIPHY_KEY;

export default function EmojiGifPicker({
  onEmoji,
  onGif,
}: {
  onEmoji: (e: string) => void;
  onGif: (url: string) => void;
}) {
  const [tab, setTab] = useState<"emoji" | "gif">("emoji");
  const [q, setQ] = useState("");
  const [gifs, setGifs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function ara(query: string) {
    if (!GIPHY_KEY) return;
    setLoading(true);
    try {
      const url = `https://api.giphy.com/v1/gifs/${query ? "search" : "trending"}?api_key=${GIPHY_KEY}&limit=18&rating=pg-13${
        query ? `&q=${encodeURIComponent(query)}` : ""
      }`;
      const r = await fetch(url);
      const j = await r.json();
      setGifs((j.data || []).map((g: any) => g.images?.fixed_height?.url).filter(Boolean));
    } catch {
      setGifs([]);
    }
    setLoading(false);
  }

  return (
    <div className="absolute bottom-full left-2 right-2 z-20 mb-2 h-64 overflow-hidden rounded-2xl border border-border bg-surface shadow-float">
      <div className="flex border-b border-border">
        <button
          onClick={() => setTab("emoji")}
          className={`flex flex-1 items-center justify-center gap-1.5 py-2 text-sm font-medium ${tab === "emoji" ? "text-brand" : "text-muted"}`}
        >
          <Smile size={15} /> Emoji
        </button>
        <button
          onClick={() => {
            setTab("gif");
            if (!gifs.length) ara("");
          }}
          className={`flex flex-1 items-center justify-center gap-1.5 py-2 text-sm font-medium ${tab === "gif" ? "text-brand" : "text-muted"}`}
        >
          <Film size={15} /> GIF
        </button>
      </div>

      {tab === "emoji" ? (
        <div className="grid grid-cols-8 gap-1 overflow-y-auto p-2" style={{ maxHeight: "13rem" }}>
          {EMOJIS.map((e) => (
            <button key={e} onClick={() => onEmoji(e)} className="rounded-lg py-1.5 text-xl transition hover:bg-elevated">
              {e}
            </button>
          ))}
        </div>
      ) : !GIPHY_KEY ? (
        <p className="p-4 text-center text-xs text-muted">
          GIF araması için Giphy API anahtarı gerekli (NEXT_PUBLIC_GIPHY_KEY). Şimdilik emoji kullanabilirsin.
        </p>
      ) : (
        <div className="flex h-[calc(100%-2.5rem)] flex-col">
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              ara(e.target.value);
            }}
            placeholder="GIF ara…"
            className="m-2 rounded-xl border border-border bg-bg px-3 py-1.5 text-sm outline-none focus:border-brand"
          />
          {loading ? (
            <p className="p-3 text-center text-xs text-muted">Aranıyor…</p>
          ) : (
            <div className="grid grid-cols-3 gap-1 overflow-y-auto px-2 pb-2">
              {gifs.map((g) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={g}
                  src={g}
                  alt="gif"
                  onClick={() => onGif(g)}
                  className="aspect-square w-full cursor-pointer rounded-lg object-cover"
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
