"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { THEMES } from "@/lib/themes";
import { Check, Palette, Lock } from "lucide-react";
import { useLang } from "@/components/LangProvider";

export default function ThemePicker({
  userId,
  initial,
  locked,
}: {
  userId: string;
  initial: string;
  locked: boolean;
}) {
  const { t: dict } = useLang();
  const ts = dict.settings;
  const supabase = createClient();
  const [theme, setTheme] = useState(initial || "default");
  const [saving, setSaving] = useState(false);

  async function sec(id: string) {
    if (locked || saving || id === theme) return;
    setSaving(true);
    setTheme(id);
    await supabase.from("profiles").update({ theme: id }).eq("id", userId);
    setSaving(false);
    // arka planın hemen yansıması için sayfayı tazele
    if (typeof window !== "undefined") window.location.reload();
  }

  return (
    <div className="mb-6 rounded-3xl border border-border bg-surface/80 p-4">
      <p className="mb-1 flex items-center gap-2 t-h4">
        <Palette size={18} /> {ts.themePickerTitle}
      </p>
      <p className="mb-3 t-caption text-muted">
        {locked ? ts.themeLockedDesc : ts.themeUnlockedDesc}
      </p>
      <div className="grid grid-cols-4 gap-2">
        {THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => sec(t.id)}
            disabled={locked || saving}
            className={`relative flex flex-col items-center gap-1 rounded-2xl border p-2 transition ${
              theme === t.id ? "border-brand" : "border-border"
            } ${locked ? "opacity-50" : "hover:border-brand/60"}`}
          >
            <span className="h-8 w-full rounded-lg" style={{ background: t.swatch }} />
            <span className="t-caption">{(ts.themeNames[t.id] || t.label).split(" ")[0]}</span>
            {theme === t.id && !locked && (
              <Check size={14} className="absolute right-1 top-1 text-brand" />
            )}
            {locked && <Lock size={12} className="absolute right-1 top-1 text-muted" />}
          </button>
        ))}
      </div>
    </div>
  );
}
