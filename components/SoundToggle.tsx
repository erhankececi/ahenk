"use client";

import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { isSoundOn, setSoundOn, playSound } from "@/lib/sound";

export default function SoundToggle() {
  const [on, setOn] = useState(true);
  useEffect(() => setOn(isSoundOn()), []);

  function toggle() {
    const v = !on;
    setOn(v);
    setSoundOn(v);
    if (v) playSound("message");
  }

  return (
    <button onClick={toggle} className="flex w-full items-center justify-between p-4">
      <span className="flex items-center gap-3 text-sm">
        {on ? <Volume2 size={18} className="text-muted" /> : <VolumeX size={18} className="text-muted" />}
        Uygulama sesleri
      </span>
      <span className={`relative h-6 w-11 rounded-full transition ${on ? "bg-brand" : "bg-border"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}
