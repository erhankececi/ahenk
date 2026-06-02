"use client";

import { useState } from "react";
import { Globe, Check, X } from "lucide-react";
import { LANGS, type Lang } from "@/lib/i18n";

export default function LanguageSwitcher({ current }: { current: Lang }) {
  const [open, setOpen] = useState(false);

  function pick(code: Lang) {
    document.cookie = `lang=${code}; path=/; max-age=31536000`;
    if (typeof window !== "undefined") window.location.reload();
  }

  const cur = LANGS.find((l) => l.code === current) || LANGS[0];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm text-muted transition hover:text-text"
      >
        <Globe size={16} /> <span className="hidden sm:inline">{cur.native}</span>
      </button>
      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-border bg-surface p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Dil seç / Select language</h3>
              <button onClick={() => setOpen(false)} aria-label="Kapat">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-1">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => pick(l.code)}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition hover:bg-elevated"
                >
                  <span>
                    <span className="font-medium">{l.native}</span>{" "}
                    <span className="text-sm text-muted">{l.label}</span>
                  </span>
                  {l.code === current && <Check size={16} className="text-brand" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
