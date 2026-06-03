"use client";

import { useEffect, useState } from "react";
import { Heart, MessageCircle, Sparkles } from "lucide-react";

const STEPS = [
  {
    icon: Sparkles,
    title: "Önce ruh, sonra yüz",
    text: "Fotoğraflar başta bulanık. Önce kişiliği, ilgi alanlarını ve ahenk uyumunu keşfedersin.",
  },
  {
    icon: Heart,
    title: "Beğen veya Süper Beğen",
    text: "İlgini göster. Karşı taraf da seni beğenirse eşleşirsiniz. Süper beğeni daha çok dikkat çeker.",
  },
  {
    icon: MessageCircle,
    title: "Sohbet aç, foto netleşsin",
    text: "Eşleşince mesajlaşmaya başla. Sohbet ilerledikçe fotoğraf yavaşça netleşir.",
  },
];

export default function WelcomeTour() {
  const [i, setI] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem("ahenk_tour_v1")) setShow(true);
    } catch {}
  }, []);

  function kapat() {
    try {
      localStorage.setItem("ahenk_tour_v1", "1");
    } catch {}
    setShow(false);
  }

  if (!show) return null;
  const s = STEPS[i];
  const son = i === STEPS.length - 1;

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
      <div className="animate-scale-in w-full max-w-sm rounded-3xl border border-border bg-surface p-6 text-center shadow-float">
        <div className="brand-gradient mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl text-white">
          <s.icon size={28} />
        </div>
        <h3 className="text-xl font-bold">{s.title}</h3>
        <p className="mt-2 text-sm text-muted">{s.text}</p>

        <div className="my-5 flex justify-center gap-1.5">
          {STEPS.map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 rounded-full transition-all ${idx === i ? "w-5 bg-brand" : "w-1.5 bg-border"}`}
            />
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={kapat}
            className="flex-1 rounded-full border border-border py-2.5 text-sm font-medium text-muted"
          >
            Atla
          </button>
          <button
            onClick={() => (son ? kapat() : setI(i + 1))}
            className="brand-gradient flex-1 rounded-full py-2.5 text-sm font-semibold text-white"
          >
            {son ? "Başla 🚀" : "İleri"}
          </button>
        </div>
      </div>
    </div>
  );
}
