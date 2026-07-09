"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { X } from "lucide-react";
import Link from "next/link";
import RotateDeviceNotice from "./RotateDeviceNotice";
import VoiceControls from "./VoiceControls";
import ActionButtons from "./ActionButtons";
import HandSortControls from "./HandSortControls";
import GameToast from "./GameToast";
import MiniProfileOverlay from "./MiniProfileOverlay";
import OpenPreviewOverlay from "./OpenPreviewOverlay";
import OpenedMeldsArea from "./OpenedMeldsArea";
import { MOCK_PLAYERS } from "@/lib/game101/mockData";
import { useOkeyGame } from "@/lib/game101/useOkeyGame";
import { evaluatePairOpen, evaluateRunOpen, type OpenValidationResult } from "@/lib/game101/meldValidation";
import { getProcessableMelds } from "@/lib/game101/meldProcessing";

const TOAST_DURATION_MS = 2200;

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

  // roomId verilmezse (ör. /oyun/101/prototip akışı) hook'a sabit bir mock
  // roomId veriyoruz — böylece prototip akışının görünümü/davranışı bozulmaz,
  // ama artık gerçek (mock) state kullanılır.
  const {
    myHand,
    discardTile,
    drawPileCount,
    isMyTurn,
    selectedTileId,
    selectTile,
    drawTile,
    discardSelectedTile,
    sortHandByColor,
    sortHandByValue,
    sortHandByPairs,
    compactMyHand,
    lastAction,
    turnStartedAt,
    turnDurationSec,
    indicatorTile,
    okeyColor,
    okeyValue,
    openedMelds,
    myOpenType,
    hasOpened,
    openMelds,
    processTileToMeld,
  } = useOkeyGame(roomId ?? "prototip", roomName);

  const handleSeatClick = useCallback((playerId: string) => {
    setSelectedPlayerId(playerId);
  }, []);

  // SERİ AÇ / ÇİFT AÇ önizleme paneli: yalnızca canOpen=true olduğunda
  // açılır, taş silme/BİTİR yapmaz — saf görsel önizleme (Görev 7, Faz 2).
  const [previewOverlay, setPreviewOverlay] = useState<
    { type: "run" | "pair"; result: OpenValidationResult } | null
  >(null);

  // Tek, paylaşılan toast state'i: hem ActionButtons'ın "kilitli hamle"
  // mesajları hem de HandSortControls'ın (hook'un lastAction'ı üzerinden)
  // dizme bildirimleri AYNI GameToast'ı kullanır — böylece iki ayrı toast
  // tetikleyicisi asla üst üste binmez, her zaman en sonuncusu gösterilir.
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = useCallback((message: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(message);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, TOAST_DURATION_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  // SERİ AÇ: önce sıra/karşı-tip/tekrar-açma guard'ları kontrol edilir; hiçbiri
  // engellemiyorsa myHand/okeyColor/okeyValue üzerinden evaluateRunOpen
  // çalıştırılır. canOpen=true ise önizleme panelini açar, false ise yalnızca
  // toast gösterir (Görev 7 akışı — burada dokunulmadı).
  const handleOpenRun = useCallback(() => {
    if (!isMyTurn) {
      notify("Sadece kendi sıranda açabilirsin.");
      return;
    }
    if (myOpenType === "pair") {
      notify("Çift açtığın için seri açamazsın.");
      return;
    }
    if (myOpenType === "run") {
      notify("Seri zaten açıldı.");
      return;
    }

    const result = evaluateRunOpen(myHand, okeyColor, okeyValue);
    if (result.canOpen) {
      notify(`Seri açılabilir: toplam ${result.totalScore} puan`);
      setPreviewOverlay({ type: "run", result });
    } else {
      notify(`Seri açmak için en az 101 puan gerekir. Şu an: ${result.totalScore}`);
    }
  }, [isMyTurn, myHand, myOpenType, notify, okeyColor, okeyValue]);

  // ÇİFT AÇ: aynı guard deseni (sıra/karşı-tip/tekrar-açma), ardından
  // myHand/okeyColor/okeyValue üzerinden evaluatePairOpen çalıştırılır.
  const handleOpenPair = useCallback(() => {
    if (!isMyTurn) {
      notify("Sadece kendi sıranda açabilirsin.");
      return;
    }
    if (myOpenType === "run") {
      notify("Seri açtığın için çift açamazsın.");
      return;
    }
    if (myOpenType === "pair") {
      notify("Çift zaten açıldı.");
      return;
    }

    const result = evaluatePairOpen(myHand, okeyColor, okeyValue);
    if (result.canOpen) {
      notify(`Çift açılabilir: ${result.totalScore} çift bulundu`);
      setPreviewOverlay({ type: "pair", result });
    } else {
      notify(`Çift açmak için en az 5 çift gerekir. Şu an: ${result.totalScore} çift`);
    }
  }, [isMyTurn, myHand, myOpenType, notify, okeyColor, okeyValue]);

  // ONAYLA VE AÇ: önizlemedeki meld'leri gerçekten elden çıkarıp masaya
  // açar (openMelds), önizleme panelini kapatır ve kısa bir onay toast'ı
  // gösterir. previewOverlay null ise no-op.
  const handleConfirmOpen = useCallback(() => {
    if (!previewOverlay) return;
    openMelds(previewOverlay.result.melds, previewOverlay.type);
    setPreviewOverlay(null);
    notify(previewOverlay.type === "run" ? "Seri masaya açıldı." : "Çiftler masaya açıldı.");
  }, [notify, openMelds, previewOverlay]);

  // Görev 9 (Faz 2): seçili taşın gerçek OkeyGameTile nesnesi + bu taşın
  // işlenebileceği açık meld'ler. selectedTileId elde artık yoksa (ör. az
  // önce atıldıysa) selectedTile null olur, processableMelds boş kalır.
  const selectedTile = useMemo(
    () => myHand.find((t) => t.id === selectedTileId) ?? null,
    [myHand, selectedTileId],
  );

  const processableMelds = useMemo(
    () => (selectedTile ? getProcessableMelds(selectedTile, openedMelds, okeyColor, okeyValue) : []),
    [selectedTile, openedMelds, okeyColor, okeyValue],
  );

  const processableMeldIds = useMemo(() => processableMelds.map((m) => m.id), [processableMelds]);

  // Bir meld kartına doğrudan tıklanınca (OpenedMeldsArea'dan) çağrılır.
  const handleMeldClick = useCallback(
    (meldId: string) => {
      if (!isMyTurn) {
        notify("Sıra sende değil.");
        return;
      }
      if (!hasOpened) {
        notify("İşleme yapmak için önce açmalısın.");
        return;
      }
      if (!selectedTileId || !selectedTile) {
        notify("İşlemek için önce elinden bir taş seç.");
        return;
      }
      if (!processableMeldIds.includes(meldId)) {
        notify("Bu taş seçili gruba işlenemez.");
        return;
      }
      processTileToMeld(selectedTileId, meldId);
      notify("Taş işlendi.");
    },
    [isMyTurn, hasOpened, selectedTileId, selectedTile, processableMeldIds, processTileToMeld, notify],
  );

  // "İŞLE" butonuna basınca (ActionButtons) çağrılır.
  const handleProcessButtonClick = useCallback(() => {
    if (!isMyTurn) {
      notify("Sıra sende değil.");
      return;
    }
    if (!hasOpened) {
      notify("İşleme yapmak için önce açmalısın.");
      return;
    }
    if (!selectedTileId) {
      notify("İşlemek için önce taş seç.");
      return;
    }
    if (processableMeldIds.length === 0) {
      notify("Bu taş mevcut gruplara işlenemez.");
      return;
    }
    if (processableMeldIds.length === 1) {
      processTileToMeld(selectedTileId, processableMeldIds[0]);
      notify("Taş işlendi.");
      return;
    }
    notify("Birden fazla grup uygun, işlemek istediğin grubu seç.");
  }, [isMyTurn, hasOpened, selectedTileId, processableMeldIds, processTileToMeld, notify]);

  // El dizme butonlarına basınca hook, state.lastAction'ı Türkçe bir
  // açıklamayla günceller (ör. "El renklerine göre dizildi.") — burada o
  // değişimi izleyip paylaşılan toast'a yansıtıyoruz. Yalnızca dizme
  // aksiyonlarının mesajlarını yakalamak için basit bir metin filtresi
  // kullanılır (taş çekme/atma/rakip mesajları burada tekrar toast'a
  // dönüştürülmez — onlar zaten ayrı görsel geri bildirimlere sahip).
  const sortActionMessages = useRef(
    new Set([
      "El renklerine göre dizildi.",
      "El sayılara göre dizildi.",
      "Çiftler öne alındı.",
      "Boşluklar temizlendi.",
      "El düzenlendi.",
    ]),
  );
  useEffect(() => {
    if (lastAction && sortActionMessages.current.has(lastAction)) {
      notify(lastAction);
    }
    // notify değişmez (useCallback, boş dep) — yalnızca lastAction izlenir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastAction]);

  const selectedPlayer = selectedPlayerId
    ? MOCK_PLAYERS.find((p) => p.id === selectedPlayerId) ?? null
    : null;

  // Turn timer: her ~1sn'de bir kalan süreyi hesaplayan local state.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const remainingSec = useMemo(() => {
    if (turnStartedAt === null) return turnDurationSec;
    const elapsed = (now - turnStartedAt) / 1000;
    return Math.max(0, Math.ceil(turnDurationSec - elapsed));
  }, [now, turnStartedAt, turnDurationSec]);

  const timerProgress = turnDurationSec > 0 ? remainingSec / turnDurationSec : 0;

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
            myHand={myHand}
            discardTile={discardTile}
            drawPileCount={drawPileCount}
            isMyTurn={isMyTurn}
            selectedTileId={selectedTileId}
            onSelectTile={selectTile}
            indicatorTile={indicatorTile}
            okeyColor={okeyColor}
            okeyValue={okeyValue}
          />

          {/* Sıra süresi göstergesi: 30 saniyelik dairesel geri sayım (DOM overlay). */}
          <TurnTimerRing remainingSec={remainingSec} progress={timerProgress} isMyTurn={isMyTurn} />

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

          {/* Sağ-alt aksiyon butonları (TAŞ ÇEK / TAŞ AT / SERİ AÇ / ÇİFT AÇ / BİTİR). */}
          <ActionButtons
            onDraw={drawTile}
            onDiscard={discardSelectedTile}
            canDiscard={selectedTileId !== null}
            onNotify={notify}
            onOpenRun={handleOpenRun}
            onOpenPair={handleOpenPair}
            onProcess={handleProcessButtonClick}
          />

          {/* Sol-alt el dizme kısayolları (RENK DİZ / SAYI DİZ / ÇİFT DİZ / ELİ TOPLA) — ıstakanın hemen üstünde, ActionButtons ile çakışmaz. */}
          <HandSortControls
            onSortColor={sortHandByColor}
            onSortValue={sortHandByValue}
            onSortPairs={sortHandByPairs}
            onCompact={compactMyHand}
          />

          {/* Paylaşılan tek toast — hem ActionButtons hem HandSortControls buraya bildirir. */}
          <GameToast message={toastMessage} />

          {/* Mini profil kartı: bir koltuğa tıklanınca beliren avatar/isim/bio/etiket kartı. */}
          {selectedPlayer ? (
            <MiniProfileOverlay
              player={selectedPlayer}
              onClose={() => setSelectedPlayerId(null)}
            />
          ) : null}

          {/* SERİ AÇ / ÇİFT AÇ önizleme paneli — yalnızca canOpen=true iken açılır.
              hasOpened=true olduktan sonra guard'lar sayesinde bu panel bir daha
              hiç açılmaz, bu yüzden OpenedMeldsArea ile aynı üst-orta bölgeyi
              zamansal çakışma olmadan paylaşabilir. */}
          {previewOverlay ? (
            <OpenPreviewOverlay
              type={previewOverlay.type}
              result={previewOverlay.result}
              onClose={() => setPreviewOverlay(null)}
              onConfirm={handleConfirmOpen}
            />
          ) : null}

          {/* Masaya açılmış seri/çiftlerim — açtıktan sonra kalıcı olarak görünür. */}
          <OpenedMeldsArea
            melds={openedMelds}
            openType={myOpenType}
            processableMeldIds={processableMeldIds}
            onMeldClick={handleMeldClick}
          />
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

interface TurnTimerRingProps {
  remainingSec: number;
  /** 1 (süre yeni başladı) -> 0 (süre doldu). */
  progress: number;
  isMyTurn: boolean;
}

/**
 * Sıra süresi için basit dairesel geri sayım — Pixi'ye ihtiyaç yok, DOM/SVG
 * overlay. Sol üstte, oda etiketinin altında/yanında görünür.
 */
function TurnTimerRing({ remainingSec, progress, isMyTurn }: TurnTimerRingProps) {
  const size = 44;
  const strokeWidth = 3.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const dashOffset = circumference * (1 - clampedProgress);

  return (
    <div className="pointer-events-none absolute left-3 bottom-3 z-10 sm:left-4 sm:bottom-4">
      <div className="relative flex h-11 w-11 items-center justify-center">
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="rgba(0,0,0,0.4)"
            stroke="rgba(199,169,119,0.25)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={isMyTurn ? "#c7a977" : "rgba(199,169,119,0.45)"}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <span className="absolute text-[11px] font-bold tabular-nums text-brand-2">
          {remainingSec}
        </span>
      </div>
    </div>
  );
}
