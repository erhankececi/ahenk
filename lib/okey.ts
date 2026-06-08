// Ahenk — 101 Okey motoru (Faz 2a: dağıtım/gösterge/okey/sıra/çek-at).
// Taş kodu: "c-n" (c=renk 0-3, n=1-13) ya da "fj" (sahte okey/joker).
// Sunucu-otoriter: tüm durum JSON; istemciye yalnız kendi eli açılır.

export type Tile = { id: string; code: string };
export type Phase = "draw" | "discard";

export type OkeyState = {
  seats: number[];                 // oyun sırası (koltuk no)
  hands: Record<number, Tile[]>;   // koltuk → el (gizli)
  deck: Tile[];                    // çekme yığını
  discards: Record<number, Tile[]>;// koltuk → attığı taşlar (son = üst)
  gosterge: Tile;                  // gösterge taşı
  okey: string;                    // okey kodu (joker)
  turn: number;                    // sıradaki koltuk
  phase: Phase;                    // çekme mi atma mı
  started: boolean;
  finishedBy: number | null;       // bitiren koltuk (faz 2b)
};

const COLORS = [0, 1, 2, 3];

function shuffle<T>(a: T[]): T[] {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildDeck(): Tile[] {
  const tiles: Tile[] = [];
  let id = 0;
  for (const c of COLORS) {
    for (let n = 1; n <= 13; n++) {
      tiles.push({ id: `t${id++}`, code: `${c}-${n}` });
      tiles.push({ id: `t${id++}`, code: `${c}-${n}` });
    }
  }
  tiles.push({ id: `t${id++}`, code: "fj" });
  tiles.push({ id: `t${id++}`, code: "fj" });
  return shuffle(tiles);
}

// Okey = göstergenin bir üstü (aynı renk, 13→1). Sahte okey (fj) de okey yerine geçer.
export function okeyOf(gosterge: Tile): string {
  const [c, n] = gosterge.code.split("-").map(Number);
  const nn = n === 13 ? 1 : n + 1;
  return `${c}-${nn}`;
}

export function isOkey(code: string, okey: string): boolean {
  return code === "fj" || code === okey;
}

// Dağıtım: gösterge sayısal bir taş; başlayan 15, diğerleri 14 taş alır.
export function deal(seats: number[]): OkeyState {
  const deck = buildDeck();
  // gösterge sahte okey olmasın
  let gi = deck.findIndex((t) => t.code !== "fj");
  const gosterge = deck.splice(gi, 1)[0];
  const okey = okeyOf(gosterge);

  const hands: Record<number, Tile[]> = {};
  const discards: Record<number, Tile[]> = {};
  const starter = seats[0];
  for (const s of seats) {
    const count = s === starter ? 15 : 14;
    hands[s] = deck.splice(0, count);
    discards[s] = [];
  }
  return {
    seats, hands, deck, discards, gosterge, okey,
    turn: starter, phase: "discard", started: true, finishedBy: null,
  };
}

function nextSeat(state: OkeyState, seat: number): number {
  const i = state.seats.indexOf(seat);
  return state.seats[(i + 1) % state.seats.length];
}

// Taş çek: deck'ten ya da SOLDAKİ oyuncunun attığı son taştan.
export function draw(state: OkeyState, seat: number, source: "deck" | "discard"): { ok: boolean; error?: string } {
  if (!state.started || state.finishedBy != null) return { ok: false, error: "oyun_yok" };
  if (state.turn !== seat) return { ok: false, error: "sira_degil" };
  if (state.phase !== "draw") return { ok: false, error: "once_at" };
  if (source === "deck") {
    if (state.deck.length === 0) return { ok: false, error: "deste_bitti" };
    state.hands[seat].push(state.deck.shift()!);
  } else {
    const prev = state.seats[(state.seats.indexOf(seat) - 1 + state.seats.length) % state.seats.length];
    const pile = state.discards[prev];
    if (!pile || pile.length === 0) return { ok: false, error: "atilan_yok" };
    state.hands[seat].push(pile.pop()!);
  }
  state.phase = "discard";
  return { ok: true };
}

// Taş at: elinden bir taşı kendi atılanına koyar, sıra sonraki oyuncuya geçer.
export function discard(state: OkeyState, seat: number, tileId: string): { ok: boolean; error?: string } {
  if (!state.started || state.finishedBy != null) return { ok: false, error: "oyun_yok" };
  if (state.turn !== seat) return { ok: false, error: "sira_degil" };
  if (state.phase !== "discard") return { ok: false, error: "once_cek" };
  const hand = state.hands[seat];
  const idx = hand.findIndex((t) => t.id === tileId);
  if (idx < 0) return { ok: false, error: "tas_yok" };
  const [tile] = hand.splice(idx, 1);
  state.discards[seat].push(tile);
  state.turn = nextSeat(state, seat);
  state.phase = "draw";
  return { ok: true };
}

// İstemciye gönderilecek redakte görünüm (yalnız kendi elin görünür).
export function viewFor(state: OkeyState, seat: number) {
  return {
    started: state.started,
    turn: state.turn,
    phase: state.phase,
    deckCount: state.deck.length,
    gosterge: state.gosterge,
    okey: state.okey,
    finishedBy: state.finishedBy,
    yourSeat: seat,
    yourHand: state.hands[seat] || [],
    seats: state.seats.map((s) => ({
      seat: s,
      handCount: (state.hands[s] || []).length,
      topDiscard: state.discards[s]?.[state.discards[s].length - 1] || null,
      discardCount: state.discards[s]?.length || 0,
    })),
  };
}
