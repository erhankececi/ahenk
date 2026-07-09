// Ahenk 101 — Görev 10 (Faz 1): BİTİR (el bitirme) doğrulama, saf fonksiyonlar.
//
// Bu dosya SADECE doğrulama mantığını içerir — state'i DEĞİŞTİRMEZ. State'i
// değiştiren asıl aksiyon lib/game101/gameActions.ts içindeki finishRound'dur
// (o da bu dosyadaki canFinishWithSelectedTile'ı kullanır).
//
// Kurallar v1 (ChatGPT spesifikasyonu):
// 1. Kullanıcı sadece kendi sırasında bitirebilir (currentTurnSeat === "bottom").
// 2. Kullanıcı açmadan bitiremez (hasOpened === true olmalı).
// 3. Kullanıcının elinde tam 1 taş kalmış olmalı (hands.bottom.length === 1).
// 4. Bu son taş seçili olmalı (selectedTileId === o tek taşın id'si) —
//    bu koşul SADECE canFinishWithSelectedTile'da kontrol edilir, validateFinish
//    seçim durumuna bakmaz (yapısal/temel koşullar).

import type { OkeyGameState } from "./gameTypes";

export interface FinishValidationResult {
  canFinish: boolean;
  reason: string;
  discardTileId?: string;
  remainingTileCount: number;
}

/**
 * SADECE yapısal koşulları kontrol eder (seçim durumuna BAKMAZ):
 * - Sıra bende mi (currentTurnSeat === "bottom")
 * - hasOpened true mu
 * - hands.bottom.length === 1 mi
 *
 * remainingTileCount her koşulda hesaplanır. discardTileId, elde tam 1 taş
 * varsa o taşın id'sidir; aksi halde undefined'dır.
 */
export function validateFinish(state: OkeyGameState): FinishValidationResult {
  const remainingTileCount = state.hands.bottom.length;
  const discardTileId = remainingTileCount === 1 ? state.hands.bottom[0].id : undefined;

  if (state.currentTurnSeat !== "bottom") {
    return {
      canFinish: false,
      reason: "Sıra sende değil.",
      discardTileId,
      remainingTileCount,
    };
  }

  if (!state.hasOpened) {
    return {
      canFinish: false,
      reason: "Henüz seri veya çift açmadın.",
      discardTileId,
      remainingTileCount,
    };
  }

  if (remainingTileCount !== 1) {
    return {
      canFinish: false,
      reason: "Elinde tam olarak 1 taş kalmalı.",
      discardTileId,
      remainingTileCount,
    };
  }

  return {
    canFinish: true,
    reason: "Bitirmeye hazır.",
    discardTileId,
    remainingTileCount,
  };
}

/**
 * validateFinish'in üzerine EK OLARAK son taşın gerçekten seçili olup
 * olmadığını kontrol eder. validateFinish canFinish:false dönerse onu AYNEN
 * (propagate) döner. canFinish:true dönerse, state.selectedTileId ===
 * result.discardTileId değilse canFinish:false'a çevirip reason'ı günceller
 * (discardTileId ve remainingTileCount AYNEN kalır); eşleşiyorsa sonucu
 * aynen döner.
 */
export function canFinishWithSelectedTile(state: OkeyGameState): FinishValidationResult {
  const result = validateFinish(state);
  if (!result.canFinish) return result;

  if (state.selectedTileId !== result.discardTileId) {
    return {
      ...result,
      canFinish: false,
      reason: "Son taş seçili değil.",
    };
  }

  return result;
}
