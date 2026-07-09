// Ahenk 101 — Görev 5: gösterge + okey taşı + gerçek dağıtım mantığı (mock,
// frontend-only, saf fonksiyonlar).
//
// Gerçek 101 kuralları (seri/çift açma kontrolü, bitiş hesaplama, puanlama)
// burada YOK. Backend/Supabase/socket/Colyseus YOK. Sadece local mock state +
// tipler + test edilebilir saf fonksiyonlar.

import type {
  OkeyGamePhase,
  OkeyGamePlayer,
  OkeyGameState,
  OkeyGameTile,
  OkeySeatPosition,
  OkeyTileColor,
} from "./gameTypes";

const COLORS: Exclude<OkeyTileColor, "joker">[] = ["red", "blue", "black", "yellow"];

const COLOR_NAME_TR: Record<Exclude<OkeyTileColor, "joker">, string> = {
  red: "kırmızı",
  blue: "mavi",
  black: "siyah",
  yellow: "sarı",
};

let tileUid = 0;
function nextTileId(): string {
  tileUid += 1;
  return `okey-tile-${tileUid}`;
}

/**
 * Klasik 101 destesi: 4 renk x (1-13) x 2 kopya + 2 fiziksel joker taşı
 * (toplam 106 taş). Fiziksel joker taşları isFakeOkey=true olarak işaretlenir
 * (bunlar destede sabit, hep joker olan "OKEY" baskılı taşlardır — "gerçek
 * okey" ise ayrı bir kavramdır ve gösterge açıldıktan SONRA markOkeyTiles ile
 * hesaplanır).
 */
export function createTileSet(): OkeyGameTile[] {
  const deck: OkeyGameTile[] = [];

  for (const color of COLORS) {
    for (let value = 1; value <= 13; value += 1) {
      deck.push({ id: nextTileId(), color, value });
      deck.push({ id: nextTileId(), color, value });
    }
  }

  deck.push({ id: nextTileId(), color: "joker", value: 0, isFakeOkey: true });
  deck.push({ id: nextTileId(), color: "joker", value: 0, isFakeOkey: true });

  return deck;
}

/** Fisher-Yates shuffle — mutasyonsuz (yeni dizi döner). */
export function shuffleTiles<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export interface PickIndicatorResult {
  indicator: OkeyGameTile;
  remainingDeck: OkeyGameTile[];
}

/**
 * Karıştırılmış desteden fiziksel joker (isFakeOkey) OLMAYAN ilk taşı
 * gösterge olarak seçer. Deste ve gösterge ayrı ayrı döner; gösterge
 * remainingDeck içinde YER ALMAZ.
 */
export function pickIndicatorTile(deck: OkeyGameTile[]): PickIndicatorResult {
  const indicatorIndex = deck.findIndex((tile) => !tile.isFakeOkey);
  if (indicatorIndex === -1) {
    throw new Error("pickIndicatorTile: destede joker olmayan taş bulunamadı.");
  }

  const indicator = deck[indicatorIndex];
  const remainingDeck = [...deck.slice(0, indicatorIndex), ...deck.slice(indicatorIndex + 1)];

  return { indicator, remainingDeck };
}

export interface ResolvedOkey {
  color: Exclude<OkeyTileColor, "joker">;
  value: number;
}

/**
 * Gösterge taşından okey rengini/değerini hesaplar: aynı renk, değer
 * göstergeden 1 fazla (13 ise 1'e sarar). Gösterge asla joker olmadığından
 * indicator.color her zaman gerçek bir renktir.
 */
export function resolveOkeyFromIndicator(indicator: OkeyGameTile): ResolvedOkey {
  if (indicator.color === "joker") {
    throw new Error("resolveOkeyFromIndicator: gösterge taşı joker olamaz.");
  }

  const value = indicator.value === 13 ? 1 : indicator.value + 1;
  return { color: indicator.color, value };
}

/**
 * Destedeki (color===okeyColor && value===okeyValue) olan NORMAL taşları
 * isOkey=true olarak işaretler (immutable — yeni dizi döner). Joker
 * (isFakeOkey) taşlara dokunmaz.
 */
export function markOkeyTiles(
  deck: OkeyGameTile[],
  okeyColor: Exclude<OkeyTileColor, "joker">,
  okeyValue: number,
): OkeyGameTile[] {
  return deck.map((tile) => {
    if (tile.isFakeOkey) return tile;
    if (tile.color === okeyColor && tile.value === okeyValue) {
      return { ...tile, isOkey: true };
    }
    return tile;
  });
}

const SEATS: OkeySeatPosition[] = ["bottom", "top", "left", "right"];

export interface DealResult {
  hands: Record<OkeySeatPosition, OkeyGameTile[]>;
  discardPile: OkeyGameTile[];
  drawPile: OkeyGameTile[];
}

/**
 * Kalan (gösterge çıkarılmış, okey işaretlenmiş) desteyi KARIŞTIRMADAN
 * sırayla dağıtır: bottom 21, top/left/right 14'er, 1 taş discardPile'a,
 * kalan drawPile'a gider.
 */
export function dealInitialHands(deck: OkeyGameTile[]): DealResult {
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

  return { hands, discardPile, drawPile };
}

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
  dealerSeat?: OkeySeatPosition;
  roundNo?: number;
}

/**
 * Yeni bir mock oyun state'i kurar: desteyi karıştırır, gösterge taşını
 * seçer, okeyi gösterge'den hesaplar, gerçek okey taşlarını işaretler,
 * kalan 105 taştan 4 koltuğa dağıtır (bottom/ben 21 taş, diğerleri 14'er
 * taş — klasik 101 dağılımı), bir taşı açık atılan alana koyar, sırayı bana
 * (bottom) verir.
 */
export function buildMockGameState(options: BuildMockGameStateOptions = {}): OkeyGameState {
  const {
    roomId = "prototip",
    roomName = "Prototip Masası",
    phase = "playing",
    turnDurationSec = 30,
    dealerSeat = "bottom",
    roundNo = 1,
  } = options;

  const shuffled = shuffleTiles(createTileSet());
  const { indicator, remainingDeck } = pickIndicatorTile(shuffled);
  const { color: okeyColor, value: okeyValue } = resolveOkeyFromIndicator(indicator);
  const markedDeck = markOkeyTiles(remainingDeck, okeyColor, okeyValue);
  const { hands, discardPile, drawPile } = dealInitialHands(markedDeck);

  const lastAction = `Gösterge açıldı: ${COLOR_NAME_TR[okeyColor]} ${indicator.value}. Okey: ${COLOR_NAME_TR[okeyColor]} ${okeyValue}.`;

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
    lastAction,
    turnStartedAt: Date.now(),
    turnDurationSec,
    indicatorTile: indicator,
    okeyColor,
    okeyValue,
    dealerSeat,
    roundNo,
    openedMelds: [],
    myOpenType: "none",
    hasOpened: false,
  };
}
