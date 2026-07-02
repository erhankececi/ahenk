"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { X } from "lucide-react";
import Link from "next/link";
import RotateDeviceNotice from "./RotateDeviceNotice";
import VoiceControls from "./VoiceControls";
import ActionButtons from "./ActionButtons";
import MiniProfileOverlay from "./MiniProfileOverlay";
import { MOCK_PLAYERS } from "@/lib/game101/mockData";

const GameCanvas = dynamic(() => import("./GameCanvas"), { ssr: false });

const ASPECT_W = 16;
const ASPECT_H = 9;
const DESIGN_W = 1280;
const DESIGN_H = 720;

export interface GameScreenProps {
  /** Oda kimliği (mock). Verilmezse etiket gösterilmez. */
  roomId?: string;
  /** Oda adı (mock) — sol üstte küçük bir etiket olarak gösterilir. */
  roomName?: string;
  /** Masa tipi (mock) — oda adı etiketinin altında küçük alt metin olarak gösterilir. */
  tableType?: string;
}

/**
 * Ana orkestratör: fullscreen/orientation isteği, 16:9 letterbox konteyner,
 * portrait'te RotateDeviceNotice, aksi halde GameCanvas + overlay mount
 * noktaları (ActionButtons/VoiceControls/MiniProfileOverlay — Overlay fazında
 * üzerine yazılacak, şimdilik inline placeholder).
 *
 * roomId/roomName/tableType tamamen opsiyoneldir: verilmezse davranış ve
 * görünüm /oyun/101/prototip ile birebir aynı kalır (etiket render edilmez).
 */
export default function GameScreen({ roomId, roomName, tableType }: GameScreenProps = {}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isPortrait, setIsPortrait] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [stageSize, setStageSize] = useState({ width: DESIGN_W, height: DESIGN_H });

  const handleSeatClick = useCallback((playerId: string) => {
    setSelectedPlayerId(playerId);
  }, []);

  const selectedPlayer = selectedPlayerId
    ? MOCK_PLAYERS.find((p) => p.id === selectedPlayerId) ?? null
    : null;

  // Fullscreen + orientation lock isteği (sessizce başarısız olabilir).
  useEffect(() => {
    const el = rootRef.current;
    (async () => {
      try {
        await el?.requestFullscreen?.();
      } catch {
        // Kullanıcı reddetti veya tarayıcı desteklemiyor — sessizce devam.
      }
      try {
        const orientation = window.screen?.orientation as unknown as
          | { lock?: (o: string) => Promise<void> }
          | undefined;
        await orientation?.lock?.("landscape");
      } catch {
        // iOS Safari / çoğu tarayıcı desteklemez — sessizce yut.
      }
    })();
  }, []);

  // Portrait tespiti — matchMedia + resize.
  useEffect(() => {
    const mq = window.matchMedia("(orientation: portrait)");
    const update = () => setIsPortrait(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    window.addEventListener("resize", update);
    return () => {
      mq.removeEventListener?.("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  // Letterbox: mevcut viewport'a sığan en büyük 16:9 alanı hesapla.
  // Resize sırasında Pixi'nin sürekli yeniden kurulmasını önlemek için
  // ölçüm rAF ile hafifçe throttle edilir.
  useEffect(() => {
    let rafId = 0;
    const compute = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let w = vw;
      let h = (w * ASPECT_H) / ASPECT_W;
      if (h > vh) {
        h = vh;
        w = (h * ASPECT_W) / ASPECT_H;
      }
      setStageSize({ width: Math.round(w), height: Math.round(h) });
    };
    const scheduleCompute = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener("resize", scheduleCompute);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", scheduleCompute);
    };
  }, []);

  return (
    <div ref={rootRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      {isPortrait ? (
        <RotateDeviceNotice isPortrait={isPortrait} />
      ) : (
        <div
          className="relative overflow-hidden"
          style={{ width: stageSize.width, height: stageSize.height }}
        >
          <GameCanvas
            width={stageSize.width}
            height={stageSize.height}
            onSeatClick={handleSeatClick}
          />

          {/* Sağ üst kontrol çemberleri: mikrofon/ses/sohbet/ayarlar + çıkış. */}
          <div className="pointer-events-auto absolute right-3 top-3 z-10 flex items-center gap-2">
            <VoiceControls />
            <Link href="/oyun">
              <IconCircle icon={<X size={16} />} />
            </Link>
          </div>

          {/* Sol üst oda etiketi: roomId verildiğinde (oda sayfası akışı) görünür — prototip akışında gösterilmez. */}
          {roomId ? (
            <div className="pointer-events-none absolute left-3 top-3 z-10 rounded-lg border border-brand/30 bg-black/40 px-3 py-1.5 backdrop-blur-sm">
              <p className="text-xs font-semibold leading-tight text-brand">
                {roomName ?? "Masa"}
              </p>
              {tableType ? (
                <p className="text-[10px] leading-tight text-white/60">{tableType}</p>
              ) : null}
            </div>
          ) : null}

          {/* Sağ-alt aksiyon butonları (TAŞ ÇEK / SERİ AÇ / ÇİFT AÇ / BİTİR). */}
          <ActionButtons />

          {/* Mini profil kartı: bir koltuğa tıklanınca beliren avatar/isim/bio/etiket kartı. */}
          {selectedPlayer ? (
            <MiniProfileOverlay
              player={selectedPlayer}
              onClose={() => setSelectedPlayerId(null)}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}

function IconCircle({ icon }: { icon: React.ReactNode }) {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-brand/30 bg-black/40 text-brand backdrop-blur-sm">
      {icon}
    </span>
  );
}
