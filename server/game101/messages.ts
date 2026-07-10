// Ahenk 101 — Görev 14 (Faz 1): Colyseus mesaj tipi sabitleri.
//
// Client <-> Server arasında `room.send(type, payload)` / `this.onMessage(type, ...)`
// çağrılarında kullanılacak mesaj adları. Sabitler hem runtime'da (string
// karşılaştırma) hem derleme zamanında (union tip daraltma) kullanılabilsin
// diye `as const` nesneleri olarak tanımlanır.

/** Client -> Server mesaj tipleri. */
export const CLIENT_MESSAGES = {
  READY: "READY",
  SIT: "SIT",
  LEAVE_SEAT: "LEAVE_SEAT",
  START_GAME: "START_GAME",
  /**
   * Görev 13'teki (lib/game101/commands.ts) OkeyGameCommand yapısını taşır.
   * Bu görevde SADECE loglanır — state değiştirme YOK (bkz. Okey101Room.ts).
   */
  GAME_COMMAND: "GAME_COMMAND",
} as const;

/** Server -> Client mesaj tipleri. */
export const SERVER_MESSAGES = {
  ROOM_ERROR: "ROOM_ERROR",
  GAME_EVENT: "GAME_EVENT",
  SYSTEM_MESSAGE: "SYSTEM_MESSAGE",
} as const;

export type ClientMessageType = (typeof CLIENT_MESSAGES)[keyof typeof CLIENT_MESSAGES];
export type ServerMessageType = (typeof SERVER_MESSAGES)[keyof typeof SERVER_MESSAGES];
