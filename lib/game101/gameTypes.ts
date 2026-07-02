// Ahenk 101 — Görev 4: temel oyun state mimarisi (mock, frontend-only).
//
// Bu dosya ./types.ts'i BOZMAZ / değiştirmez — orası hâlâ mevcut Pixi
// prototip bileşenleri (GameCanvas/TileRack/PlayerSeat/...) tarafından
// kullanılıyor. Buradaki tipler, ileride gerçek bir oyun motoruna/server'a
// bağlanabilecek AYRI ve daha zengin bir state modelini temsil eder.
//
// İsim çakışmalarını önlemek için ./types.ts'teki `Tile`/`Player` yerine
// `OkeyGameTile` / `OkeyGamePlayer` kullanılıyor.
//
// Backend/Supabase/socket/Colyseus YOK. Sadece local mock state + tipler.

/** Klasik 101 taş renkleri (joker taşın rengi yoktur ama alan yine de tutulur). */
export type OkeyTileColor = "red" | "blue" | "black" | "yellow" | "joker";

export interface OkeyGameTile {
  /** Sahne genelinde benzersiz kimlik (React key + seçim/atma kaynağı). */
  id: string;
  color: OkeyTileColor;
  /** 1-13 arası taş değeri. Joker taşta anlamsızdır (0 kullanılır). */
  value: number;
  /**
   * "Sahte okey" mi? (bu oyunda okey taşı olarak KULLANILABİLEN, oyuna
   * göre belirlenen normal taş). Gerçek kural mantığı bu görevde YOK —
   * alan yalnızca ileride kullanılmak üzere state'te tutulur.
   */
  isFakeOkey?: boolean;
  /** Fiziksel joker taşı mı (baskılı "OKEY" taşı)? */
  isOkey?: boolean;
  /** Taşın şu an kimin elinde/alanında olduğu (mock — UI/debug amaçlı). */
  owner?: string;
}

export type OkeySeatPosition = "bottom" | "top" | "left" | "right";

export type OkeyVoiceState = "idle" | "speaking" | "muted";

export interface OkeyGamePlayer {
  id: string;
  name: string;
  city: string;
  seat: OkeySeatPosition;
  /** Bu oyuncu, oturumdaki gerçek kullanıcı mı? */
  isMe: boolean;
  isReady: boolean;
  isConnected: boolean;
  voiceState: OkeyVoiceState;
}

export type OkeyGamePhase = "waiting" | "dealing" | "playing" | "roundEnded";

export interface OkeyGameState {
  roomId: string;
  roomName: string;
  phase: OkeyGamePhase;
  players: OkeyGamePlayer[];
  /** Sırası gelen koltuk. */
  currentTurnSeat: OkeySeatPosition;
  /** Kapalı çekme destesi (kalan taşlar, baştan sona — son eleman en üstte). */
  drawPile: OkeyGameTile[];
  /** Atılan taş yığını (son eleman en üstte / en son atılan). */
  discardPile: OkeyGameTile[];
  /** Koltuğa göre eldeki taşlar. Yalnızca "bottom" (ben) için UI'da açık gösterilir. */
  hands: Record<OkeySeatPosition, OkeyGameTile[]>;
  /** Şu an seçili olan taşın id'si (yalnızca benim elimde anlamlı). */
  selectedTileId: string | null;
  /** Son gerçekleşen aksiyonun kısa açıklaması (debug/gelecekte toast için). */
  lastAction: string | null;
  /** Aktif sıranın başladığı epoch ms zamanı (Date.now()). Sıra yoksa null. */
  turnStartedAt: number | null;
  /** Sıra süresi (saniye). Görsel geri sayım İKİNCİ aşamada eklenecek. */
  turnDurationSec: number;
}
