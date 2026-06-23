"use client";

import { useState } from "react";
import { GlassCard, Button, Avatar } from "@/components/ui";
import { SUBJECTS } from "@/lib/mock";
import { Camera, Send, Zap, BookOpen, FlaskConical, Landmark, Globe } from "lucide-react";

const DERS = [
  { name: "Matematik", icon: BookOpen },
  { name: "Fen Bilimleri", icon: FlaskConical },
  { name: "Edebiyat", icon: Landmark },
  { name: "Tarih", icon: Globe },
];
const TEACHERS = ["Uygun Biri", "Dr. Smith", "Ms. Davis"];

export default function AskQuestion() {
  const [ders, setDers] = useState("");
  const [teacher, setTeacher] = useState("Uygun Biri");
  const [priority, setPriority] = useState(false);

  return (
    <div className="space-y-5 pb-4">
      <div>
        <h1 className="text-2xl font-bold">Soru Sor</h1>
        <p className="mt-1 text-sm text-muted">Probleminizi yükleyin ve uzman öğretmenlerden yardım alın.</p>
      </div>

      {/* 1. Fotoğraf */}
      <GlassCard className="p-5">
        <Stepno n={1} title="Soru Fotoğrafı Yükle" />
        <button className="mt-4 flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line py-10 text-muted transition hover:border-primary/50 hover:text-primary">
          <Camera size={28} />
          <span className="text-sm">Fotoğraf çekmek veya yüklemek için dokun</span>
        </button>
      </GlassCard>

      {/* 2. Ders */}
      <GlassCard className="p-5">
        <Stepno n={2} title="Ders Seç" />
        <div className="mt-4 grid grid-cols-2 gap-3">
          {DERS.map((d) => (
            <button
              key={d.name}
              onClick={() => setDers(d.name)}
              className={`flex items-center gap-2.5 rounded-xl border px-4 py-3.5 font-semibold transition ${ders === d.name ? "border-primary bg-primary/10 text-primary" : "border-line bg-surface text-text hover:border-white/20"}`}
            >
              <d.icon size={18} /> {d.name}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* 3. Öğretmen */}
      <GlassCard className="p-5">
        <Stepno n={3} title="Öğretmen Seç" sub="(İsteğe Bağlı)" />
        <div className="mt-4 flex justify-around">
          {TEACHERS.map((t) => (
            <button key={t} onClick={() => setTeacher(t)} className="flex flex-col items-center gap-1.5">
              <span className={`rounded-full p-0.5 transition ${teacher === t ? "ring-2 ring-primary" : "ring-1 ring-line"}`}>
                <Avatar name={t} size={48} color={t === "Uygun Biri" ? "#00E5FF" : "#B6C4FF"} />
              </span>
              <span className={`text-xs ${teacher === t ? "text-primary" : "text-muted"}`}>{t}</span>
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Öncelikli */}
      <GlassCard className="gold-card flex items-center gap-4 p-5">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold"><Zap size={20} /></span>
        <div className="flex-1">
          <p className="font-bold text-premium">Öncelikli Cevap</p>
          <p className="text-xs text-muted">Cevabını 5 dakikada kısa sürede al. <span className="font-semibold text-gold">- 50 Jeton</span></p>
        </div>
        <button
          onClick={() => setPriority((p) => !p)}
          className={`relative h-7 w-12 shrink-0 rounded-full transition ${priority ? "bg-gold" : "bg-white/10"}`}
          aria-pressed={priority}
        >
          <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${priority ? "left-6" : "left-1"}`} />
        </button>
      </GlassCard>

      <Button size="lg" className="w-full"><Send size={18} /> Soruyu Gönder</Button>
    </div>
  );
}

function Stepno({ n, title, sub }: { n: number; title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-primary/40 text-sm font-bold text-primary">{n}</span>
      <h3 className="font-bold">{title} {sub && <span className="text-xs font-normal text-muted">{sub}</span>}</h3>
    </div>
  );
}
