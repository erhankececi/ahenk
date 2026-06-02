"use client";

import { useRef, useState } from "react";
import { Mic, Square, Trash2 } from "lucide-react";
import { VIBES } from "@/lib/vibes";
import { createClient } from "@/lib/supabase/client";

const MEDIA_URL = (path: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${path}`;

export default function VibeVoiceCard({
  userId,
  initialVibe,
  initialVoicePath,
}: {
  userId: string;
  initialVibe?: string | null;
  initialVoicePath?: string | null;
}) {
  const [vibe, setVibe] = useState<string | null>(initialVibe || null);
  const [voiceUrl, setVoiceUrl] = useState<string | null>(
    initialVoicePath ? MEDIA_URL(initialVoicePath) : null
  );
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const supabase = createClient();

  async function secVibe(id: string) {
    const next = vibe === id ? null : id;
    setVibe(next);
    await fetch("/api/vibe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vibe: next }),
    });
  }

  async function kaydetBasla() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const rec = new MediaRecorder(stream);
    chunksRef.current = [];
    rec.ondataavailable = (e) => chunksRef.current.push(e.data);
    rec.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      await yukle(blob);
    };
    rec.start();
    recRef.current = rec;
    setRecording(true);
    // 30 sn sonra otomatik dur
    setTimeout(() => {
      if (recRef.current?.state === "recording") recRef.current.stop();
      setRecording(false);
    }, 30000);
  }

  function kaydetDur() {
    recRef.current?.stop();
    setRecording(false);
  }

  async function yukle(blob: Blob) {
    setBusy(true);
    const path = `voice/${userId}-${Date.now()}.webm`;
    const { error } = await supabase.storage.from("media").upload(path, blob, {
      contentType: "audio/webm",
      upsert: true,
    });
    if (!error) {
      await supabase.from("profiles").update({ voice_card_path: path }).eq("id", userId);
      setVoiceUrl(MEDIA_URL(path));
    }
    setBusy(false);
  }

  async function sil() {
    await supabase.from("profiles").update({ voice_card_path: null }).eq("id", userId);
    setVoiceUrl(null);
  }

  return (
    <div className="mb-6 space-y-5">
      <div>
        <p className="mb-2 text-sm font-medium text-muted">Bugünkü modun</p>
        <div className="flex flex-wrap gap-2">
          {VIBES.map((v) => (
            <button
              key={v.id}
              onClick={() => secVibe(v.id)}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                vibe === v.id
                  ? "brand-gradient border-transparent text-white"
                  : "border-border text-muted hover:text-text"
              }`}
            >
              {v.emoji} {v.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-muted">Sesli tanıtım kartı (30 sn)</p>
        {voiceUrl ? (
          <div className="flex items-center gap-2">
            <audio controls src={voiceUrl} className="flex-1" preload="none" />
            <button onClick={sil} className="rounded-2xl border border-border p-2.5 text-muted">
              <Trash2 size={18} />
            </button>
          </div>
        ) : recording ? (
          <button
            onClick={kaydetDur}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-2/20 py-3 font-medium text-brand-2"
          >
            <Square size={18} /> Kaydı durdur
          </button>
        ) : (
          <button
            onClick={kaydetBasla}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border py-3 font-medium disabled:opacity-50"
          >
            <Mic size={18} className="text-brand" /> {busy ? "Yükleniyor…" : "Ses kaydet"}
          </button>
        )}
      </div>
    </div>
  );
}
