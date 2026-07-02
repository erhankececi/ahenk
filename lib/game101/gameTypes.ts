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
   * Fiziksel joker taşı mı (destede sabit 2 adet, baskılı "OKEY" yazılı
   * taş)? Resmi terim "sahte okey" olsa da bu, oyunun başından beri
   * sabit joker olan FİZİKSEL taştır (rengi/sayısı yoktur, hep joker).
   */
  isFakeOkey?: boolean;
  /**
   * "Gerçek okey" mi? Gösterge taşına göre HESAPLANAN, göstergeyle aynı
   * renk ve değeri göstergeden 1 fazla (13 ise 1'e sarar) olan NORMAL
   * sayılı taş. Destede bu özellikte 2 fiziksel taş bulunur.
   */
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
  /** Bu el için açılan gösterge taşı (dağıtılan ellere/drawPile'a DAHİL DEĞİL — ayrı tutulur). */
  indicatorTile: OkeyGameTile | null;
  /** Göstergeden hesaplanan okey rengi (gösterge yoksa null). */
  okeyColor: OkeyTileColor | null;
  /** Göstergeden hesaplanan okey değeri (13 sonrası 1'e sarar; gösterge yoksa null). */
  okeyValue: number | null;
  /** Bu eli dağıtan/başlatan koltuk. */
  dealerSeat: OkeySeatPosition;
  /** Kaçıncı el (1'den başlar). */
  roundNo: number;
}
