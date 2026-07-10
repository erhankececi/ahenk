// Ahenk 101 — Görev 13 (Faz 1): oyun motoru COMMAND tipleri.
//
// Bu dosya, client'ın "TAŞ ÇEK" gibi bir aksiyonu artık DOĞRUDAN bir
// state-mutating fonksiyon çağırarak değil, bir COMMAND objesi ("niyet")
// dispatch ederek ifade etmesini sağlayan tipleri tanımlar. Bu KESİNLİKLE
// bir REFACTOR'dür — gerçek state mutasyonu hâlâ lib/game101/gameActions.ts
// içindeki saf fonksiyonlardadır; lib/game101/gameReducer.ts bu command'ları
// alıp o fonksiyonları çağırır.
//
// Her command'ın payload'ı, KOMUTUN GERÇEKTEN İHTİYAÇ DUYDUĞU alanlarla
// sınırlıdır — payload'a ihtiyaç duymayan komutlarda `payload` alanı
// tamamen YOKTUR (ne opsiyonel ne de boş obje olarak eklenir).

import type { OkeyGameTile, OkeySeatPosition } from "./gameTypes";
import type { OkeyMeld } from "./meldValidation";

export type OkeyCommandType =
  | "DRAW_TILE"
  | "DISCARD_TILE"
  | "OPEN_MELDS"
  | "PROCESS_TILE"
  | "FINISH_ROUND"
  | "REORDER_HAND"
  | "SORT_HAND_BY_COLOR"
  | "SORT_HAND_BY_VALUE"
  | "SORT_HAND_BY_PAIRS"
  | "COMPACT_HAND"
  | "START_NEW_ROUND";

/** Her command'da ortak olan alanlar. */
interface OkeyBaseCommand {
  /** Komutu gönderen oyuncunun id'si (mock akışta "bottom" için "me"). */
  playerId: string;
  /** Komutu gönderen koltuk. */
  seat: OkeySeatPosition;
  /** İstemci tarafında üretilen, opsiyonel idempotency/izleme kimliği. */
  clientCommandId?: string;
  /** Komutun oluşturulduğu epoch ms zamanı (opsiyonel). */
  createdAt?: number;
}

/** Sıradaki oyuncu (bottom) desteden 1 taş çeker. Payload YOK. */
export interface DrawTileCommand extends OkeyBaseCommand {
  type: "DRAW_TILE";
}

/** Verilen id'li taşı elden atar. */
export interface DiscardTileCommand extends OkeyBaseCommand {
  type: "DISCARD_TILE";
  payload: { tileId: string };
}

/** Verilen meld'leri (seri veya çift) elden çıkarıp açar. */
export interface OpenMeldsCommand extends OkeyBaseCommand {
  type: "OPEN_MELDS";
  payload: { melds: OkeyMeld[]; openType: "run" | "pair" };
}

/** Verilen taşı, açık bir meld'e işler (attach eder). */
export interface ProcessTileCommand extends OkeyBaseCommand {
  type: "PROCESS_TILE";
  payload: { tileId: string; meldId: string; position?: "start" | "end" };
}

/** Elimdeki son taşı atarak eli bitirir. Payload YOK. */
export interface FinishRoundCommand extends OkeyBaseCommand {
  type: "FINISH_ROUND";
}

/** Elimi (hands.bottom) verilen yeni sırayla değiştirir (serbest sürükle-bırak vb.). */
export interface ReorderHandCommand extends OkeyBaseCommand {
  type: "REORDER_HAND";
  payload: { newHandOrder: OkeyGameTile[]; lastActionText?: string };
}

/** Elimi renklerine (sonra sayılarına) göre dizer. Payload YOK. */
export interface SortHandByColorCommand extends OkeyBaseCommand {
  type: "SORT_HAND_BY_COLOR";
}

/** Elimi sayılarına göre dizer. Payload YOK. */
export interface SortHandByValueCommand extends OkeyBaseCommand {
  type: "SORT_HAND_BY_VALUE";
}

/** Elimdeki çiftleri öne alır. Payload YOK. */
export interface SortHandByPairsCommand extends OkeyBaseCommand {
  type: "SORT_HAND_BY_PAIRS";
}

/** Elimdeki boşlukları temizler. Payload YOK. */
export interface CompactHandCommand extends OkeyBaseCommand {
  type: "COMPACT_HAND";
}

/**
 * Yeni bir el başlatır. Payload YOK — roomId/roomName reducer'ın ZATEN
 * state'ten bildiği bilgilerdir (state.roomId/state.roomName kullanılır),
 * komutun kendisi taşımaz.
 */
export interface StartNewRoundCommand extends OkeyBaseCommand {
  type: "START_NEW_ROUND";
}

/** Tüm Ahenk 101 komutlarının discriminated union'ı (type alanına göre daralır). */
export type OkeyGameCommand =
  | DrawTileCommand
  | DiscardTileCommand
  | OpenMeldsCommand
  | ProcessTileCommand
  | FinishRoundCommand
  | ReorderHandCommand
  | SortHandByColorCommand
  | SortHandByValueCommand
  | SortHandByPairsCommand
  | CompactHandCommand
  | StartNewRoundCommand;
