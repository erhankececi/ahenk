// Ahenk 101 — Görev 13 (Faz 1): command/event REDUCER.
//
// Bu dosya, lib/game101/gameActions.ts içindeki MEVCUT saf fonksiyonları
// YENİDEN YAZMAZ — onları bir OkeyGameCommand'a göre ÇAĞIRAN bir sarmalayıcı
// (wrapper) katmandır. Amaç: client artık "TAŞ ÇEK" gibi bir aksiyonu
// doğrudan bir state-mutating fonksiyon çağırarak değil, applyGameCommand'a
// bir command objesi vererek ifade edebilsin; bu da ileride gerçek bir
// Colyseus/socket server'a taşınabilecek bir command/event mimarisinin
// TEMELİDİR.
//
// Davranış sözleşmesi:
// - gameActions.ts'teki her fonksiyon, guard'ı sağlanmadığında state'i AYNEN
//   (referans eşit) döner (bkz. o dosyadaki no-op dönüşler). Bu yüzden
//   "önceki state === sonraki state" kontrolü REDDEDİLME tespiti için
//   yeterlidir.
// - Reddedilirse: state (girdi state'i, DEĞİŞTİRİLMEDEN) aynen döner,
//   tek bir COMMAND_REJECTED event'i üretilir. eventLog/lastEvent bu
//   durumda GÜNCELLENMEZ (state gerçekten hiç değişmemiş olsun diye —
//   testte "referans eşit" garantisi budur).
// - Başarılı olursa: gameActions'ın döndürdüğü YENİ state kullanılır,
//   command tipine karşılık gelen event üretilir, eventLog'a eklenir
//   (son 20 event'e kırpılarak) ve lastEvent güncellenir.

import type { OkeyGameState } from "./gameTypes";
import type { OkeyGameCommand } from "./commands";
import type { OkeyEventType, OkeyGameEvent } from "./events";
import {
  discardTile,
  drawTile,
  finishRound,
  openMelds,
  processTileToMeld,
  reorderHand,
} from "./gameActions";
import { compactHand, sortByColorAndValue, sortByValue, sortPairsFirst } from "./handAnalysis";
import { canAddTileToMeld } from "./meldProcessing";
import { buildMockGameState } from "./mockGame";
import {
  ERR_ACTION_NOT_ALLOWED,
  ERR_MUST_OPEN_BEFORE_FINISH,
  ERR_NOT_YOUR_TURN,
  ERR_NO_TILE_SELECTED,
  ERR_ROUND_ENDED,
  ERR_TILE_NOT_ELIGIBLE_FOR_MELD,
} from "./gameErrors";

/** applyGameCommand'ın dönüş şekli. */
export interface ApplyCommandResult {
  state: OkeyGameState;
  events: OkeyGameEvent[];
}

/** eventLog'un local'de tutulacağı üst sınır (Görev 13 spesifikasyonu). */
const MAX_EVENT_LOG = 20;

function buildEvent(
  type: OkeyEventType,
  command: OkeyGameCommand,
  message: string,
  payload?: unknown,
): OkeyGameEvent {
  return {
    type,
    playerId: command.playerId,
    seat: command.seat,
    payload,
    message,
    createdAt: command.createdAt ?? Date.now(),
  };
}

/** Başarılı bir komut sonrası: yeni state'e eventLog/lastEvent'i işler. */
function accepted(nextState: OkeyGameState, event: OkeyGameEvent): ApplyCommandResult {
  const eventLog = [...(nextState.eventLog ?? []), event].slice(-MAX_EVENT_LOG);
  return {
    state: { ...nextState, eventLog, lastEvent: event },
    events: [event],
  };
}

/**
 * Reddedilen bir komut: state'i (girdi state'i) AYNEN döner (referans
 * eşitliği korunur — eventLog/lastEvent'e bile dokunulmaz), tek bir
 * COMMAND_REJECTED event'i döner.
 */
function rejected(state: OkeyGameState, command: OkeyGameCommand, message: string): ApplyCommandResult {
  const event = buildEvent("COMMAND_REJECTED", command, message);
  return { state, events: [event] };
}

/**
 * Bir komut reddedildiğinde EN OLASI sebebi tahmin eder (v1 — basit
 * if/else zinciri, mükemmel olması şart değil; ileride gerçek server
 * tarafı kendi hata kodlarını üretecek). gameErrors.ts'teki sabitlerden
 * birini döner.
 */
function determineRejectionReason(command: OkeyGameCommand, state: OkeyGameState): string {
  switch (command.type) {
    case "DRAW_TILE":
    case "OPEN_MELDS": {
      if (state.currentTurnSeat !== "bottom") return ERR_NOT_YOUR_TURN;
      if (state.phase !== "playing") return ERR_ROUND_ENDED;
      return ERR_ACTION_NOT_ALLOWED;
    }
    case "DISCARD_TILE": {
      if (state.currentTurnSeat !== "bottom") return ERR_NOT_YOUR_TURN;
      if (state.phase !== "playing") return ERR_ROUND_ENDED;
      if (state.selectedTileId == null) return ERR_NO_TILE_SELECTED;
      return ERR_ACTION_NOT_ALLOWED;
    }
    case "PROCESS_TILE": {
      if (state.currentTurnSeat !== "bottom") return ERR_NOT_YOUR_TURN;
      if (state.phase !== "playing") return ERR_ROUND_ENDED;
      const tile = state.hands.bottom.find((t) => t.id === command.payload.tileId);
      const meld = state.openedMelds.find((m) => m.id === command.payload.meldId);
      if (tile && meld && !canAddTileToMeld(tile, meld, state.okeyColor, state.okeyValue)) {
        return ERR_TILE_NOT_ELIGIBLE_FOR_MELD;
      }
      return ERR_ACTION_NOT_ALLOWED;
    }
    case "FINISH_ROUND": {
      if (state.currentTurnSeat !== "bottom") return ERR_NOT_YOUR_TURN;
      if (state.phase !== "playing") return ERR_ROUND_ENDED;
      if (!state.hasOpened) return ERR_MUST_OPEN_BEFORE_FINISH;
      return ERR_ACTION_NOT_ALLOWED;
    }
    default:
      return ERR_ACTION_NOT_ALLOWED;
  }
}

/**
 * Bir OkeyGameCommand'ı işler: ilgili mevcut gameActions.ts fonksiyonunu
 * çağırır, state değiştiyse BAŞARILI (ilgili event), değişmediyse
 * REDDEDİLDİ (COMMAND_REJECTED event) olarak yorumlar.
 */
export function applyGameCommand(state: OkeyGameState, command: OkeyGameCommand): ApplyCommandResult {
  switch (command.type) {
    case "DRAW_TILE": {
      const nextState = drawTile(state);
      if (nextState === state) return rejected(state, command, determineRejectionReason(command, state));
      return accepted(nextState, buildEvent("TILE_DRAWN", command, nextState.lastAction ?? "Desteden taş çektin."));
    }

    case "DISCARD_TILE": {
      const nextState = discardTile(state, command.payload.tileId);
      if (nextState === state) return rejected(state, command, determineRejectionReason(command, state));
      return accepted(
        nextState,
        buildEvent("TILE_DISCARDED", command, nextState.lastAction ?? "Taş attın, sıra rakipte.", {
          tileId: command.payload.tileId,
        }),
      );
    }

    case "OPEN_MELDS": {
      const nextState = openMelds(state, command.payload.melds, command.payload.openType);
      if (nextState === state) return rejected(state, command, determineRejectionReason(command, state));
      return accepted(
        nextState,
        buildEvent("MELDS_OPENED", command, nextState.lastAction ?? "Açıldı.", {
          openType: command.payload.openType,
        }),
      );
    }

    case "PROCESS_TILE": {
      const nextState = processTileToMeld(
        state,
        command.payload.tileId,
        command.payload.meldId,
        command.payload.position,
      );
      if (nextState === state) return rejected(state, command, determineRejectionReason(command, state));
      return accepted(
        nextState,
        buildEvent("TILE_PROCESSED", command, nextState.lastAction ?? "Taş işlendi.", {
          tileId: command.payload.tileId,
          meldId: command.payload.meldId,
        }),
      );
    }

    case "FINISH_ROUND": {
      const nextState = finishRound(state);
      if (nextState === state) return rejected(state, command, determineRejectionReason(command, state));
      return accepted(nextState, buildEvent("ROUND_FINISHED", command, nextState.lastAction ?? "El bitti."));
    }

    case "REORDER_HAND": {
      const nextState = reorderHand(state, command.payload.newHandOrder, command.payload.lastActionText);
      if (nextState === state) return rejected(state, command, ERR_ACTION_NOT_ALLOWED);
      return accepted(nextState, buildEvent("HAND_REORDERED", command, nextState.lastAction ?? "El düzenlendi."));
    }

    case "SORT_HAND_BY_COLOR": {
      const nextState = reorderHand(state, sortByColorAndValue(state.hands.bottom), "El renklerine göre dizildi.");
      if (nextState === state) return rejected(state, command, ERR_ACTION_NOT_ALLOWED);
      return accepted(nextState, buildEvent("HAND_SORTED", command, "El renklerine göre dizildi."));
    }

    case "SORT_HAND_BY_VALUE": {
      const nextState = reorderHand(state, sortByValue(state.hands.bottom), "El sayılara göre dizildi.");
      if (nextState === state) return rejected(state, command, ERR_ACTION_NOT_ALLOWED);
      return accepted(nextState, buildEvent("HAND_SORTED", command, "El sayılara göre dizildi."));
    }

    case "SORT_HAND_BY_PAIRS": {
      const nextState = reorderHand(state, sortPairsFirst(state.hands.bottom), "Çiftler öne alındı.");
      if (nextState === state) return rejected(state, command, ERR_ACTION_NOT_ALLOWED);
      return accepted(nextState, buildEvent("HAND_SORTED", command, "Çiftler öne alındı."));
    }

    case "COMPACT_HAND": {
      const nextState = reorderHand(state, compactHand(state.hands.bottom), "Boşluklar temizlendi.");
      if (nextState === state) return rejected(state, command, ERR_ACTION_NOT_ALLOWED);
      return accepted(nextState, buildEvent("HAND_SORTED", command, "Boşluklar temizlendi."));
    }

    case "START_NEW_ROUND": {
      // Diğerlerinden FARKLI: eski state'i güncellemek yerine TAMAMEN YENİ
      // bir state kurar (mevcut roomId/roomName korunur). Bu komut ASLA
      // reddedilmez, her zaman başarılıdır.
      const nextState = buildMockGameState({ roomId: state.roomId, roomName: state.roomName });
      return accepted(nextState, buildEvent("ROUND_STARTED", command, nextState.lastAction ?? "Yeni el başladı."));
    }

    default: {
      // Exhaustiveness guard: OkeyGameCommand'a yeni bir tip eklenip burada
      // unutulursa tsc --noEmit bu satırda hata verir.
      const exhaustiveCheck: never = command;
      return rejected(state, exhaustiveCheck as OkeyGameCommand, ERR_ACTION_NOT_ALLOWED);
    }
  }
}
