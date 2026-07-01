"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
      className="text-muted transition hover:text-text"
      aria-label="Kopyala"
    >
      {done ? <Check size={14} className="text-success" /> : <Copy size={14} />}
    </button>
  );
}
