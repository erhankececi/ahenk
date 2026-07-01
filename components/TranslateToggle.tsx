"use client";

import { useEffect, useState } from "react";
import { Languages } from "lucide-react";
import { useLang } from "@/components/LangProvider";

export default function TranslateToggle() {
  const { t } = useLang();
  const [on, setOn] = useState(false);
  useEffect(() => setOn(localStorage.getItem("ahenk_autotranslate") === "on"), []);

  function toggle() {
    const v = !on;
    setOn(v);
    localStorage.setItem("ahenk_autotranslate", v ? "on" : "off");
  }

  return (
    <button onClick={toggle} className="flex w-full items-center justify-between p-4">
      <span className="flex items-center gap-3 text-sm">
        <Languages size={18} className="text-muted" />
        {t.settings.autoTranslate}
      </span>
      <span className={`relative h-6 w-11 rounded-full transition ${on ? "bg-accent" : "bg-border"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}
