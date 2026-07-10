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
//
// Görev 8 (Faz 1): OkeyMeld tipini burada TEKRAR TANIMLAMIYORUZ — tek doğru
// kaynak lib/game101/meldValidation.ts. Buradan yalnızca type-only import
// edilir (import type). meldValidation.ts da gameTypes.ts'ten type-only
// import yapıyor (OkeyGameTile/OkeyTileColor) — bu döngüsel type-only import
// TypeScript'te derleme zamanında tamamen elenir (erasable), tsc --noEmit
// hata vermez (bu görev sonunda doğrulandı).
//
// Görev 12 (Faz 1): aynı desende, RoundScoreResult tipi için
// lib/game101/scoring.ts'ten type-only import edilir. scoring.ts de
// gameTypes.ts'ten (OkeyGameState/OkeyGameTile/OkeySeatPosition/OkeyTileColor)
// type-only import yapıyor — bu döngüsel type-only import da Görev 8'deki
// gibi derleme zamanında tamamen elenir (tsc --noEmit ile doğrulandı).
//
// Görev 13 (Faz 1): aynı desende, OkeyGameEvent tipi için
// lib/game101/events.ts'ten type-only import edilir (events.ts de bu
// dosyadan yalnızca OkeySeatPosition'ı type-only import eder) — döngüsel
// type-only import, yukarıdakilerle aynı gerekçeyle derleme zamanında
// tamamen elenir.
import type { OkeyMeld } from "./meldValidation";
import type { RoundScoreResult } from "./scoring";
import type { OkeyGameEvent } from "./events";

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
  /**
   * Görev 8: Benim (bottom) açtığım seri/çift meld'leri. Bu meld'lerin
   * içindeki tiles, elden GERÇEKTEN çıkarılmış (id bazlı) taşların
   * kopyalarıdır. Bu fazda açılan taşlara ileri işlem (UI render, karşı
   * oyuncu ekleme vb.) YAPILMAZ — sadece state'te tutulur.
   */
  openedMelds: OkeyMeld[];
  /** Benim ilk açtığım tip ("none" = henüz açmadım). Bir kez run/pair olduktan sonra değişmez. */
  myOpenType: "none" | "run" | "pair";
  /** Benim (bottom) bu elde en az bir kez seri/çift açıp açmadığım. */
  hasOpened: boolean;
  /** Açtığım anda roundNo neydi (opsiyonel — debug/gelecekte kullanım için). */
  openedAtRoundNo?: number;
  /**
   * Görev 10 (Faz 1): eli bitiren koltuk. phase "roundEnded" olduğunda set
   * edilir; bu fazda yalnızca "bottom" (ben) BİTİR diyebildiğinden pratikte
   * hep "bottom" olur, ama tip ileride diğer koltuklar için de kullanılabilsin
   * diye OkeySeatPosition olarak tutulur.
   */
  winnerSeat?: OkeySeatPosition;
  /** Eli bitiren oyuncunun id'si (mock akışta "bottom" koltuğunun id'si "me"). */
  winnerPlayerId?: string;
  /** Elin bittiği epoch ms zamanı (Date.now()) — roundEnded overlay'de gösterilebilir. */
  finishedAt?: number;
  /** BİTİR ile atılan son taşın kendisi (owner temizlenmiş kopya) — overlay'de gösterilebilir. */
  finalDiscardTile?: OkeyGameTile;
  /**
   * Görev 12 (Faz 1): bu elin puanlama sonucu. phase "roundEnded" olduğunda
   * finishRound tarafından set edilir (lib/game101/scoring.ts —
   * calculateRoundScore). Round başlamadan/bitmeden önce undefined'dır.
   */
  roundScore?: RoundScoreResult;
  /**
   * Oyuncu id'sine göre KÜMÜLATİF (birden çok el boyunca biriken) toplam
   * skor. Bu görevde YAZILMIYOR ve OKUNMUYOR — yalnızca ileride çoklu-el
   * skor takibi eklenebilsin diye tip olarak hazırlanıyor.
   */
  totalScores?: Record<string, number>;
  /**
   * Görev 13 (Faz 1): lib/game101/gameReducer.ts'in applyGameCommand'ının
   * ürettiği son event. Yalnızca reducer üzerinden (BAŞARILI komutlarda)
   * güncellenir — bu fazda gameActions.ts/useOkeyGame.ts hâlâ bu alana hiç
   * dokunmaz, bu yüzden reducer üzerinden hiç geçilmemiş bir state'te
   * undefined kalır. Opsiyoneldir, zorunlu değildir.
   */
  lastEvent?: OkeyGameEvent;
  /**
   * Görev 13 (Faz 1): son N (en fazla 20) event'in KIRPILMIŞ geçmişi —
   * çok büyümesin diye reducer her ekleyişte .slice(-20) uygular. Aynı
   * şekilde yalnızca reducer üzerinden güncellenir, opsiyoneldir.
   */
  eventLog?: OkeyGameEvent[];
}
