"use client";

import { useEffect, useRef } from "react";
import { Application, Container, FillGradient, Graphics, Text, TextStyle } from "pixi.js";
import { buildMockGameState } from "@/lib/game101/mockData";
import { buildGameTable } from "./GameTable";
import { buildPlayerSeat } from "./PlayerSeat";
import { buildTileRack } from "./TileRack";
import { buildDrawPile } from "./DrawPile";
import { buildDiscardArea } from "./DiscardArea";

export interface GameCanvasProps {
  width: number;
  height: number;
  onSeatClick: (playerId: string) => void;
}

/**
 * Pixi Application kurulumu — GameTable/PlayerSeat/TileRack/DrawPile/DiscardArea'yı
 * tek sahne grafiğinde koordine eder. PixiJS v8 API: async app.init, app.canvas,
 * Graphics fluent chain, FillGradient.
 */
export default function GameCanvas({ width, height, onSeatClick }: GameCanvasProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<Application | null>(null);
  const cleanupExtraRef = useRef<() => void>(() => {});

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

      const state = buildMockGameState();
      const root = new Container();
      app.stage.addChild(root);

      // 1) Masa zemini.
      const table = buildGameTable(width, height);
      root.addChild(table);

      const cx = width / 2;
      const cy = height / 2;

      // 2) Rakip koltukları (top/left/right) + kendi koltuk göstergesi.
      const seatSetters: Record<string, (active: boolean) => void> = {};

      const topPlayer = state.players.find((p) => p.seat === "top")!;
      const leftPlayer = state.players.find((p) => p.seat === "left")!;
      const rightPlayer = state.players.find((p) => p.seat === "right")!;
      const mePlayer = state.players.find((p) => p.seat === "bottom")!;

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
      const drawPile = buildDrawPile(state.drawPileCount);
      drawPile.position.set(cx - 70, cy + 6);
      root.addChild(drawPile);

      const discard = buildDiscardArea(state.discardTile);
      discard.position.set(cx + 70, cy + 6);
      root.addChild(discard);

      const turnPill = buildTurnPill();
      turnPill.position.set(cx, cy - height * 0.09);
      root.addChild(turnPill);

      // 4) Alt kullanıcı ıstakası (2 sıra, sürükle-bırak).
      const rack = buildTileRack(state.myTiles, app.ticker);
      rack.container.position.set(cx, height * 0.985 - rackHalfHeight());
      root.addChild(rack.container);

      // Aktif sırayı görsel olarak yansıt (mock: her zaman "me").
      Object.entries(seatSetters).forEach(([id, setActive]) => {
        setActive(id === state.currentTurnPlayerId);
      });

      cleanupExtraRef.current = () => {
        rack.destroy();
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
    // width/height değiştiğinde (letterbox yeniden hesaplandığında) sahneyi
    // sıfırdan kur — aksi halde Pixi canvas ilk mount boyutunda kilitli kalır
    // ve dış konteyner büyüdükçe içerik köşede küçük kalır.
  }, [width, height, onSeatClick]);

  return <div ref={hostRef} className="absolute inset-0" />;
}

function rackHalfHeight() {
  const rows = 2;
  const tileH = 88;
  const gapY = 10;
  const pad = 14;
  return (rows * (tileH + gapY) - gapY + pad * 2) / 2;
}

/** "SIRA SENDE" — altın çerçeveli pill/badge, masa üstünde ortada. */
function buildTurnPill(): Container {
  const container = new Container();
  const label = new Text({
    text: "SIRA SENDE",
    style: new TextStyle({
      fontFamily: "Manrope, Inter, system-ui, sans-serif",
      fontSize: 15,
      fontWeight: "800",
      fill: 0xf3ead4,
      letterSpacing: 2,
    }),
  });
  label.anchor.set(0.5);

  const paddingX = 22;
  const paddingY = 10;
  const w = label.width + paddingX * 2;
  const h = label.height + paddingY * 2;

  const grad = new FillGradient(0, -h / 2, 0, h / 2);
  grad.addColorStop(0, 0x3a2c17);
  grad.addColorStop(1, 0x241a0d);

  const bg = new Graphics()
    .roundRect(-w / 2, -h / 2, w, h, h / 2)
    .fill(grad)
    .stroke({ width: 1.5, color: 0xc7a977, alpha: 0.9 });

  const innerGlow = new Graphics()
    .roundRect(-w / 2 + 3, -h / 2 + 3, w - 6, h - 6, h / 2 - 3)
    .stroke({ width: 1, color: 0xdbbf8e, alpha: 0.45 });

  container.addChild(bg, innerGlow, label);
  return container;
}
