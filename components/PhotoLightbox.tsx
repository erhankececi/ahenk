"use client";

import { useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Modern tam ekran fotoğraf galerisi: kaydırarak geçiş, çift dokunuş/çift tık
 * yakınlaştırma, yakınken sürükleyerek gezinme, aşağı kaydırarak kapatma.
 */
export default function PhotoLightbox({
  images,
  startIndex = 0,
  onClose,
}: {
  images: string[];
  startIndex?: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(startIndex);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const lastTap = useRef(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, zoom]);

  function reset() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }
  function next() {
    if (idx < images.length - 1) { setIdx(idx + 1); reset(); }
  }
  function prev() {
    if (idx > 0) { setIdx(idx - 1); reset(); }
  }

  function onPointerDown(e: React.PointerEvent) {
    drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    if (zoom > 1) setPan({ x: drag.current.px + dx, y: drag.current.py + dy });
  }
  function onPointerUp(e: React.PointerEvent) {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (zoom === 1) {
      if (dy > 90 && Math.abs(dx) < 60) return onClose(); // aşağı kaydır → kapat
      if (dx < -50) return next();
      if (dx > 50) return prev();
    }
  }
  function onClickImg() {
    const now = Date.now();
    if (now - lastTap.current < 280) {
      // çift dokunuş → yakınlaştır / sıfırla
      if (zoom === 1) setZoom(2.5);
      else reset();
    }
    lastTap.current = now;
  }

  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-black/95 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] text-white">
        <span className="text-sm text-white/70">{idx + 1} / {images.length}</span>
        <button onClick={onClose} aria-label="Kapat" className="rounded-full bg-white/10 p-2">
          <X size={20} />
        </button>
      </div>

      <div
        className="relative flex flex-1 touch-none select-none items-center justify-center overflow-hidden"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={onClickImg}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[idx]}
          alt={`Fotoğraf ${idx + 1}`}
          draggable={false}
          className="max-h-full max-w-full object-contain transition-transform duration-150"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
        />

        {idx > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            aria-label="Önceki"
            className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/10 p-2 text-white sm:block"
          >
            <ChevronLeft />
          </button>
        )}
        {idx < images.length - 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            aria-label="Sonraki"
            className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/10 p-2 text-white sm:block"
          >
            <ChevronRight />
          </button>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
          {images.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === idx ? "w-5 bg-white" : "w-1.5 bg-white/40"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
