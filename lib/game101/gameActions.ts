// Ahenk 101 — Görev 4: saf (pure) oyun aksiyonu fonksiyonları.
//
// Bu fonksiyonlar hiçbir React/state kütüphanesine bağlı DEĞİLDİR: bir
// OkeyGameState alır, YENİ bir OkeyGameState döner (immutable — mevcut
// state'i mutasyona uğratmaz). useOkeyGame hook'u bunları useState
// güncelleyicileri içinde çağırır.
//
// Gerçek 101 kuralları (açma kontrolü, çift kontrolü, puanlama, bitiş
// hesaplama) burada YOK.

import type { OkeyGamePlayer, OkeyGameState, OkeyGameTile, OkeySeatPosition } from "./gameTypes";

function opponentSeatAfter(seat: OkeySeatPosition): OkeySeatPosition {
  // Sıra sırası: bottom (ben) -> right -> top -> left -> bottom ...
  // (saat yönünün tersi klasik okey oturma düzenine uyar; bu görevde sıra
  // yönünün kendisi önemli değildir, tutarlı ve döngüsel olması yeterlidir.)
  const order: OkeySeatPosition[] = ["bottom", "right", "top", "left"];
  const idx = order.indexOf(seat);
  return order[(idx + 1) % order.length];
}

/** Seçili taşı günceller. Aynı taşa tekrar tıklanırsa seçim kalkar (toggle). */
export function selectTile(state: OkeyGameState, tileId: string): OkeyGameState {
  return {
    ...state,
    selectedTileId: state.selectedTileId === tileId ? null : tileId,
  };
}

/**
 * Sırası benim (bottom) elimde iken drawPile'dan 1 taş çeker ve elime
 * ekler. Sıra bende değilse veya deste boşsa no-op (aynı state döner).
 */
export function drawTile(state: OkeyGameState): OkeyGameState {
  if (state.currentTurnSeat !== "bottom") return state;
  if (state.drawPile.length === 0) return state;

  const drawPile = [...state.drawPile];
  const drawn = drawPile.pop() as OkeyGameTile;
  const myHand = [...state.hands.bottom, { ...drawn, owner: "bottom" as const }];

  return {
    ...state,
    drawPile,
    hands: { ...state.hands, bottom: myHand },
    lastAction: "Desteden taş çektin.",
  };
}

/**
 * Seçili taşı (selectedTileId) elimden çıkarıp discardPile'ın üstüne
 * koyar, sırayı bir sonraki koltuğa (mock akışta her zaman "right" ->
 * rakip) devreder. Seçili taş yoksa veya sıra bende değilse no-op.
 */
export function discardTile(state: OkeyGameState, tileId: string): OkeyGameState {
  if (state.currentTurnSeat !== "bottom") return state;

  const tileIndex = state.hands.bottom.findIndex((t) => t.id === tileId);
  if (tileIndex === -1) return state;

  const myHand = [...state.hands.bottom];
  const [discarded] = myHand.splice(tileIndex, 1);

  const nextSeat = opponentSeatAfter("bottom");

  return {
    ...state,
    hands: { ...state.hands, bottom: myHand },
    discardPile: [...state.discardPile, { ...discarded, owner: undefined }],
    selectedTileId: null,
    currentTurnSeat: nextSeat,
    lastAction: "Taş attın, sıra rakipte.",
    turnStartedAt: Date.now(),
  };
}

/**
 * Mock rakip hamlesi: verilen koltuktaki rakip "desteden taş çekmiş" gibi
 * (drawPile'dan 1 azaltır, kendi eline eklemez — rakip elleri bu görevde
 * ayrıntılı simüle edilmiyor) ardından kendi elinden rastgele bir taş
 * "atmış" gibi davranır. Rakibin gerçek eli tutulmadığından (yalnızca
 * dağıtımda 14 taşla başlar, mock akışta detaylı takip edilmez), atılan
 * taş rakibin başlangıç elinden rastgele seçilir; el o taş kadar azaltılır.
 * Sıra tekrar bana (bottom) döner.
 */
export function performMockOpponentTurn(state: OkeyGameState): OkeyGameState {
  const opponentSeat = state.currentTurnSeat;
  if (opponentSeat === "bottom") return state;

  const opponentHand = state.hands[opponentSeat];
  const drawPile = [...state.drawPile];
  if (drawPile.length > 0) drawPile.pop();

  let nextOpponentHand = opponentHand;
  let discardPile = state.discardPile;
  let actionText = "Rakip taş çekti.";

  if (opponentHand.length > 0) {
    const randomIndex = Math.floor(Math.random() * opponentHand.length);
    const thrown = opponentHand[randomIndex];
    nextOpponentHand = opponentHand.filter((_, i) => i !== randomIndex);
    discardPile = [...state.discardPile, { ...thrown, owner: undefined }];
    actionText = "Rakip taş çekti ve bir taş attı.";
  }

  return {
    ...state,
    drawPile,
    hands: { ...state.hands, [opponentSeat]: nextOpponentHand },
    discardPile,
    currentTurnSeat: "bottom",
    lastAction: actionText,
    turnStartedAt: Date.now(),
  };
}

/** Sıra süresinin dolduğunu state'e yazar (otomatik taş atma YAPMAZ). */
export function markTurnTimedOut(state: OkeyGameState): OkeyGameState {
  return {
    ...state,
    lastAction: "Süre doldu.",
  };
}

/** Bir sonraki mock rakip koltuğunu döner (test/hook içinde kullanılabilir). */
export function getNextOpponentSeat(current: OkeySeatPosition): OkeySeatPosition {
  return opponentSeatAfter(current);
}

/** Yardımcı: bir koltuğun oyuncu kaydını bulur (UI/debug için). */
export function findPlayerBySeat(
  players: OkeyGamePlayer[],
  seat: OkeySeatPosition,
): OkeyGamePlayer | undefined {
  return players.find((p) => p.seat === seat);
}

/**
 * Ahenk 101 — Görev 6: benim (bottom) elimi verilen yeni sırayla değiştirir
 * (immutable — yeni bir OkeyGameState döner). Taş sayısının/id'lerinin
 * değişmediği varsayılır (çağıran taraf sorumludur — handAnalysis.ts'teki
 * dizme fonksiyonları zaten aynı taşları yeniden sıralar); burada ekstra
 * validasyon YAPILMAZ (basit tutulur). lastActionText verilirse
 * state.lastAction onunla güncellenir, verilmezse makul bir varsayılan
 * ("El düzenlendi.") kullanılır.
 */
export function reorderHand(
  state: OkeyGameState,
  newHandOrder: OkeyGameTile[],
  lastActionText?: string,
): OkeyGameState {
  return {
    ...state,
    hands: { ...state.hands, bottom: newHandOrder },
    lastAction: lastActionText ?? "El düzenlendi.",
  };
}
