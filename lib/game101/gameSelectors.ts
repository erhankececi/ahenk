// Ahenk 101 — Görev 13 (Faz 1): türetilmiş (derived) state okuyucuları.
//
// Amaç: UI'ın doğrudan karmaşık OkeyGameState'e gömülmesini azaltmak — bu
// dosyadaki her fonksiyon SAF bir okuma fonksiyonudur (state: OkeyGameState)
// => ... imzasındadır, state'i DEĞİŞTİRMEZ. Var olan mevcut
// gameActions.ts/finishValidation.ts fonksiyonlarını (saf okuma amaçlı
// oldukları için) İÇERİDEN import edip TEKRAR YAZMAZ.

import type { OkeyGamePlayer, OkeyGameState, OkeyGameTile } from "./gameTypes";
import type { OkeyMeld } from "./meldValidation";
import type { RoundScoreResult } from "./scoring";
import { findPlayerBySeat } from "./gameActions";
import { canFinishWithSelectedTile } from "./finishValidation";

/** Benim (bottom) elimdeki taşlar. */
export function selectMyHand(state: OkeyGameState): OkeyGameTile[] {
  return state.hands.bottom;
}

/** Sırası gelen koltuğun oyuncu kaydı (bulunamazsa undefined). */
export function selectCurrentPlayer(state: OkeyGameState): OkeyGamePlayer | undefined {
  return findPlayerBySeat(state.players, state.currentTurnSeat);
}

/** Sıra bende mi? */
export function selectIsMyTurn(state: OkeyGameState): boolean {
  return state.currentTurnSeat === "bottom";
}

/** Şu an desteden taş çekebilir miyim? (sıra bende + oyun sürüyor + destede taş var) */
export function selectCanDraw(state: OkeyGameState): boolean {
  return selectIsMyTurn(state) && state.phase === "playing" && state.drawPile.length > 0;
}

/** Şu an taş atabilir miyim? (sıra bende + oyun sürüyor + bir taş seçili) */
export function selectCanDiscard(state: OkeyGameState): boolean {
  return selectIsMyTurn(state) && state.phase === "playing" && state.selectedTileId !== null;
}

/**
 * Şu an genel olarak bir açma denemesi (seri veya çift) anlamlı mı? (sıra
 * bende + oyun sürüyor + daha önce hiç açmadım). Seri/çift'e özel tip/miktar
 * validasyonu (MIN_OPEN_SCORE, MIN_PAIRS_TO_OPEN vb.) lib/game101/
 * meldValidation.ts'te yapılır — bu selector yalnızca genel ön-koşulu kontrol eder.
 */
export function selectCanOpen(state: OkeyGameState): boolean {
  return selectIsMyTurn(state) && state.phase === "playing" && !state.hasOpened;
}

/** Şu an (seçili son taşla) eli bitirebilir miyim? */
export function selectCanFinish(state: OkeyGameState): boolean {
  return canFinishWithSelectedTile(state).canFinish;
}

/** Benim (bottom) açtığım seri/çift meld'leri. */
export function selectOpenedMelds(state: OkeyGameState): OkeyMeld[] {
  return state.openedMelds;
}

/** Bu elin puanlama sonucu (el bitmediyse undefined). */
export function selectRoundScore(state: OkeyGameState): RoundScoreResult | undefined {
  return state.roundScore;
}
