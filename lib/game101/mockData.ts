import type { GameState, Player, Tile, TileColor } from "./types";

function colorForValue(value: number): TileColor {
  if (value <= 4) return "red";
  if (value <= 7) return "blue";
  if (value <= 10) return "gold";
  return "navy";
}

let uid = 0;
function makeTile(value: number, isJoker = false): Tile {
  uid += 1;
  return {
    id: `t-${uid}-${value}-${isJoker ? "j" : "n"}`,
    value: isJoker ? 0 : value,
    color: isJoker ? "gold" : colorForValue(value),
    isJoker,
  };
}

/** Sabit + hafif rastgele 21 taşlık demo ıstaka (2 sıra x ~11) — 2 joker dahil. */
export function buildMockRack(): Tile[] {
  const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 1, 3, 5, 7, 9, 11];
  const tiles = values.map((v) => makeTile(v));
  tiles.splice(6, 0, makeTile(0, true));
  tiles.push(makeTile(0, true));
  return tiles;
}

export const MOCK_PLAYERS: Player[] = [
  {
    id: "me",
    name: "Sen",
    city: "İstanbul",
    seat: "bottom",
    tileCount: 21,
    isActiveTurn: true,
    bio: "101 tutkunu, hafta sonları masa başından kalkmam.",
    interests: ["101", "Satranç", "Kahve"],
  },
  {
    id: "p-top",
    name: "Murat K.",
    city: "Ankara",
    seat: "top",
    tileCount: 21,
    bio: "Emekli mühendis, akşamları arkadaşlarla 101 keyfi.",
    interests: ["101", "Bahçecilik", "Tarih"],
  },
  {
    id: "p-left",
    name: "Selin A.",
    city: "İzmir",
    seat: "left",
    tileCount: 21,
    bio: "Deniz kenarında büyüdüm, oyun geceleri vazgeçilmezim.",
    interests: ["Yüzme", "101", "Müzik"],
  },
  {
    id: "p-right",
    name: "Onur D.",
    city: "Bursa",
    seat: "right",
    tileCount: 21,
    bio: "İş çıkışı rahatlamanın en iyi yolu bir el 101.",
    interests: ["Sinema", "Kamp", "101"],
  },
];

export function buildMockGameState(): GameState {
  return {
    players: MOCK_PLAYERS,
    myTiles: buildMockRack(),
    drawPileCount: 47,
    discardTile: makeTile(9),
    currentTurnPlayerId: "me",
  };
}
