// Ahenk 101 — Görev 7 (Faz 1): "seri aç" / "çift aç" için ilk gerçek
// validasyon + açma önizlemesi (saf mantık, frontend-only, mock).
//
// Backend/Supabase/socket/Colyseus YOK. Puanlama/oyun bitirme burada TAM
// yapılmaz — sadece "elimle şu an seri/çift açabilir miyim?" sorusuna cevap
// veren saf, test edilebilir fonksiyonlar.
//
// ÖNEMLİ — bu dosya lib/game101/handAnalysis.ts'ten BAĞIMSIZDIR ve onu
// import ETMEZ. handAnalysis.ts'teki findRunCandidates/findSetCandidates
// SADECE GÖRSEL ipucu içindir ve isFakeOkey (fiziksel joker) taşları
// "boşluk doldurucu" olarak kullanır — o dosyanın kuralı BURADA GEÇERSİZDİR.
//
// Bu dosyadaki KESİN terminoloji (ters yazılmasın):
// - isFakeOkey=true taş  → SABİT taş gibi davranır: {color: okeyColor,
//   value: okeyValue} imiş gibi (serbest wildcard DEĞİLDİR — belirli bir
//   renk/değere sabitlenmiş normal taş muamelesi görür).
// - isOkey=true taş      → SERBEST joker/wildcard'dır: herhangi bir run/
//   set/pair'de ihtiyaç duyulan HERHANGİ BİR renk/değeri temsil edebilir.

import type { OkeyGameTile, OkeyTileColor } from "./gameTypes";

export type OkeyMeldType = "run" | "set" | "pair";

export interface OkeyMeld {
  id: string;
  type: OkeyMeldType;
  tiles: OkeyGameTile[];
  score: number;
  isValid: boolean;
  label: string;
}

export interface OpenValidationResult {
  canOpen: boolean;
  totalScore: number;
  melds: OkeyMeld[];
  reason: string;
}

/** İlk seri/set açma için gereken minimum toplam puan. */
export const MIN_OPEN_SCORE = 101;

/** İlk çift açma için gereken minimum çift sayısı (ileride ayarlanabilir). */
export const MIN_PAIRS_TO_OPEN = 5;

const COLOR_NAME_TR: Record<Exclude<OkeyTileColor, "joker">, string> = {
  red: "Kırmızı",
  blue: "Mavi",
  black: "Siyah",
  yellow: "Sarı",
};

let meldUid = 0;
function nextMeldId(prefix: string): string {
  meldUid += 1;
  return `${prefix}-${meldUid}`;
}

/** Bir taş fiziksel joker mi (destede sabit "OKEY" baskılı taş)? */
function isPhysicalJoker(tile: OkeyGameTile): boolean {
  return Boolean(tile.isFakeOkey);
}

/** Bir taş "gerçek okey" mi (serbest wildcard)? */
function isRealOkeyWildcard(tile: OkeyGameTile): boolean {
  return Boolean(tile.isOkey);
}

// ---------------------------------------------------------------------------
// Ortak: elde okeyColor/okeyValue geçerliyse taşları 3 kovaya ayır.
// ---------------------------------------------------------------------------

interface BucketedHand {
  /** Serbest wildcard (isOkey=true) taşlar — herhangi bir renk/değeri doldurabilir. */
  wildcards: OkeyGameTile[];
  /** Fiziksel joker (isFakeOkey) taşlar — sabit {okeyColor,okeyValue} gibi davranır. */
  fixedJokers: OkeyGameTile[];
  /** Geri kalan sıradan taşlar (kendi renk/değeriyle). */
  normals: OkeyGameTile[];
}

function bucketHand(hand: OkeyGameTile[]): BucketedHand {
  const wildcards: OkeyGameTile[] = [];
  const fixedJokers: OkeyGameTile[] = [];
  const normals: OkeyGameTile[] = [];

  for (const tile of hand) {
    if (isRealOkeyWildcard(tile)) {
      wildcards.push(tile);
    } else if (isPhysicalJoker(tile)) {
      fixedJokers.push(tile);
    } else {
      normals.push(tile);
    }
  }

  return { wildcards, fixedJokers, normals };
}

// ---------------------------------------------------------------------------
// RUN (seri) adayları
// ---------------------------------------------------------------------------

/** Bir run/set slotunu dolduran taş + o slotun "etkin" (temsil ettiği) değeri. */
interface FilledSlot {
  tile: OkeyGameTile;
  effectiveColor: Exclude<OkeyTileColor, "joker">;
  effectiveValue: number;
  /** Bu slotu bir wildcard (isOkey) mı doldurdu? */
  filledByWildcard: boolean;
}

interface MeldCandidate {
  type: OkeyMeldType;
  slots: FilledSlot[];
}

/**
 * Aynı renkten ardışık en az 3 taş içeren run adaylarını üretir. Fiziksel
 * jokerler (isFakeOkey) SABİT {okeyColor,okeyValue} taş gibi davrandığından
 * yalnızca okeyColor ile aynı renkteki run'larda normal taş gibi yer alır
 * (wildcard DEĞİLDİR — boşluk doldurmaz). Serbest wildcard'lar (isOkey)
 * eksik halkaları doldurabilir.
 *
 * Basit/greedy: her renk için, mevcut değerlerin kapladığı aralıkta olası
 * tüm ardışık blokları (gerekirse wildcard ile boşluk doldurularak) üretir.
 * Mükemmel optimum şart değil — sonradan en yüksek toplam puanlı, çakışmayan
 * kombinasyon seçilecek.
 */
function findRunMeldCandidates(
  bucketed: BucketedHand,
  okeyColor: Exclude<OkeyTileColor, "joker">,
  okeyValue: number,
): MeldCandidate[] {
  const availableWildcards = bucketed.wildcards.length;

  // Renklere göre grupla: normal taşlar + (okeyColor ise) fiziksel jokerler.
  const byColor = new Map<Exclude<OkeyTileColor, "joker">, Map<number, OkeyGameTile>>();

  for (const tile of bucketed.normals) {
    const color = tile.color as Exclude<OkeyTileColor, "joker">;
    let valueMap = byColor.get(color);
    if (!valueMap) {
      valueMap = new Map();
      byColor.set(color, valueMap);
    }
    if (!valueMap.has(tile.value)) valueMap.set(tile.value, tile);
  }

  // Fiziksel jokerleri okeyColor rengine, okeyValue değerine sabit taş
  // olarak ekle (o değerde zaten normal bir taş yoksa).
  if (bucketed.fixedJokers.length > 0) {
    let valueMap = byColor.get(okeyColor);
    if (!valueMap) {
      valueMap = new Map();
      byColor.set(okeyColor, valueMap);
    }
    // Fiziksel joker(ler)i ayrı "sanal değerler" olarak temsil edemeyiz
    // (aynı value'da olurlar) — bu yüzden run inşasında value başına en
    // fazla 1 temsilci kullanılabildiğinden, eğer okeyValue zaten normal bir
    // taşla doluysa fiziksel joker o run'da "ikinci kopya" gibi ayrı bir
    // aday üretmez (basitleştirme — greedy fazda kabul edilebilir).
    if (!valueMap.has(okeyValue)) {
      valueMap.set(okeyValue, bucketed.fixedJokers[0]);
    }
  }

  const candidates: MeldCandidate[] = [];

  Array.from(byColor.entries()).forEach(([color, valueMap]) => {
    const values = Array.from(valueMap.keys()).sort((a, b) => a - b);
    if (values.length === 0) return;

    const minV = values[0];
    const maxV = values[values.length - 1];

    for (let start = minV; start <= maxV; start += 1) {
      if (!valueMap.has(start)) continue;

      let wildcardUsed = 0;
      const slots: FilledSlot[] = [];
      const startTile = valueMap.get(start) as OkeyGameTile;
      slots.push({
        tile: startTile,
        effectiveColor: color,
        effectiveValue: start,
        filledByWildcard: false,
      });

      let v = start + 1;
      while (v <= 13) {
        if (valueMap.has(v)) {
          slots.push({
            tile: valueMap.get(v) as OkeyGameTile,
            effectiveColor: color,
            effectiveValue: v,
            filledByWildcard: false,
          });
          v += 1;
          continue;
        }
        if (wildcardUsed < availableWildcards) {
          slots.push({
            tile: bucketed.wildcards[wildcardUsed],
            effectiveColor: color,
            effectiveValue: v,
            filledByWildcard: true,
          });
          wildcardUsed += 1;
          v += 1;
          continue;
        }
        break;
      }

      if (slots.length >= 3) {
        candidates.push({ type: "run", slots });
      }
    }
  });

  return candidates;
}

// ---------------------------------------------------------------------------
// SET adayları
// ---------------------------------------------------------------------------

/**
 * Aynı sayıdan farklı renklerden en az 3 taş içeren set adaylarını üretir.
 * Fiziksel jokerler (isFakeOkey) SABİT {okeyColor,okeyValue} taş gibi
 * davrandığından yalnızca value===okeyValue setlerinde (okeyColor rengini
 * temsilen) yer alabilir. Serbest wildcard'lar (isOkey) eksik renkleri
 * doldurabilir (en fazla 4 renk olduğundan bir set'te aynı wildcard havuzu
 * paylaşılır).
 */
function findSetMeldCandidates(
  bucketed: BucketedHand,
  okeyColor: Exclude<OkeyTileColor, "joker">,
  okeyValue: number,
): MeldCandidate[] {
  const ALL_COLORS: Exclude<OkeyTileColor, "joker">[] = ["red", "blue", "black", "yellow"];
  const availableWildcards = bucketed.wildcards.length;

  // value -> renk -> taş (round 0), ikinci kopya varsa round 1 için de sakla.
  const byValue = new Map<number, Map<Exclude<OkeyTileColor, "joker">, OkeyGameTile[]>>();

  for (const tile of bucketed.normals) {
    const color = tile.color as Exclude<OkeyTileColor, "joker">;
    let colorMap = byValue.get(tile.value);
    if (!colorMap) {
      colorMap = new Map();
      byValue.set(tile.value, colorMap);
    }
    const list = colorMap.get(color);
    if (list) {
      list.push(tile);
    } else {
      colorMap.set(color, [tile]);
    }
  }

  // Fiziksel jokerleri okeyValue setine, okeyColor temsilcisi olarak ekle
  // (o renk/değerde zaten normal taş yoksa).
  if (bucketed.fixedJokers.length > 0) {
    let colorMap = byValue.get(okeyValue);
    if (!colorMap) {
      colorMap = new Map();
      byValue.set(okeyValue, colorMap);
    }
    if (!colorMap.has(okeyColor)) {
      colorMap.set(okeyColor, [bucketed.fixedJokers[0]]);
    }
  }

  const candidates: MeldCandidate[] = [];

  Array.from(byValue.entries()).forEach(([value, colorMap]) => {
    // En fazla 2 tur (deste 2 kopyalı) — her turda mevcut renklerden 1'er
    // taş + eksik renkleri wildcard ile doldurmayı dene.
    for (let round = 0; round < 2; round += 1) {
      const presentColors: Exclude<OkeyTileColor, "joker">[] = [];
      const slots: FilledSlot[] = [];

      for (const color of ALL_COLORS) {
        const list = colorMap.get(color);
        if (list && list.length > round) {
          presentColors.push(color);
          slots.push({
            tile: list[round],
            effectiveColor: color,
            effectiveValue: value,
            filledByWildcard: false,
          });
        }
      }

      if (presentColors.length === 0) continue;

      const missingColors = ALL_COLORS.filter((c) => !presentColors.includes(c));
      let wildcardUsed = 0;
      for (const missingColor of missingColors) {
        if (slots.length >= 4) break; // set en fazla 4 taş (4 renk).
        if (wildcardUsed >= availableWildcards) break;
        slots.push({
          tile: bucketed.wildcards[wildcardUsed],
          effectiveColor: missingColor,
          effectiveValue: value,
          filledByWildcard: true,
        });
        wildcardUsed += 1;
      }

      if (slots.length >= 3) {
        candidates.push({ type: "set", slots });
      }
    }
  });

  return candidates;
}

// ---------------------------------------------------------------------------
// Greedy seçim: çakışmayan (taş/wildcard paylaşımı olmayan), toplam puanı en
// yüksek run+set kombinasyonunu seç.
// ---------------------------------------------------------------------------

function meldCandidateScore(slots: FilledSlot[]): number {
  return slots.reduce((sum, slot) => sum + slot.effectiveValue, 0);
}

function colorLabelTr(color: Exclude<OkeyTileColor, "joker">): string {
  return COLOR_NAME_TR[color];
}

function buildRunLabel(slots: FilledSlot[]): string {
  const color = colorLabelTr(slots[0].effectiveColor);
  const first = slots[0].effectiveValue;
  const last = slots[slots.length - 1].effectiveValue;
  return `${color} Seri (${first}-${last})`;
}

function buildSetLabel(slots: FilledSlot[]): string {
  const value = slots[0].effectiveValue;
  return `${value} Seti`;
}

function toMeld(candidate: MeldCandidate): OkeyMeld {
  const score = meldCandidateScore(candidate.slots);
  const tiles = candidate.slots.map((s) => s.tile);
  const label = candidate.type === "run" ? buildRunLabel(candidate.slots) : buildSetLabel(candidate.slots);
  const idPrefix = candidate.type === "run" ? "run" : "set";

  return {
    id: nextMeldId(idPrefix),
    type: candidate.type,
    tiles,
    score,
    isValid: true,
    label,
  };
}

/**
 * Her taş/wildcard yalnızca 1 kez kullanılabilir kısıtıyla, verilen
 * adaylardan (puana göre büyükten küçüğe sıralanmış, sırayla eklenmiş,
 * çakışan atlanmış) greedy bir kombinasyon seçer. Mükemmel optimum şart
 * değil — temiz/anlaşılır greedy yeterli.
 */
function greedySelectNonConflicting(candidates: MeldCandidate[]): MeldCandidate[] {
  const sorted = [...candidates].sort((a, b) => meldCandidateScore(b.slots) - meldCandidateScore(a.slots));

  const usedTileIds = new Set<string>();
  const selected: MeldCandidate[] = [];

  for (const candidate of sorted) {
    const tileIds = candidate.slots.map((s) => s.tile.id);
    const hasConflict = tileIds.some((id) => usedTileIds.has(id));
    if (hasConflict) continue;

    for (const id of tileIds) usedTileIds.add(id);
    selected.push(candidate);
  }

  return selected;
}

/**
 * Run + Set adaylarının tümünü (greedy) bulur, taş/wildcard çakışması
 * olmayan en yüksek toplam puanlı kombinasyonu seçer. İlk seri açma toplamı
 * en az MIN_OPEN_SCORE (101) olmalıdır.
 *
 * okeyColor veya okeyValue null ise: hiçbir taş wildcard/sabit-taş olarak
 * işlenmez (yalnızca kendi gerçek renk/değeriyle normal taş sayılır) — bu
 * fazda pratikte run/set üretimi için okeyColor/okeyValue şart olduğundan,
 * null durumunda fonksiyon çökmeden boş sonuç döner.
 */
export function evaluateRunOpen(
  hand: OkeyGameTile[],
  okeyColor: OkeyTileColor | null,
  okeyValue: number | null,
): OpenValidationResult {
  if (okeyColor == null || okeyValue == null || okeyColor === "joker") {
    return {
      canOpen: false,
      totalScore: 0,
      melds: [],
      reason: "Gösterge henüz açılmadı, okey rengi/değeri belirlenmedi.",
    };
  }

  const safeOkeyColor = okeyColor as Exclude<OkeyTileColor, "joker">;
  const bucketed = bucketHand(hand);

  const runCandidates = findRunMeldCandidates(bucketed, safeOkeyColor, okeyValue);
  const setCandidates = findSetMeldCandidates(bucketed, safeOkeyColor, okeyValue);
  const allCandidates = [...runCandidates, ...setCandidates];

  if (allCandidates.length === 0) {
    return {
      canOpen: false,
      totalScore: 0,
      melds: [],
      reason: "Elde açmaya uygun seri veya set adayı bulunamadı.",
    };
  }

  const selected = greedySelectNonConflicting(allCandidates);
  const melds = selected.map(toMeld);
  const totalScore = melds.reduce((sum, m) => sum + m.score, 0);
  const canOpen = totalScore >= MIN_OPEN_SCORE;

  const reason = canOpen
    ? `Toplam ${totalScore} puan ile açma eşiği (${MIN_OPEN_SCORE}) sağlandı.`
    : `Toplam ${totalScore} puan, açma eşiğinin (${MIN_OPEN_SCORE}) altında.`;

  return { canOpen, totalScore, melds, reason };
}

// ---------------------------------------------------------------------------
// PAIR (çift) açma
// ---------------------------------------------------------------------------

function buildPairLabel(color: Exclude<OkeyTileColor, "joker">, value: number): string {
  return `${colorLabelTr(color)} ${value} Çifti`;
}

/**
 * Aynı renk + aynı sayıdan 2 taş bir çift sayılır. Fiziksel jokerler
 * (isFakeOkey) SABİT {okeyColor,okeyValue} taş gibi davrandığından diğer
 * taşlarla/birbirleriyle eşleşebilir (2 fiziksel joker birbiriyle de çift
 * olabilir). Serbest wildcard'lar (isOkey) herhangi bir tek kalmış taşla
 * eşleşip çift TAMAMLAYABİLİR. Her taş yalnızca 1 çiftte kullanılabilir.
 *
 * totalScore bu fonksiyonda ÇİFT SAYISINI temsil eder (melds.length ile
 * birebir aynı). canOpen = totalScore >= MIN_PAIRS_TO_OPEN.
 *
 * okeyColor veya okeyValue null ise: fiziksel jokerler sabit taş olarak
 * işlenemeyeceğinden (sabitlenecek renk/değer yok) çift oluşturmada
 * KULLANILMAZ; wildcard (isOkey) zaten bu durumda pratikte hiç var
 * olamayacağından etkisizdir. Fonksiyon çökmeden normal taşlar üzerinden
 * çift arar.
 */
export function evaluatePairOpen(
  hand: OkeyGameTile[],
  okeyColor: OkeyTileColor | null,
  okeyValue: number | null,
): OpenValidationResult {
  const bucketed = bucketHand(hand);
  const hasResolvedOkey = okeyColor != null && okeyValue != null && okeyColor !== "joker";
  const safeOkeyColor = hasResolvedOkey ? (okeyColor as Exclude<OkeyTileColor, "joker">) : null;
  const safeOkeyValue = hasResolvedOkey ? (okeyValue as number) : null;

  // Aynı renk+value normal taşları grupla.
  const groups = new Map<string, OkeyGameTile[]>();
  for (const tile of bucketed.normals) {
    const key = `${tile.color}-${tile.value}`;
    const group = groups.get(key);
    if (group) {
      group.push(tile);
    } else {
      groups.set(key, [tile]);
    }
  }

  // Fiziksel jokerleri (varsa, okey çözülmüşse) okeyColor/okeyValue
  // grubuna sabit taş olarak ekle.
  if (safeOkeyColor != null && safeOkeyValue != null && bucketed.fixedJokers.length > 0) {
    const key = `${safeOkeyColor}-${safeOkeyValue}`;
    const group = groups.get(key);
    if (group) {
      group.push(...bucketed.fixedJokers);
    } else {
      groups.set(key, [...bucketed.fixedJokers]);
    }
  }

  const melds: OkeyMeld[] = [];
  const leftoverSingles: OkeyGameTile[] = [];

  Array.from(groups.entries()).forEach(([key, group]) => {
    const [color, valueStr] = key.split("-");
    const value = Number(valueStr);
    const effColor = color as Exclude<OkeyTileColor, "joker">;

    // Grubu ikişerli çiftlere böl (varsa 3-4 taş: 2 kopya normal + fiziksel
    // joker(ler) gibi durumlarda birden fazla çift çıkabilir).
    let idx = 0;
    while (idx + 1 < group.length) {
      const pairTiles = [group[idx], group[idx + 1]];
      melds.push({
        id: nextMeldId("pair"),
        type: "pair",
        tiles: pairTiles,
        score: value * 2,
        isValid: true,
        label: buildPairLabel(effColor, value),
      });
      idx += 2;
    }
    if (idx < group.length) {
      leftoverSingles.push(group[idx]);
    }
  });

  // Kalan tek taşları wildcard (isOkey) ile tamamla. `single` bir fiziksel
  // joker (isFakeOkey) olabilir — bu durumda kendi ham {color:"joker",
  // value:0} alanları DEĞİL, sabitlendiği {safeOkeyColor, safeOkeyValue}
  // etkin kimliği kullanılmalı (aksi halde "undefined 0 Çifti" gibi bozuk
  // bir etiket ve yanlış (0) skor üretilir). single fiziksel jokerse
  // hasResolvedOkey kesinlikle true'dur (fiziksel jokerler yalnızca
  // hasResolvedOkey true iken bir gruba eklenir), bu yüzden
  // safeOkeyColor/safeOkeyValue burada güvenle kullanılabilir.
  const availableWildcards = [...bucketed.wildcards];
  for (const single of leftoverSingles) {
    if (availableWildcards.length === 0) break;
    const wildcard = availableWildcards.shift() as OkeyGameTile;
    const isSingleFixedJoker = isPhysicalJoker(single);
    const effColor = isSingleFixedJoker
      ? (safeOkeyColor as Exclude<OkeyTileColor, "joker">)
      : (single.color as Exclude<OkeyTileColor, "joker">);
    const effValue = isSingleFixedJoker ? (safeOkeyValue as number) : single.value;
    melds.push({
      id: nextMeldId("pair"),
      type: "pair",
      tiles: [single, wildcard],
      score: effValue * 2,
      isValid: true,
      label: buildPairLabel(effColor, effValue),
    });
  }

  const totalScore = melds.length;
  const canOpen = totalScore >= MIN_PAIRS_TO_OPEN;
  const reason = canOpen
    ? `${totalScore} çift bulundu, açma eşiği (${MIN_PAIRS_TO_OPEN}) sağlandı.`
    : `${totalScore} çift bulundu, açma eşiğinin (${MIN_PAIRS_TO_OPEN}) altında.`;

  return { canOpen, totalScore, melds, reason };
}
