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
  const [hata, setHata] = useState<string | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const localUrlRef = useRef<string | null>(null);
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
    // iOS Safari webm SESİ çalamaz → desteklenen formatı seç (öncelik audio/mp4=AAC).
    const cands = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm"];
    const mime =
      typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported
        ? cands.find((c) => MediaRecorder.isTypeSupported(c)) || ""
        : "";
    const rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
    chunksRef.current = [];
    rec.ondataavailable = (e) => chunksRef.current.push(e.data);
    rec.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(chunksRef.current, { type: mime || "audio/webm" });
      // Anında yerel önizleme — kullanıcı kendi sesini hemen dinleyip tekrar oynatabilir
      // (yükleme/bucket erişiminden bağımsız, güvenli).
      if (localUrlRef.current) URL.revokeObjectURL(localUrlRef.current);
      const localUrl = URL.createObjectURL(blob);
      localUrlRef.current = localUrl;
      setVoiceUrl(localUrl);
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
    setHata(null);
    // RLS: 'media' kovasında ilk klasör auth.uid() olmalı (s_media_write politikası).
    // Önceki 'voice/...' yolu bu yüzden reddediliyordu → ses kartı hiç kaydedilmiyordu.
    const mime = blob.type || "audio/webm";
    const ext = mime.includes("mp4") ? "m4a" : mime.includes("ogg") ? "ogg" : "webm";
    const path = `${userId}/voice-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("media").upload(path, blob, {
      contentType: mime,
      upsert: true,
    });
    if (!error) {
      await supabase.from("profiles").update({ voice_card_path: path }).eq("id", userId);
      // Yerel önizlemeyi koru (anında çalar); kayıtlı yol DB'de — diğerleri remote'tan dinler.
    } else {
      setHata("Ses yüklenemedi ama önizlemeyi dinleyebilirsin. Tekrar dene.");
    }
    setBusy(false);
  }

  async function sil() {
    await supabase.from("profiles").update({ voice_card_path: null }).eq("id", userId);
    if (localUrlRef.current) {
      URL.revokeObjectURL(localUrlRef.current);
      localUrlRef.current = null;
    }
    setVoiceUrl(null);
    setHata(null);
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
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <audio controls src={voiceUrl} className="flex-1" preload="metadata" />
              <button onClick={sil} aria-label="Sesi sil" className="rounded-2xl border border-border p-2.5 text-muted">
                <Trash2 size={18} />
              </button>
            </div>
            <p className="text-xs text-muted">
              {busy ? "Kaydediliyor…" : hata ? hata : "Kendi sesini dinle. Beğenmediysen sil ve tekrar kaydet."}
            </p>
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
