"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Bir MediaStream'in canlı ses seviyesini (0..1) döndürür — AnalyserNode + rAF.
 * Konuşma animasyonu ve "konuşuyor" göstergesi için. Element oynatmayı engellemez.
 */
export function useAudioLevel(stream: MediaStream | null): number {
  const [level, setLevel] = useState(0);
  const lvlRef = useRef(0);

  useEffect(() => {
    if (!stream || stream.getAudioTracks().length === 0) {
      setLevel(0);
      return;
    }
    let ac: AudioContext | null = null;
    let raf = 0;
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      ac = new AC();
      const src = ac.createMediaStreamSource(stream);
      const analyser = ac.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.75;
      src.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += data[i];
        const avg = sum / data.length / 255;
        // hafif yumuşatma + ölçek
        const next = lvlRef.current * 0.55 + Math.min(1, avg * 1.8) * 0.45;
        lvlRef.current = next;
        setLevel(next);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    } catch {
      /* yoksay */
    }
    return () => {
      cancelAnimationFrame(raf);
      try {
        ac?.close();
      } catch {
        /* yoksay */
      }
    };
  }, [stream]);

  return level;
}

/** Ses seviyesine göre hareket eden ince barlar (currentColor). */
export function SpeakingBars({
  level,
  className = "",
  bars = 5,
  max = 22,
}: {
  level: number;
  className?: string;
  bars?: number;
  max?: number;
}) {
  const mid = (bars - 1) / 2;
  return (
    <div className={`flex items-center gap-[3px] ${className}`} aria-hidden>
      {Array.from({ length: bars }).map((_, i) => {
        const weight = 1 - Math.abs(i - mid) * (0.5 / mid || 0);
        const h = Math.max(3, Math.min(1, level * (0.6 + weight)) * max);
        return (
          <span
            key={i}
            style={{ height: `${h}px` }}
            className="w-[3px] rounded-full bg-current transition-[height] duration-75"
          />
        );
      })}
    </div>
  );
}
