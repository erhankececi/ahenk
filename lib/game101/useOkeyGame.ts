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
import type { OkeyGameState, OkeyGameTile, OkeyTileColor } from "./gameTypes";
import type { OkeyMeld } from "./meldValidation";
import type { OkeyGameCommand } from "./commands";
import { buildMockGameState } from "./mockGame";
import { performMockOpponentTurn, selectTile as selectTileAction } from "./gameActions";
import { applyGameCommand } from "./gameReducer";

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
  /** Elimi renklerine göre (her renk içinde sayıya göre) dizer. */
  sortHandByColor: () => void;
  /** Elimi sayılarına göre dizer (aynı sayılar yan yana). */
  sortHandByValue: () => void;
  /** Elimdeki çiftleri (aynı renk+sayı ikilileri) öne alır. */
  sortHandByPairs: () => void;
  /** Elimdeki boşlukları temizler (taşları soldan sıkı diz). */
  compactMyHand: () => void;
  /** Son aksiyonun kısa açıklaması (debug / gelecekte toast bildirimi için). */
  lastAction: string | null;
  /** Aktif sıranın başladığı epoch ms zamanı (turn timer için). Sıra yoksa null. */
  turnStartedAt: number | null;
  /** Sıra süresi (saniye) — görsel geri sayım İKİNCİ aşamada eklenecek. */
  turnDurationSec: number;
  /** Bu el için açılan gösterge taşı (hands/drawPile/discardPile içinde YOK, ayrı render edilir). */
  indicatorTile: OkeyGameTile | null;
  /** Göstergeden hesaplanan okey rengi (gösterge yoksa null). */
  okeyColor: OkeyTileColor | null;
  /** Göstergeden hesaplanan okey değeri (gösterge yoksa null). */
  okeyValue: number | null;
  /** Benim (bottom) açtığım seri/çift meld'leri (bu fazda ileri UI işlemi yok). */
  openedMelds: OkeyMeld[];
  /** Benim ilk açtığım tip ("none" = henüz açmadım). */
  myOpenType: "none" | "run" | "pair";
  /** Bu elde en az bir kez seri/çift açıp açmadığım. */
  hasOpened: boolean;
  /**
   * Verilen meld'lerdeki taşları (id bazlı) elimden çıkarıp açar. Yalnızca
   * kendi sıramdayken ve daha önce hiç açmamışken etkilidir; aksi halde
   * no-op. Sırayı değiştirmez, geri sayımı sıfırlamaz.
   */
  openMelds: (melds: OkeyMeld[], openType: "run" | "pair") => void;
  /**
   * Elimdeki tileId'li taşı, openedMelds içindeki meldId'li açık meld'e
   * işler (attach eder). Yalnızca kendi sıramdayken, daha önce açtıysam
   * (hasOpened=true) ve taş o meld'e uygunsa (meldProcessing.ts —
   * canAddTileToMeld) etkilidir; aksi halde no-op. Sırayı değiştirmez,
   * geri sayımı sıfırlamaz.
   */
  processTileToMeld: (tileId: string, meldId: string, position?: "start" | "end") => void;
  /** Oyun fazı ("waiting" | "dealing" | "playing" | "roundEnded"). */
  phase: OkeyGameState["phase"];
  /** Eli bitiren koltuk (yalnızca phase "roundEnded" iken anlamlı). */
  winnerSeat: OkeyGameState["winnerSeat"];
  /** Eli bitiren oyuncunun id'si (mock akışta "bottom" için "me"). */
  winnerPlayerId: OkeyGameState["winnerPlayerId"];
  /** BİTİR ile atılan son taş (yalnızca phase "roundEnded" iken set). */
  finalDiscardTile: OkeyGameState["finalDiscardTile"];
  /**
   * Görev 12 (Faz 1): bu elin puanlama sonucu (lib/game101/scoring.ts —
   * calculateRoundScore). Yalnızca phase "roundEnded" iken (finishRound
   * başarıyla çalıştıktan sonra) dolu; öncesinde undefined'dır.
   */
  roundScore: OkeyGameState["roundScore"];
  /**
   * Görev 10 (Faz 1): elimde tam 1 taş kalmışsa, daha önce açtıysam
   * (hasOpened) ve sıra bendeyse o son taşı atarak eli bitirir; state
   * "roundEnded" fazına geçer. Koşullardan biri sağlanmazsa (veya son taş
   * seçili değilse) no-op. Sırayı DEĞİŞTİRMEZ.
   */
  finishRound: () => void;
  /**
   * Görev 10 (Faz 1): "Yeni El Başlat" — mevcut roomId/roomName ile
   * sıfırdan bir mock oyun state'i kurar (buildMockGameState), yani yeni
   * bir deste karıştırılır/dağıtılır ve phase tekrar "playing" olur.
   */
  startNewRound: () => void;
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

  // Ahenk 101 — Görev 13 (Faz 2): tüm oyun aksiyonları artık gameActions.ts
  // fonksiyonlarını DOĞRUDAN çağırmak yerine bir OkeyGameCommand (commands.ts)
  // inşa edip lib/game101/gameReducer.ts'in applyGameCommand'ına dispatch
  // eder. Gerçek state mutasyonu hâlâ gameActions.ts'te (applyGameCommand
  // onu sarmalıyor) — bu SADECE bir dispatch/mimari değişikliği, UI'a
  // giden dönüş şekli (UseOkeyGameResult) ve davranış (guard'lar, no-op'lar,
  // başarı mesajları) BİREBİR AYNI kalır.
  //
  // buildCommand bir fonksiyon olarak alınır (sabit obje değil) ki
  // discardSelectedTile gibi "önce prev.selectedTileId'ye bak, yoksa hiç
  // dispatch etme" şeklindeki MEVCUT no-op korumasını, eski koddaki gibi
  // setGameState'in functional-updater'ı İÇİNDE (her zaman en güncel prev
  // ile) uygulayabilelim — dışarıdan (updater dışından) okunan bir
  // gameState referansına bel bağlamak stale-closure riski taşırdı.
  const dispatchCommand = useCallback(
    (
      buildCommand: (
        prev: OkeyGameState,
      ) => Omit<OkeyGameCommand, "playerId" | "seat"> | null,
    ) => {
      setGameState((prev) => {
        const partialCommand = buildCommand(prev);
        if (partialCommand === null) return prev;

        const command = {
          ...partialCommand,
          playerId: "me",
          seat: "bottom",
        } as OkeyGameCommand;

        const { state: nextState, events } = applyGameCommand(prev, command);
        // Debug/izleme amaçlı — UI davranışını DEĞİŞTİRMEZ.
        for (const event of events) {
          console.debug(`[game101] ${event.type}: ${event.message}`);
        }
        return nextState;
      });
    },
    [],
  );

  const selectTile = useCallback((tileId: string) => {
    setGameState((prev) => selectTileAction(prev, tileId));
  }, []);

  const drawTile = useCallback(() => {
    dispatchCommand(() => ({ type: "DRAW_TILE" }));
  }, [dispatchCommand]);

  const discardSelectedTile = useCallback(() => {
    dispatchCommand((prev) => {
      if (!prev.selectedTileId) return null;
      return { type: "DISCARD_TILE", payload: { tileId: prev.selectedTileId } };
    });
  }, [dispatchCommand]);

  const sortHandByColor = useCallback(() => {
    dispatchCommand(() => ({ type: "SORT_HAND_BY_COLOR" }));
  }, [dispatchCommand]);

  const sortHandByValue = useCallback(() => {
    dispatchCommand(() => ({ type: "SORT_HAND_BY_VALUE" }));
  }, [dispatchCommand]);

  const sortHandByPairs = useCallback(() => {
    dispatchCommand(() => ({ type: "SORT_HAND_BY_PAIRS" }));
  }, [dispatchCommand]);

  const compactMyHand = useCallback(() => {
    dispatchCommand(() => ({ type: "COMPACT_HAND" }));
  }, [dispatchCommand]);

  const openMelds = useCallback(
    (melds: OkeyMeld[], openType: "run" | "pair") => {
      dispatchCommand(() => ({ type: "OPEN_MELDS", payload: { melds, openType } }));
    },
    [dispatchCommand],
  );

  const processTileToMeld = useCallback(
    (tileId: string, meldId: string, position?: "start" | "end") => {
      dispatchCommand(() => ({ type: "PROCESS_TILE", payload: { tileId, meldId, position } }));
    },
    [dispatchCommand],
  );

  const finishRound = useCallback(() => {
    dispatchCommand(() => ({ type: "FINISH_ROUND" }));
  }, [dispatchCommand]);

  const startNewRound = useCallback(() => {
    dispatchCommand(() => ({ type: "START_NEW_ROUND" }));
  }, [dispatchCommand]);

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
    sortHandByColor,
    sortHandByValue,
    sortHandByPairs,
    compactMyHand,
    lastAction: gameState.lastAction,
    turnStartedAt: gameState.turnStartedAt,
    turnDurationSec: gameState.turnDurationSec,
    indicatorTile: gameState.indicatorTile,
    okeyColor: gameState.okeyColor,
    okeyValue: gameState.okeyValue,
    openedMelds: gameState.openedMelds,
    myOpenType: gameState.myOpenType,
    hasOpened: gameState.hasOpened,
    openMelds,
    processTileToMeld,
    phase: gameState.phase,
    winnerSeat: gameState.winnerSeat,
    winnerPlayerId: gameState.winnerPlayerId,
    finalDiscardTile: gameState.finalDiscardTile,
    roundScore: gameState.roundScore,
    finishRound,
    startNewRound,
  };
}
