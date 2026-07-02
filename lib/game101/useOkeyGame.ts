// Ahenk 101 — Görev 4: local mock oyun state'ini yöneten React hook.
//
// Backend/Supabase/socket/Colyseus YOK — tamamen local (useState/useEffect)
// mock akış. İleride bu hook'un İÇİ gerçek bir server bağlantısıyla
// değiştirilebilir; DIŞARIYA verdiği API (dönüş tipi) mümkün olduğunca
// stabil kalacak şekilde tasarlandı.
//
// Bu dosyayı import eden component "use client" olmalıdır (useState/
// useEffect kullanır) — bu dosyanın kendisinde "use client" gerekmez
// (lib/ altında, component değil).

import { useCallback, useEffect, useRef, useState } from "react";
import type { OkeyGameState, OkeyGameTile } from "./gameTypes";
import { buildMockGameState } from "./mockGame";
import { discardTile as discardTileAction, drawTile as drawTileAction, performMockOpponentTurn, selectTile as selectTileAction } from "./gameActions";

/** Mock rakip hamlesinin sıra bana geçtikten ne kadar sonra tetikleneceği. */
const MOCK_OPPONENT_DELAY_MS = 1000;

export interface UseOkeyGameResult {
  /** Tam oyun state'i (debug / gelecekte kullanım için — çoğu UI ihtiyacı için aşağıdaki türetilmiş alanları tercih edin). */
  gameState: OkeyGameState;
  /** Benim (bottom) elimdeki taşlar — TileRack'e verilecek. */
  myHand: OkeyGameTile[];
  /** Atılan taş yığınının en üstteki taşı — DiscardArea'ya verilecek. */
  discardTile: OkeyGameTile | null;
  /** Kapalı çekme destesinde kalan taş sayısı — DrawPile'a verilecek. */
  drawPileCount: number;
  /** Sıra bende mi? ("SIRA SENDE" / "Rakip oynuyor" göstergesi için). */
  isMyTurn: boolean;
  /** Şu an seçili taşın id'si (yoksa null). */
  selectedTileId: string | null;
  /** Bir taşı seçili/seçili-değil yapar (aynı taşa tekrar çağrılırsa seçim kalkar). */
  selectTile: (tileId: string) => void;
  /** Sıra bendeyse desteden 1 taş çeker; değilse no-op. */
  drawTile: () => void;
  /** Seçili taş varsa onu atar ve sırayı rakibe devreder; seçili taş yoksa no-op. */
  discardSelectedTile: () => void;
  /** Son aksiyonun kısa açıklaması (debug / gelecekte toast bildirimi için). */
  lastAction: string | null;
  /** Aktif sıranın başladığı epoch ms zamanı (turn timer için). Sıra yoksa null. */
  turnStartedAt: number | null;
  /** Sıra süresi (saniye) — görsel geri sayım İKİNCİ aşamada eklenecek. */
  turnDurationSec: number;
}

/**
 * Ahenk 101 için local mock oyun state'ini kurar ve yönetir.
 *
 * Akış:
 * 1. Mount'ta mock deste dağıtılır (ben 21 taş, rakipler 14'er taş, sıra bende).
 * 2. drawTile() / discardSelectedTile() / selectTile() ile ben oynarım.
 * 3. Taş attığımda sıra mock bir rakibe geçer; ~1 saniye sonra rakip
 *    otomatik olarak "taş çekip taş atar" ve sıra tekrar bana döner.
 * 4. turnStartedAt her sıra değişiminde güncellenir; 30 saniyelik turnDurationSec
 *    ile birlikte İKİNCİ aşamada görsel bir geri sayım/ring'e bağlanabilir.
 *    Süre dolduğunda otomatik taş atma YAPILMAZ.
 *
 * @param roomId Oda kimliği (mock state'e yazılır, gerçek bir sorgu tetiklemez).
 * @param roomName Oda adı (mock state'e yazılır).
 */
export function useOkeyGame(roomId?: string, roomName?: string): UseOkeyGameResult {
  const [gameState, setGameState] = useState<OkeyGameState>(() =>
    buildMockGameState({ roomId, roomName }),
  );

  const opponentTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sıra rakibe geçtiğinde ~1sn sonra mock rakip hamlesini otomatik oynat.
  useEffect(() => {
    if (gameState.currentTurnSeat === "bottom") return undefined;
    if (gameState.phase !== "playing") return undefined;

    opponentTimeoutRef.current = setTimeout(() => {
      setGameState((prev) => performMockOpponentTurn(prev));
    }, MOCK_OPPONENT_DELAY_MS);

    return () => {
      if (opponentTimeoutRef.current) clearTimeout(opponentTimeoutRef.current);
    };
  }, [gameState.currentTurnSeat, gameState.phase]);

  const selectTile = useCallback((tileId: string) => {
    setGameState((prev) => selectTileAction(prev, tileId));
  }, []);

  const drawTile = useCallback(() => {
    setGameState((prev) => drawTileAction(prev));
  }, []);

  const discardSelectedTile = useCallback(() => {
    setGameState((prev) => {
      if (!prev.selectedTileId) return prev;
      return discardTileAction(prev, prev.selectedTileId);
    });
  }, []);

  const discardTop = gameState.discardPile[gameState.discardPile.length - 1] ?? null;

  return {
    gameState,
    myHand: gameState.hands.bottom,
    discardTile: discardTop,
    drawPileCount: gameState.drawPile.length,
    isMyTurn: gameState.currentTurnSeat === "bottom",
    selectedTileId: gameState.selectedTileId,
    selectTile,
    drawTile,
    discardSelectedTile,
    lastAction: gameState.lastAction,
    turnStartedAt: gameState.turnStartedAt,
    turnDurationSec: gameState.turnDurationSec,
  };
}
