// Ahenk 101 — Görev 4: mock deste oluşturma + başlangıç dağıtımı.
//
// Gerçek 101 kuralları (açma kontrolü, çift kontrolü, puanlama, bitiş
// hesaplama) burada YOK. Sadece görsel/akış amaçlı, makul görünen bir
// başlangıç state'i üretilir.

import type {
  OkeyGamePhase,
  OkeyGamePlayer,
  OkeyGameState,
  OkeyGameTile,
  OkeySeatPosition,
  OkeyTileColor,
} from "./gameTypes";

const COLORS: Exclude<OkeyTileColor, "joker">[] = ["red", "blue", "black", "yellow"];

let tileUid = 0;
function nextTileId(): string {
  tileUid += 1;
  return `okey-tile-${tileUid}`;
}

/**
 * Klasik 101 destesi: 4 renk x (1-13) x 2 kopya + 2 fiziksel joker taşı
 * (toplam 106 taş). Kurallara göre "sahte okey" tespiti bu görevde YAPILMAZ
 * (isFakeOkey alanı burada set edilmez, ileride gerçek motor tarafından
 * doldurulabilir).
 */
function buildFullDeck(): OkeyGameTile[] {
  const deck: OkeyGameTile[] = [];

  for (const color of COLORS) {
    for (let value = 1; value <= 13; value += 1) {
      deck.push({ id: nextTileId(), color, value });
      deck.push({ id: nextTileId(), color, value });
    }
  }

  deck.push({ id: nextTileId(), color: "joker", value: 0, isOkey: true });
  deck.push({ id: nextTileId(), color: "joker", value: 0, isOkey: true });

  return deck;
}

/** Fisher-Yates shuffle — mutasyonsuz (yeni dizi döner). */
function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const SEATS: OkeySeatPosition[] = ["bottom", "top", "left", "right"];

function buildMockPlayers(): OkeyGamePlayer[] {
  const names: Record<OkeySeatPosition, { name: string; city: string }> = {
    bottom: { name: "Sen", city: "İstanbul" },
    top: { name: "Murat K.", city: "Ankara" },
    left: { name: "Selin A.", city: "İzmir" },
    right: { name: "Onur D.", city: "Bursa" },
  };

  return SEATS.map((seat) => ({
    id: seat === "bottom" ? "me" : `p-${seat}`,
    name: names[seat].name,
    city: names[seat].city,
    seat,
    isMe: seat === "bottom",
    isReady: true,
    isConnected: true,
    voiceState: "idle",
  }));
}

export interface BuildMockGameStateOptions {
  roomId?: string;
  roomName?: string;
  phase?: OkeyGamePhase;
  turnDurationSec?: number;
}

/**
 * Yeni bir mock oyun state'i kurar: desteyi karar, 4 koltuğa dağıtır
 * (bottom/ben 21 taş, diğerleri 14'er taş — klasik 101 dağılımı), bir
 * taşı açık atılan alana koyar, sırayı bana (bottom) verir.
 */
export function buildMockGameState(options: BuildMockGameStateOptions = {}): OkeyGameState {
  const {
    roomId = "prototip",
    roomName = "Prototip Masası",
    phase = "playing",
    turnDurationSec = 30,
  } = options;

  const deck = shuffle(buildFullDeck());

  const hands: Record<OkeySeatPosition, OkeyGameTile[]> = {
    bottom: [],
    top: [],
    left: [],
    right: [],
  };

  let cursor = 0;
  for (const seat of SEATS) {
    const count = seat === "bottom" ? 21 : 14;
    hands[seat] = deck.slice(cursor, cursor + count).map((tile) => ({ ...tile, owner: seat }));
    cursor += count;
  }

  const discardTop = deck[cursor];
  cursor += 1;
  const discardPile: OkeyGameTile[] = discardTop ? [{ ...discardTop, owner: undefined }] : [];

  const drawPile = deck.slice(cursor);

  return {
    roomId,
    roomName,
    phase,
    players: buildMockPlayers(),
    currentTurnSeat: "bottom",
    drawPile,
    discardPile,
    hands,
    selectedTileId: null,
    lastAction: "Taşlar dağıtıldı, sıra sende.",
    turnStartedAt: Date.now(),
    turnDurationSec,
  };
}
