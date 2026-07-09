// lib/game101/rackSlots.ts
//
// Ahenk 101 — ıstaka (rack) SABİT SLOT sistemi (Görev 11, aşama 1).
//
// Bu dosya TAMAMEN SAF: React/Pixi'ye hiçbir bağımlılığı yoktur, sadece taş
// id'leri (string) ve slot index'leri (number) üzerinde çalışan, test
// edilebilir yardımcı fonksiyonlar içerir.
//
// Gerçek 101 oyunlarındaki gibi ıstaka SABİT 30 slotludur (2 satır x 15
// sütun). Bir taşın hangi slotta göründüğü bilgisi OYUN STATE'İNİN bir
// parçası DEĞİLDİR — sadece ıstaka component'inin kendi yerel/iç gösterim
// detayıdır (RackSlotAssignment). Oyun kuralları, el içeriği, meld mantığı
// vb. bu dosyadan ETKİLENMEZ.

/** Istakadaki satır sayısı (üst + alt). */
export const RACK_ROWS = 2;

/** Her satırdaki slot (yuva) sayısı. */
export const RACK_SLOTS_PER_ROW = 15;

/** Toplam slot sayısı: RACK_ROWS * RACK_SLOTS_PER_ROW. */
export const RACK_TOTAL_SLOTS = RACK_ROWS * RACK_SLOTS_PER_ROW;

/**
 * Istakadaki slot dizilimi: uzunluğu RACK_TOTAL_SLOTS olan bir dizi.
 * Her eleman ya bir tile.id (string) ya da boş slot için null'dur.
 * index 0..14 → üst satır, 15..29 → alt satır (sıralı doldurma varsayımıyla,
 * ama serbest yerleştirmede herhangi bir slot herhangi bir index'te olabilir).
 */
export type RackSlotAssignment = (string | null)[];

/**
 * Uzunluğu RACK_TOTAL_SLOTS olan, tamamı null bir dizi döner.
 */
export function createEmptyAssignment(): RackSlotAssignment {
  return new Array(RACK_TOTAL_SLOTS).fill(null);
}

/**
 * Verilen id'leri SIRAYLA slot 0'dan başlayarak boşluksuz yerleştirir
 * (üst sıra dolar, sonra alt sıra), kalan slotlar null olur.
 *
 * tileIdsInOrder.length RACK_TOTAL_SLOTS'tan büyükse (pratikte olmaz, bir el
 * en fazla ~24 taş içerir) fazla id'ler SESSİZCE ATLANIR — çökme yoktur,
 * bu tamamen savunma amaçlıdır.
 *
 * RENK DİZ / SAYI DİZ / ÇİFT DİZ / ELİ TOPLA gibi "boşlukları temizleyip
 * yeniden diz" senaryolarında kullanılır.
 */
export function compactAssignment(tileIdsInOrder: string[]): RackSlotAssignment {
  const assignment = createEmptyAssignment();
  const count = Math.min(tileIdsInOrder.length, RACK_TOTAL_SLOTS);
  for (let i = 0; i < count; i++) {
    assignment[i] = tileIdsInOrder[i];
  }
  return assignment;
}

/**
 * Kullanıcının serbestçe yerleştirdiği/boşluk bıraktığı DÜZENİ KORUYARAK,
 * elin GÜNCEL taş id kümesiyle (currentTileIds) uzlaştırır.
 *
 * TAŞ ÇEK / TAŞ AT / SERİ AÇ / ÇİFT AÇ / İŞLE / BİTİR gibi işlemler sonrası
 * çağrılması amaçlanır — bu işlemler taş EKLER veya ÇIKARIR ama MEVCUT
 * taşların yerini DEĞİŞTİRMEZ.
 *
 * Davranış:
 * - assignment'ta yer alıp artık currentTileIds içinde OLMAYAN id'ler
 *   (örn. atılan/meld'e giden taş) → o slot null'lanır. BOŞLUK KORUNUR;
 *   diğer taşlar KAYDIRILMAZ, herhangi bir kompaksiyon YAPILMAZ (TAŞ AT
 *   sonrası boşluk davranışının bozulmaması için).
 * - currentTileIds içinde olup assignment'ta HİÇ yer almayan (yeni gelen)
 *   id'ler → sırayla İLK BOŞ slota (index küçükten büyüğe tarayarak ilk
 *   null slot) yerleştirilir. Hiç boş slot yoksa (30 slot doluysa, pratikte
 *   olmaz) o id'ler sessizce atlanır — çökme yoktur.
 * - assignment'ta zaten yer alan VE hâlâ currentTileIds içinde olan id'ler
 *   → POZİSYONLARI DEĞİŞMEZ (fonksiyonun temel garantisi).
 *
 * Immutable: yeni bir RackSlotAssignment döner, girdi dizisini mutasyona
 * uğratmaz.
 */
export function reconcileAssignment(
  assignment: RackSlotAssignment,
  currentTileIds: string[]
): RackSlotAssignment {
  const currentSet = new Set(currentTileIds);

  // 1. Adım: mevcut assignment'ı kopyala, artık elde olmayan id'leri null'la.
  const result: RackSlotAssignment = assignment.map((slotValue) =>
    slotValue !== null && currentSet.has(slotValue) ? slotValue : null
  );

  // 2. Adım: assignment'ta yer alan id'lerin kümesini çıkar (kopyalanmadan
  // önceki orijinal assignment üzerinden — sadece "yer aldı mı" önemli,
  // hâlâ elde olup olmaması farketmez, çünkü zaten sadece elde olanlar
  // result'a kopyalandı; burada "yeni mi" kararını vermek için assignment'ta
  // hiç geçmemiş olanları bulmamız gerekiyor).
  const alreadyAssignedIds = new Set(
    assignment.filter((v): v is string => v !== null)
  );

  // 3. Adım: currentTileIds içinde olup assignment'ta hiç yer almayan
  // (yeni) id'leri sırayla ilk boş slota yerleştir.
  for (const tileId of currentTileIds) {
    if (alreadyAssignedIds.has(tileId)) continue; // zaten bir yerde vardı (pozisyonu korunuyor)

    const emptyIndex = findFirstEmptySlotIndex(result);
    if (emptyIndex === -1) {
      // Boş slot kalmadı — sessizce atla (çökme yok).
      continue;
    }
    result[emptyIndex] = tileId;
  }

  return result;
}

/**
 * indexA ve indexB'deki değerleri birbiriyle DEĞİŞTİRİR (biri null olsa
 * bile — yani bir taş boş bir slota "taşınmış" gibi de olabilir, diğer slot
 * null kalır). Immutable, yeni dizi döner.
 *
 * indexA === indexB ise değişiklik yapılmadan aynı içerikte yeni bir dizi
 * döner (no-op ama yine de yeni referans).
 *
 * indexA veya indexB dizi sınırları dışındaysa (0 <= i < RACK_TOTAL_SLOTS
 * değilse) değişiklik yapılmadan assignment'ın bir kopyası döner (çökme
 * yoktur).
 */
export function swapSlots(
  assignment: RackSlotAssignment,
  indexA: number,
  indexB: number
): RackSlotAssignment {
  const result = assignment.slice();

  const isValidIndex = (i: number) =>
    Number.isInteger(i) && i >= 0 && i < RACK_TOTAL_SLOTS;

  if (!isValidIndex(indexA) || !isValidIndex(indexB) || indexA === indexB) {
    return result;
  }

  const temp = result[indexA];
  result[indexA] = result[indexB];
  result[indexB] = temp;
  return result;
}

/**
 * tileId'nin bulunduğu slot index'ini döner, yoksa -1.
 */
export function findSlotIndexByTileId(
  assignment: RackSlotAssignment,
  tileId: string
): number {
  return assignment.indexOf(tileId);
}

/**
 * İlk null slotun index'ini döner (küçükten büyüğe), hiç yoksa -1.
 */
export function findFirstEmptySlotIndex(assignment: RackSlotAssignment): number {
  return assignment.indexOf(null);
}

/**
 * İki taş id listesinin, SIRADAN BAĞIMSIZ olarak AYNI KÜMEYİ temsil edip
 * etmediğini döner (multiset karşılaştırması gerekmez çünkü id'ler
 * benzersizdir — basit Set karşılaştırması yeterlidir).
 *
 * İKİ liste de AYNI uzunlukta VE aynı id'leri içeriyorsa (sadece sırası
 * farklı olabilir) true döner; herhangi bir id eklenmiş/çıkmışsa false
 * döner.
 *
 * İkinci (UI) ajanının "sıra mı değişti (RENK DİZ gibi bir sıralama oldu)
 * yoksa taş mı eklendi/çıktı (TAŞ ÇEK/AT gibi)" ayrımını yapması için
 * kullanılan anahtar yardımcı fonksiyondur.
 */
export function hasSameTileIdSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const setA = new Set(a);
  for (const id of b) {
    if (!setA.has(id)) return false;
  }
  return true;
}
