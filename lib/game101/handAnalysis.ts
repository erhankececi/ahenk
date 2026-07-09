// Ahenk 101 — Görev 6: el düzenleme / basit grup algılama saf yardımcıları.
//
// Bu dosyadaki tüm fonksiyonlar SAF'tır: React/state'e bağımlı değildir,
// yalnızca OkeyGameTile[] alıp OkeyGameTile[] veya OkeyGameTile[][] döner,
// verilen diziyi MUTASYONA UĞRATMAZ (her zaman yeni dizi/nesne döner).
//
// Gerçek 101 açma validasyonu (seri/çift açma kontrolü, bitiş hesaplama,
// puanlama) burada YOK — sadece görsel dizme yardımcıları ve "aday grup"
// bulma (kural doğrulaması yapmayan, basit/greedy sezgisel yaklaşım).

import type { OkeyGameTile, OkeyTileColor } from "./gameTypes";

/** Dizme sırasında kullanılan renk önceliği (joker/fiziksel joker en sona). */
const COLOR_ORDER: Record<OkeyTileColor, number> = {
  red: 0,
  blue: 1,
  black: 2,
  yellow: 3,
  joker: 4,
};

/** Bir taş fiziksel joker mi (destede sabit "OKEY" baskılı taş)? */
function isPhysicalJoker(tile: OkeyGameTile): boolean {
  return Boolean(tile.isFakeOkey);
}

/**
 * Taşları renklerine göre (red, blue, black, yellow, sonra joker/fiziksel
 * jokerler en sona) ve her renk içinde value'ya göre artan sıralar.
 * Immutable — yeni bir dizi döner, verilen diziyi değiştirmez.
 */
export function sortByColorAndValue(tiles: OkeyGameTile[]): OkeyGameTile[] {
  return [...tiles].sort((a, b) => {
    const aJoker = isPhysicalJoker(a);
    const bJoker = isPhysicalJoker(b);
    if (aJoker !== bJoker) return aJoker ? 1 : -1;

    const colorDiff = COLOR_ORDER[a.color] - COLOR_ORDER[b.color];
    if (colorDiff !== 0) return colorDiff;

    return a.value - b.value;
  });
}

/**
 * Taşları value'ya göre artan sıralar (aynı value'daki taşlar renk sırasına
 * göre yan yana gelir). Fiziksel jokerler (isFakeOkey) EN SONA özel olarak
 * konur (value:0 olduklarından doğal sıralamada en başa düşerlerdi — bu
 * onları dağınık göstermemek için istenmeyen bir davranış olurdu).
 * Immutable.
 */
export function sortByValue(tiles: OkeyGameTile[]): OkeyGameTile[] {
  return [...tiles].sort((a, b) => {
    const aJoker = isPhysicalJoker(a);
    const bJoker = isPhysicalJoker(b);
    if (aJoker !== bJoker) return aJoker ? 1 : -1;

    const valueDiff = a.value - b.value;
    if (valueDiff !== 0) return valueDiff;

    return COLOR_ORDER[a.color] - COLOR_ORDER[b.color];
  });
}

/**
 * Aynı renk+value'dan TAM 2 taşı olan çiftleri baş tarafa, yan yana getirir;
 * eşi olmayan taşlar (tekler) sona, kendi aralarında value'ya (sonra renge)
 * göre sıralı kalır. Fiziksel jokerler (isFakeOkey) her zaman birbirinin
 * eşi sayılır: elde 2 tane varsa erken sırada bir çift oluştururlar (teklere
 * değil, çiftler grubuna dahil edilirler). Immutable.
 */
export function sortPairsFirst(tiles: OkeyGameTile[]): OkeyGameTile[] {
  const physicalJokers = tiles.filter(isPhysicalJoker);
  const normalTiles = tiles.filter((t) => !isPhysicalJoker(t));

  // Normal taşları renk+value anahtarına göre grupla.
  const groups = new Map<string, OkeyGameTile[]>();
  for (const tile of normalTiles) {
    const key = `${tile.color}-${tile.value}`;
    const group = groups.get(key);
    if (group) {
      group.push(tile);
    } else {
      groups.set(key, [tile]);
    }
  }

  const pairGroups: OkeyGameTile[][] = [];
  const singles: OkeyGameTile[] = [];

  Array.from(groups.values()).forEach((group) => {
    if (group.length === 2) {
      pairGroups.push(group);
    } else {
      singles.push(...group);
    }
  });

  // Çift gruplarını value'ya (sonra renge) göre sırala.
  pairGroups.sort((a, b) => {
    const valueDiff = a[0].value - b[0].value;
    if (valueDiff !== 0) return valueDiff;
    return COLOR_ORDER[a[0].color] - COLOR_ORDER[b[0].color];
  });

  singles.sort((a, b) => {
    const valueDiff = a.value - b.value;
    if (valueDiff !== 0) return valueDiff;
    return COLOR_ORDER[a.color] - COLOR_ORDER[b.color];
  });

  const result: OkeyGameTile[] = [];

  // Fiziksel joker çifti varsa (2 tane), erken sırada bir çift olarak ekle.
  if (physicalJokers.length >= 2) {
    result.push(physicalJokers[0], physicalJokers[1]);
  }

  for (const group of pairGroups) {
    result.push(...group);
  }

  // Eşleşmemiş fiziksel joker(ler) (0 veya 1 tane kaldıysa) tekler gibi sona.
  const leftoverJokers = physicalJokers.slice(physicalJokers.length >= 2 ? 2 : 0);

  result.push(...singles, ...leftoverJokers);

  return result;
}

/**
 * Dizideki null/undefined elemanları filtreler; sıralama YAPMAZ, sadece
 * "boşlukları temizler" (görsel/UI tarafında rack slot'larının solda
 * toplanmasını sağlamak için). Immutable.
 */
export function compactHand(tiles: OkeyGameTile[]): OkeyGameTile[] {
  return tiles.filter((tile): tile is OkeyGameTile => tile != null);
}

/**
 * AYNI RENKTEN, value'ları ardışık (n, n+1, n+2, ...) EN AZ 3 taş içeren
 * grupları bulur ("run candidate"). Fiziksel joker (isFakeOkey) taşlar
 * ardışık dizideki BİR eksik halkayı doldurabilir (basit/greedy — karmaşık
 * optimizasyon yapılmaz). Her taş en fazla 1 gruba dahil edilir; en uzun
 * (eşitlikte en erken bulunan) run'a öncelik verilir. Immutable — girdi
 * dizisi değiştirilmez.
 */
export function findRunCandidates(tiles: OkeyGameTile[]): OkeyGameTile[][] {
  const jokers = tiles.filter(isPhysicalJoker);
  const usedJokerCount = { value: 0 };

  // Renklere göre grupla, her renk içinde value'ya göre artan sırala.
  const byColor = new Map<Exclude<OkeyTileColor, "joker">, OkeyGameTile[]>();
  for (const tile of tiles) {
    if (isPhysicalJoker(tile) || tile.color === "joker") continue;
    const list = byColor.get(tile.color as Exclude<OkeyTileColor, "joker">);
    if (list) {
      list.push(tile);
    } else {
      byColor.set(tile.color as Exclude<OkeyTileColor, "joker">, [tile]);
    }
  }

  const usedTileIds = new Set<string>();
  const allCandidates: OkeyGameTile[][] = [];

  Array.from(byColor.values()).forEach((colorTiles) => {
    const sorted = [...colorTiles].sort((a, b) => a.value - b.value);

    // Bu renk için tüm olası run'ları (joker dolgulu dahil) üret, sonra
    // en uzun/en erken başlayanı greedy şekilde seç.
    const colorCandidates = buildRunsForColor(sorted, jokers.length - usedJokerCount.value);

    // Greedy: en uzun run'dan başlayarak, henüz kullanılmamış taşları içerenleri al.
    colorCandidates.sort((a, b) => b.length - a.length);

    for (const candidate of colorCandidates) {
      const realTiles = candidate.filter((t) => !t.__isJokerFill);
      const hasUsedTile = realTiles.some((t) => usedTileIds.has(t.id));
      if (hasUsedTile) continue;

      const jokerFillCount = candidate.length - realTiles.length;
      if (jokerFillCount > jokers.length - usedJokerCount.value) continue;
      if (candidate.length < 3) continue;

      // Kabul et.
      const finalGroup: OkeyGameTile[] = [];
      for (const t of candidate) {
        if (t.__isJokerFill) {
          const jokerTile = jokers[usedJokerCount.value];
          usedJokerCount.value += 1;
          finalGroup.push(jokerTile);
        } else {
          usedTileIds.add(t.id);
          finalGroup.push(t);
        }
      }
      allCandidates.push(finalGroup);
    }
  });

  return allCandidates;
}

interface RunSlotTile extends OkeyGameTile {
  __isJokerFill?: boolean;
}

/**
 * Tek bir renk için (value'ya göre sıralı, tekrarsız-varsayılan olmayan
 * olası) ardışık run adaylarını üretir. En fazla `maxJokerFill` sayıda tek
 * eksik halka joker ile doldurulabilir. Basit greedy: mevcut değerlerin
 * kapladığı [min, max] aralığında art arda taramalar yaparak en az 3
 * uzunluğundaki ardışık blokları (gerekirse tek bir joker boşluğuyla) bulur.
 */
function buildRunsForColor(sortedTiles: OkeyGameTile[], maxJokerFill: number): RunSlotTile[][] {
  if (sortedTiles.length === 0) return [];

  // Aynı value'dan birden fazla taş olabilir (deste 2 kopya içerir) — her
  // value için ilk taşı temsilci olarak kullan (basit tutmak için), diğer
  // kopyalar findPairCandidates/farklı bir run'da kendi başına değerlendirilebilir.
  const byValue = new Map<number, OkeyGameTile>();
  for (const tile of sortedTiles) {
    if (!byValue.has(tile.value)) byValue.set(tile.value, tile);
  }
  const values = Array.from(byValue.keys()).sort((a, b) => a - b);
  if (values.length === 0) return [];

  const minV = values[0];
  const maxV = values[values.length - 1];

  const candidates: RunSlotTile[][] = [];

  // Tüm başlangıç noktalarından, mümkün olan en uzun ardışık (joker ile en
  // fazla maxJokerFill boşluk doldurularak) bloğu üret.
  for (let start = minV; start <= maxV; start += 1) {
    if (!byValue.has(start)) continue;

    let jokerUsed = 0;
    const group: RunSlotTile[] = [byValue.get(start) as RunSlotTile];
    let v = start + 1;

    while (v <= 13) {
      if (byValue.has(v)) {
        group.push(byValue.get(v) as RunSlotTile);
        v += 1;
        continue;
      }
      if (jokerUsed < maxJokerFill) {
        // Bir eksik halkayı joker ile doldur (yalnızca bir sonraki değer
        // mevcutsa anlamlı — sonrasında dizi devam ediyorsa).
        if (byValue.has(v + 1)) {
          const fill: RunSlotTile = {
            id: `__joker-fill-${v}`,
            color: "joker",
            value: v,
            __isJokerFill: true,
          };
          group.push(fill);
          jokerUsed += 1;
          v += 1;
          continue;
        }
      }
      break;
    }

    if (group.length >= 3) {
      candidates.push(group);
    }
  }

  return candidates;
}

/**
 * AYNI value'dan, FARKLI renklerden EN AZ 3 taş içeren grupları bulur
 * ("set candidate", örn. kırmızı 7, mavi 7, siyah 7). Bir taş birden fazla
 * set/run'da yer almaz — findRunCandidates tarafından zaten kullanılmış
 * taşlar (usedTileIds ile) burada TEKRAR kullanılabilir çünkü bu fonksiyon
 * bağımsız çalışır; run/set çakışmasını önlemek isteyen çağıran taraf iki
 * sonucu birleştirirken kendi önceliğini uygulayabilir. Bu fonksiyonun
 * kendi içinde: aynı taş, aynı value'nun birden fazla set'inde yer almaz
 * (her value için farklı renklerden en fazla 1'er taş kullanılır — o
 * value'dan 2. kopyalar varsa 2. bir set adayı olarak da değerlendirilir).
 * Immutable.
 */
export function findSetCandidates(tiles: OkeyGameTile[]): OkeyGameTile[][] {
  const normalTiles = tiles.filter((t) => !isPhysicalJoker(t) && t.color !== "joker");

  // value -> renk -> o value/renkteki taşlar (kuyruk olarak kullanılacak).
  const byValue = new Map<number, Map<OkeyTileColor, OkeyGameTile[]>>();
  for (const tile of normalTiles) {
    let colorMap = byValue.get(tile.value);
    if (!colorMap) {
      colorMap = new Map();
      byValue.set(tile.value, colorMap);
    }
    const list = colorMap.get(tile.color);
    if (list) {
      list.push(tile);
    } else {
      colorMap.set(tile.color, [tile]);
    }
  }

  const candidates: OkeyGameTile[][] = [];

  Array.from(byValue.values()).forEach((colorMap) => {
    // Aynı value'dan birden fazla set adayı çıkabilir (her renkten en fazla
    // 2 kopya var); her turda her renkten (varsa) bir taş alıp yeni bir set
    // oluştur, renk sayısı >= 3 kaldığı sürece devam et.
    // Basit tutmak için: en fazla 2 tur (deste 2 kopyalı olduğundan).
    for (let round = 0; round < 2; round += 1) {
      const group: OkeyGameTile[] = [];
      Array.from(colorMap.values()).forEach((list) => {
        if (list.length > round) {
          group.push(list[round]);
        }
      });
      if (group.length >= 3) {
        candidates.push(group);
      }
    }
  });

  return candidates;
}

/**
 * Aynı renk VE aynı value'dan TAM 2 taş olan çiftleri bulur. Elde tüm
 * taşlar taranır, her çift yalnızca 1 kez sayılır (tekrar sayılmaz).
 * Fiziksel jokerler (isFakeOkey) bu fonksiyonda değerlendirilmez (renk/
 * value'ları olmadığından "aynı renk+value çifti" tanımına girmezler).
 * Immutable.
 */
export function findPairCandidates(tiles: OkeyGameTile[]): OkeyGameTile[][] {
  const normalTiles = tiles.filter((t) => !isPhysicalJoker(t) && t.color !== "joker");

  const groups = new Map<string, OkeyGameTile[]>();
  for (const tile of normalTiles) {
    const key = `${tile.color}-${tile.value}`;
    const group = groups.get(key);
    if (group) {
      group.push(tile);
    } else {
      groups.set(key, [tile]);
    }
  }

  const pairs: OkeyGameTile[][] = [];
  Array.from(groups.values()).forEach((group) => {
    if (group.length === 2) {
      pairs.push(group);
    }
    // 2'den fazla (teorik olarak elde bulunmaz, deste 2 kopyalı) veya 1
    // taneyse çift oluşturmaz — basit tutulur.
  });

  // Value'ya göre sırala (okunabilir/deterministik çıktı için).
  pairs.sort((a, b) => a[0].value - b[0].value || COLOR_ORDER[a[0].color] - COLOR_ORDER[b[0].color]);

  return pairs;
}
