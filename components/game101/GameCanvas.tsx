"use client";

import { useEffect, useRef } from "react";
import { Application, Container, FillGradient, Graphics, Text, TextStyle } from "pixi.js";
import { MOCK_PLAYERS } from "@/lib/game101/mockData";
import type { Tile as TileModel, TileColor } from "@/lib/game101/types";
import type { OkeyGameTile } from "@/lib/game101/gameTypes";
import { buildGameTable } from "./GameTable";
import { buildPlayerSeat } from "./PlayerSeat";
import { buildTileRack } from "./TileRack";
import { buildDrawPile } from "./DrawPile";
import { buildDiscardArea } from "./DiscardArea";

export interface GameCanvasProps {
  width: number;
  height: number;
  onSeatClick: (playerId: string) => void;
  /** Benim (bottom) elimdeki taşlar — useOkeyGame'den gelir. */
  myHand: OkeyGameTile[];
  /** Atılan taş yığınının en üstteki taşı. */
  discardTile: OkeyGameTile | null;
  /** Kapalı çekme destesinde kalan taş sayısı. */
  drawPileCount: number;
  /** Sıra bende mi? ("SIRA SENDE" / "RAKİP OYNUYOR" pill'i için). */
  isMyTurn: boolean;
  /** Şu an seçili taşın id'si (yoksa null). */
  selectedTileId: string | null;
  /** Istakada bir taşa tıklanınca çağrılır. */
  onSelectTile: (tileId: string) => void;
}

/** OkeyGameTile (gameTypes.ts) rengini eski Tile (types.ts) renk paletine eşler. */
const COLOR_MAP: Record<OkeyGameTile["color"], TileColor> = {
  red: "red",
  blue: "blue",
  black: "navy",
  yellow: "gold",
  joker: "gold",
};

/** useOkeyGame'in OkeyGameTile modelini Pixi tile bileşenlerinin beklediği Tile modeline çevirir. */
function toTileModel(tile: OkeyGameTile): TileModel {
  return {
    id: tile.id,
    value: tile.value,
    color: COLOR_MAP[tile.color],
    isJoker: !!tile.isOkey,
  };
}

/**
 * Pixi Application kurulumu — GameTable/PlayerSeat/TileRack/DrawPile/DiscardArea'yı
 * tek sahne grafiğinde koordine eder. PixiJS v8 API: async app.init, app.canvas,
 * Graphics fluent chain, FillGradient.
 */
export default function GameCanvas({
  width,
  height,
  onSeatClick,
  myHand,
  discardTile,
  drawPileCount,
  isMyTurn,
  selectedTileId,
  onSelectTile,
}: GameCanvasProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<Application | null>(null);
  const cleanupExtraRef = useRef<() => void>(() => {});
  // TileRack'in setSelected'ını dışarıdan (selectedTileId değişince tam rebuild
  // yapmadan) çağırabilmek için güncel referansı burada tutuyoruz.
  const rackSetSelectedRef = useRef<((id: string | null) => void) | null>(null);
  const turnPillSetLabelRef = useRef<((isMyTurn: boolean) => void) | null>(null);

  useEffect(() => {
    let destroyed = false;
    const app = new Application();
    appRef.current = app;

    (async () => {
      await app.init({
        width,
        height,
        backgroundAlpha: 0,
        antialias: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        autoDensity: true,
      });

      if (destroyed || !hostRef.current) {
        app.destroy(true, { children: true });
        return;
      }
      hostRef.current.appendChild(app.canvas);

      const myTiles = myHand.map(toTileModel);
      const discard = discardTile ? toTileModel(discardTile) : null;
      const players = MOCK_PLAYERS;
      const root = new Container();
      app.stage.addChild(root);

      // 1) Masa zemini.
      const table = buildGameTable(width, height);
      root.addChild(table);

      const cx = width / 2;
      const cy = height / 2;

      // 2) Rakip koltukları (top/left/right) + kendi koltuk göstergesi.
      const seatSetters: Record<string, (active: boolean) => void> = {};

      const topPlayer = players.find((p) => p.seat === "top")!;
      const leftPlayer = players.find((p) => p.seat === "left")!;
      const rightPlayer = players.find((p) => p.seat === "right")!;
      const mePlayer = players.find((p) => p.seat === "bottom")!;

      const topSeat = buildPlayerSeat(topPlayer, "horizontal", onSeatClick);
      topSeat.container.position.set(cx, height * 0.115);
      root.addChild(topSeat.container);
      seatSetters[topPlayer.id] = topSeat.setActive;

      const leftSeat = buildPlayerSeat(leftPlayer, "vertical", onSeatClick);
      leftSeat.container.position.set(width * 0.1, cy);
      root.addChild(leftSeat.container);
      seatSetters[leftPlayer.id] = leftSeat.setActive;

      const rightSeat = buildPlayerSeat(rightPlayer, "vertical", onSeatClick);
      rightSeat.container.position.set(width * 0.9, cy);
      root.addChild(rightSeat.container);
      seatSetters[rightPlayer.id] = rightSeat.setActive;

      // Kendi avatarımız (küçük, ıstakanın hemen üstünde sol tarafta).
      const meSeat = buildPlayerSeat(mePlayer, "horizontal", onSeatClick);
      meSeat.container.position.set(width * 0.11, height * 0.86);
      meSeat.container.scale.set(0.85);
      root.addChild(meSeat.container);
      seatSetters[mePlayer.id] = meSeat.setActive;

      // 3) Merkez: kapalı deste (sol-orta) + açık discard (sağ-orta) + SIRA SENDE pill.
      const drawPile = buildDrawPile(drawPileCount);
      drawPile.position.set(cx - 70, cy + 6);
      root.addChild(drawPile);

      const discardArea = buildDiscardArea(discard);
      discardArea.position.set(cx + 70, cy + 6);
      root.addChild(discardArea);

      const turnPill = buildTurnPill(isMyTurn);
      turnPill.container.position.set(cx, cy - height * 0.09);
      root.addChild(turnPill.container);
      turnPillSetLabelRef.current = turnPill.setIsMyTurn;

      // 4) Alt kullanıcı ıstakası (2 sıra, sürükle-bırak).
      const rack = buildTileRack(myTiles, app.ticker, onSelectTile);
      rack.container.position.set(cx, height * 0.985 - rackHalfHeight());
      root.addChild(rack.container);
      rack.setSelected(selectedTileId);
      rackSetSelectedRef.current = rack.setSelected;

      // Aktif sırayı görsel olarak yansıt: sıra bendeyse kendi koltuğum
      // vurgulanır; rakipteyse (hangi rakip olduğu bu fazda ayrıntılı takip
      // edilmiyor) hiçbir rakip koltuğu özel olarak vurgulanmaz.
      Object.entries(seatSetters).forEach(([id, setActive]) => {
        setActive(isMyTurn && id === mePlayer.id);
      });

      cleanupExtraRef.current = () => {
        rack.destroy();
        rackSetSelectedRef.current = null;
        turnPillSetLabelRef.current = null;
      };
    })();

    return () => {
      destroyed = true;
      cleanupExtraRef.current();
      cleanupExtraRef.current = () => {};
      const current = appRef.current;
      if (current) {
        try {
          current.destroy(true, { children: true });
        } catch {
          // init tamamlanmadan unmount olduysa destroy güvenle yutulur.
        }
      }
      appRef.current = null;
      if (hostRef.current) {
        hostRef.current.innerHTML = "";
      }
    };
    // width/height değiştiğinde (letterbox yeniden hesaplandığında) VEYA oyun
    // state'i (el/discard/deste/sıra) değiştiğinde sahneyi sıfırdan kur — bu
    // fazda (mock/prototip) kabul edilebilir, aksi halde dış konteyner
    // büyüdükçe içerik köşede küçük kalır. selectedTileId ve onSelectTile
    // BİLEREK dependency array'de YOK: seçim değişince (veya sürükleme
    // sırasında) sahne asla yeniden kurulmaz — bkz. aşağıdaki ayrı effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height, onSeatClick, myHand, discardTile, drawPileCount, isMyTurn]);

  // selectedTileId değişince TAM rebuild yapmadan yalnızca ıstakadaki taşın
  // kendi setSelected'ını çağırır (TileRack zaten bunu destekliyor).
  useEffect(() => {
    rackSetSelectedRef.current?.(selectedTileId);
  }, [selectedTileId]);

  // isMyTurn değiştiğinde pill metnini rebuild olmadan güncellemek de
  // mümkün, ama pill zaten yukarıdaki rebuild bağımlılığında — bu effect
  // yalnızca aynı render içinde ilk kurulumdan hemen sonra senkron kalmasını
  // garanti eder (guard: turnPillSetLabelRef henüz set edilmemiş olabilir).
  useEffect(() => {
    turnPillSetLabelRef.current?.(isMyTurn);
  }, [isMyTurn]);

  return <div ref={hostRef} className="absolute inset-0" />;
}

function rackHalfHeight() {
  const rows = 2;
  const tileH = 88;
  const gapY = 10;
  const pad = 14;
  return (rows * (tileH + gapY) - gapY + pad * 2) / 2;
}

interface BuiltTurnPill {
  container: Container;
  setIsMyTurn: (isMyTurn: boolean) => void;
}

/**
 * Sıra göstergesi pill/badge — masa üstünde ortada. Sıra bendeyse "SIRA
 * SENDE", değilse "RAKİP OYNUYOR" gösterir. setIsMyTurn ile metin rebuild
 * olmadan güncellenebilir (genişlik/arka plan da yeniden hesaplanır).
 */
function buildTurnPill(isMyTurn: boolean): BuiltTurnPill {
  const container = new Container();
  const label = new Text({
    text: isMyTurn ? "SIRA SENDE" : "RAKİP OYNUYOR",
    style: new TextStyle({
      fontFamily: "Manrope, Inter, system-ui, sans-serif",
      fontSize: 15,
      fontWeight: "800",
      fill: 0xf3ead4,
      letterSpacing: 2,
    }),
  });
  label.anchor.set(0.5);

  const bg = new Graphics();
  const innerGlow = new Graphics();

  const redraw = (myTurn: boolean) => {
    label.text = myTurn ? "SIRA SENDE" : "RAKİP OYNUYOR";

    const paddingX = 22;
    const paddingY = 10;
    const w = label.width + paddingX * 2;
    const h = label.height + paddingY * 2;

    const grad = new FillGradient(0, -h / 2, 0, h / 2);
    if (myTurn) {
      grad.addColorStop(0, 0x3a2c17);
      grad.addColorStop(1, 0x241a0d);
    } else {
      grad.addColorStop(0, 0x2a2420);
      grad.addColorStop(1, 0x171412);
    }

    bg.clear()
      .roundRect(-w / 2, -h / 2, w, h, h / 2)
      .fill(grad)
      .stroke({ width: 1.5, color: 0xc7a977, alpha: myTurn ? 0.9 : 0.5 });

    innerGlow
      .clear()
      .roundRect(-w / 2 + 3, -h / 2 + 3, w - 6, h - 6, h / 2 - 3)
      .stroke({ width: 1, color: 0xdbbf8e, alpha: myTurn ? 0.45 : 0.2 });
  };

  redraw(isMyTurn);

  container.addChild(bg, innerGlow, label);

  return {
    container,
    setIsMyTurn: redraw,
  };
}
