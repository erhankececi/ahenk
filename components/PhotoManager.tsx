"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, Loader2 } from "lucide-react";

type Photo = {
  id: string;
  path: string;
  preview_path: string | null;
  position: number;
  url: string | null;
};

export default function PhotoManager({ userId, initial }: { userId: string; initial: Photo[] }) {
  const supabase = createClient();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const photos = [...initial].sort((a, b) => a.position - b.position);
  const mainId = photos[0]?.id;

  // Orijinali ifşa etmeyen küçük + bulanık public önizleme (keşifte gösterilir).
  async function blurOnizleme(file: File): Promise<Blob | null> {
    try {
      const bitmap = await createImageBitmap(file);
      const W = 32;
      const H = Math.max(1, Math.round((bitmap.height / bitmap.width) * W));
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.filter = "blur(2px)";
      ctx.drawImage(bitmap, 0, 0, W, H);
      return await new Promise((res) => canvas.toBlob((b) => res(b), "image/jpeg", 0.5));
    } catch {
      return null;
    }
  }

  async function ekle(file: File) {
    if (busy) return;
    if (!file.type.startsWith("image/")) {
      setMsg("Lütfen bir fotoğraf seç.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setMsg("Fotoğraf 8MB'den küçük olmalı.");
      return;
    }
    if (photos.length >= 6) {
      setMsg("En fazla 6 fotoğraf ekleyebilirsin.");
      return;
    }
    setBusy(true);
    setMsg("Yükleniyor…");
    try {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const base = crypto.randomUUID();
      const path = `${userId}/${base}.${ext}`;
      const { error: upErr } = await supabase.storage.from("photos").upload(path, file);
      if (upErr) {
        setMsg("Yükleme başarısız, tekrar dene.");
        return;
      }
      let preview_path: string | null = null;
      const prev = await blurOnizleme(file);
      if (prev) {
        const pPath = `${userId}/${base}.jpg`;
        const { error: pErr } = await supabase.storage
          .from("previews")
          .upload(pPath, prev, { contentType: "image/jpeg" });
        if (!pErr) preview_path = pPath;
      }
      const nextPos = (photos[photos.length - 1]?.position ?? -1) + 1;
      const { error: insErr } = await supabase
        .from("photos")
        .insert({ user_id: userId, path, preview_path, position: nextPos });
      if (insErr) {
        setMsg("Kaydedilemedi, tekrar dene.");
        return;
      }
      setMsg("Fotoğraf eklendi ✓");
      router.refresh();
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function anaYap(ph: Photo) {
    if (busy || ph.id === mainId) return;
    setBusy(true);
    setMsg("");
    // En düşük pozisyon = ana foto. Seçileni en başa al.
    const { error } = await supabase
      .from("photos")
      .update({ position: photos[0].position - 1 })
      .eq("id", ph.id);
    setBusy(false);
    if (error) {
      setMsg("Güncellenemedi, tekrar dene.");
      return;
    }
    setMsg("Ana fotoğraf güncellendi ✓");
    router.refresh();
  }

  async function sil(ph: Photo) {
    if (busy) return;
    if (!confirm("Bu fotoğrafı silmek istediğine emin misin?")) return;
    setBusy(true);
    setMsg("");
    await supabase.storage.from("photos").remove([ph.path]);
    if (ph.preview_path) await supabase.storage.from("previews").remove([ph.preview_path]);
    const { error } = await supabase.from("photos").delete().eq("id", ph.id);
    setBusy(false);
    if (error) {
      setMsg("Silinemedi, tekrar dene.");
      return;
    }
    setMsg("Fotoğraf silindi");
    router.refresh();
  }

  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between">
        <p className="t-h4">Fotoğraflar</p>
        <span className="text-xs text-muted">{photos.length}/6</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {photos.map((ph) => (
          <div key={ph.id} className="relative aspect-square overflow-hidden rounded-2xl bg-elevated">
            {ph.url && <img src={ph.url} className="h-full w-full object-cover" alt="" />}
            {ph.id === mainId && (
              <span className="absolute left-1.5 top-1.5 rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold text-white">
                Ana
              </span>
            )}
            <button
              onClick={() => sil(ph)}
              disabled={busy}
              aria-label="Sil"
              className="absolute right-1.5 top-1.5 rounded-full bg-black/55 p-1.5 text-white transition disabled:opacity-50"
            >
              <Trash2 size={13} />
            </button>
            {ph.id !== mainId && (
              <button
                onClick={() => anaYap(ph)}
                disabled={busy}
                className="absolute inset-x-1.5 bottom-1.5 rounded-full bg-black/55 py-1 text-[10px] font-medium text-white transition disabled:opacity-50"
              >
                Ana yap
              </button>
            )}
          </div>
        ))}

        {photos.length < 6 && (
          <button
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            aria-label="Fotoğraf ekle"
            className="flex aspect-square items-center justify-center rounded-2xl border border-dashed border-border text-muted transition hover:border-brand disabled:opacity-50"
          >
            {busy ? <Loader2 className="animate-spin" size={20} /> : <Plus size={22} />}
          </button>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) ekle(f);
        }}
      />
      {msg && <p className="mt-2 text-xs text-muted">{msg}</p>}
    </div>
  );
}
