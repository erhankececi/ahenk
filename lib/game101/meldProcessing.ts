// Ahenk 101 — Görev 9 (Faz 1): açılmış meld'lere elden taş "işleme"
// (attach/ekleme) saf mantığı (frontend-only, mock).
//
// Backend/Supabase/socket/Colyseus YOK. Bu dosya, kullanıcı (bottom) daha
// önce seri/çift açtıktan (hasOpened=true) sonra elindeki uygun bir taşı
// masadaki AÇIK meld'lere ekleyebilmesi için gereken saf, test edilebilir
// fonksiyonları içerir. State mutasyonu YAPMAZ — game action (gameActions.ts
// içindeki processTileToMeld) bu fonksiyonları kullanarak state günceller.
//
// TERMİNOLOJİ (meldValidation.ts ile birebir tutarlı, ters yazılmasın):
// - isFakeOkey=true taş → SABİT taş gibi davranır: {color: okeyColor,
//   value: okeyValue} imiş gibi (serbest wildcard DEĞİLDİR).
// - isOkey=true taş      → SERBEST joker/wildcard'dır: ihtiyaç duyulan
//   HERHANGİ BİR renk/değeri temsil edebilir.
//
// v1 KAPSAM KARARLARI (bilerek basitleştirilmiş, docstring'lerde tekrar
// belirtilir):
// 1. PAIR meld'lere işleme v1'de TAMAMEN KAPALI — canAddTileToMeld bir pair
//    meld için HER ZAMAN false döner.
// 2. RUN meld'lerde 13'ten 1'e SARMA yok (yalnızca 1..13 aralığında başa/sona
//    ekleme).
// 3. "Etkin değer/renk" hesaplama: OkeyMeld.tiles dizisinde slot'ların hangi
//    değeri/rengi TEMSİL ETTİĞİ ayrıca saklanmıyor (yalnızca ham
//    OkeyGameTile[] var). Bu yüzden meld.tiles'ı value'ya göre SIRALAYIP,
//    listedeki İLK taşın etkin değerini şu öncelikle çıkarıyoruz:
//      normal taş  → tile.value
//      isFakeOkey  → okeyValue (sabit)
//      isOkey      → tile.value (fallback — nadir köşe durumu, mükemmel
//                    olması şart değil, v1 için kabul edilebilir)
//    Sonraki her slotun etkin değerinin, bir önceki slotun etkin değerinden
//    tam +1 olduğu VARSAYILIR (zaten geçerli bir run bunu sağlar) — yani
//    ilk taştan itibaren "ilk taşın etkin değeri + index" formülüyle
//    min/max çıkarılır, tek tek her taş için isOkey'in "hangi değeri temsil
//    ettiğini" ayrıca çözmeye ÇALIŞILMAZ. Bu, valid bir run için doğru
//    sonucu verir ve v1 gereksinimleri için yeterlidir.
// 4. SET meld'lerde de benzer basitleştirme: mevcut renkleri çıkarırken
//    normal taş → tile.color, isFakeOkey → okeyColor, isOkey taş için ise
//    "hangi rengi temsil ettiği" meld.tiles içinde AYRICA saklı olmadığından
//    isOkey taşları mevcut-renkler kümesine dahil ETMİYORUZ (bilinmeyen/
//    belirsiz kabul edilir — bu, olası bir isOkey slotunun rengini "boş"
//    saydığından en kötü ihtimalle bir rengin yanlışlıkla "dolu" sayılmasını
//    ENGELLER, yani güvenli tarafta hata yapar: bir renk isOkey tarafından
//    zaten temsil ediliyor olsa bile aynı rengin normal taşla eklenmesine
//    izin verebilir — v1 için kabul edilebilir, nadir köşe durumu).
// 5. okeyColor veya okeyValue null ise: isFakeOkey/isOkey taşlar için
//    sabitleme/wildcard mantığı uygulanamaz (henüz gösterge yok) — bu
//    durumda yalnızca normal taşlar üzerinden kıyaslama yapılır, fonksiyon
//    ÇÖKMEZ (isFakeOkey/isOkey taşlar aday/mevcut hesaplamalarda normal
//    kendi ham color/value'suyla ele alınır, pratikte bu taşlar zaten
//    gösterge açılmadan meld içinde/elde anlamlı şekilde bulunmaz).

import type { OkeyGameTile, OkeyTileColor } from "./gameTypes";
import type { OkeyMeld } from "./meldValidation";

type SolidColor = Exclude<OkeyTileColor, "joker">;

const COLOR_NAME_TR: Record<SolidColor, string> = {
  red: "Kırmızı",
  blue: "Mavi",
  black: "Siyah",
  yellow: "Sarı",
};

/** Bir taş fiziksel joker mi (destede sabit "OKEY" baskılı taş)? */
function isPhysicalJoker(tile: OkeyGameTile): boolean {
  return Boolean(tile.isFakeOkey);
}

/** Bir taş "gerçek okey" mi (serbest wildcard)? */
function isRealOkeyWildcard(tile: OkeyGameTile): boolean {
  return Boolean(tile.isOkey);
}

/** Türkçe renk adı (yalnızca solid renkler için anlamlı). */
export function colorNameTr(color: SolidColor): string {
  return COLOR_NAME_TR[color];
}

/**
 * Bir taşın (meld içinde zaten yer alan ya da eklenmek istenen) "etkin
 * değerini" döner. okeyValue null ise isFakeOkey taşlar için etkin değer
 * hesaplanamaz — bu durumda ham tile.value fallback olarak kullanılır (bkz.
 * dosya başı kural 5).
 */
function effectiveValue(tile: OkeyGameTile, okeyValue: number | null): number {
  if (isPhysicalJoker(tile) && okeyValue != null) return okeyValue;
  return tile.value;
}

/**
 * Bir taşın (meld içinde zaten yer alan ya da eklenmek istenen) "etkin
 * rengini" döner (yalnızca normal ve isFakeOkey taşlar için anlamlı — isOkey
 * taşlar için null döner, çünkü serbesttir/duruma göre değişir). okeyColor
 * null ise isFakeOkey taşlar için etkin renk hesaplanamaz — ham tile.color
 * fallback kullanılır.
 */
function effectiveColorOrNull(tile: OkeyGameTile, okeyColor: OkeyTileColor | null): SolidColor | null {
  if (isRealOkeyWildcard(tile)) return null;
  if (isPhysicalJoker(tile) && okeyColor != null && okeyColor !== "joker") {
    return okeyColor as SolidColor;
  }
  if (tile.color === "joker") return null;
  return tile.color as SolidColor;
}

/** Run meld'inin (value'ya sıralanmış tiles üzerinden) min/max etkin değerini ve rengini çıkarır. */
function getRunBounds(
  meld: OkeyMeld,
  okeyColor: OkeyTileColor | null,
  okeyValue: number | null,
): { color: SolidColor | null; minValue: number; maxValue: number } | null {
  if (meld.tiles.length === 0) return null;

  const sorted = [...meld.tiles].sort(
    (a, b) => effectiveValue(a, okeyValue) - effectiveValue(b, okeyValue),
  );

  const firstTile = sorted[0];
  const firstEffectiveValue = effectiveValue(firstTile, okeyValue);
  const minValue = firstEffectiveValue;
  const maxValue = firstEffectiveValue + (sorted.length - 1);

  // Run'ın rengi: dizideki ilk solid (non-wildcard) taştan al; hiçbiri
  // solid değilse (tamamen wildcard — teorik olarak imkansız ama güvenli
  // olalım) null döner.
  let color: SolidColor | null = null;
  for (const t of sorted) {
    const c = effectiveColorOrNull(t, okeyColor);
    if (c != null) {
      color = c;
      break;
    }
  }

  return { color, minValue, maxValue };
}

/**
 * Set meld'inin mevcut (bilinen) renklerini döner. isOkey (wildcard)
 * slotlar "bilinmeyen" kabul edilip kümeye DAHİL EDİLMEZ (bkz. dosya başı
 * kural 4 — bilerek iyimser/basitleştirilmiş davranış).
 */
function getSetKnownColors(meld: OkeyMeld, okeyColor: OkeyTileColor | null): Set<SolidColor> {
  const colors = new Set<SolidColor>();
  for (const t of meld.tiles) {
    const c = effectiveColorOrNull(t, okeyColor);
    if (c != null) colors.add(c);
  }
  return colors;
}

/**
 * Verilen taş, verilen açık meld'e (run/set/pair) işlenebilir mi?
 *
 * - pair meld: v1'de HER ZAMAN false (kural 1).
 * - run meld: taşın aday etkin değeri (normal→tile.value, isFakeOkey→
 *   okeyValue, isOkey→serbest/min-1 veya max+1 olabilir) run'ın min-1
 *   (başa) veya max+1 (sona) değerine eşitse VE 1..13 aralığındaysa (sarma
 *   yok) VE taşın aday etkin rengi run'ın rengiyle uyuşuyorsa (isOkey için
 *   renk serbest, her zaman uyuşur) true.
 * - set meld: set zaten 4 renk içeriyorsa false. Taşın aday etkin değeri
 *   set'in value'suyla eşleşmeli. Taşın aday etkin rengi (isOkey için
 *   "bilinmeyen yeni bir renk" varsayılır, yani otomatik uygun kabul edilir)
 *   mevcut bilinen renkler kümesinde OLMAMALI.
 *
 * okeyColor/okeyValue null ise isFakeOkey/isOkey taşlar için sabitleme/
 * wildcard mantığı uygulanamaz — yalnızca normal taş kıyaslaması yapılır
 * (kural 5), fonksiyon çökmez.
 */
export function canAddTileToMeld(
  tile: OkeyGameTile,
  meld: OkeyMeld,
  okeyColor: OkeyTileColor | null,
  okeyValue: number | null,
): boolean {
  if (meld.type === "pair") return false;

  if (meld.type === "run") {
    const bounds = getRunBounds(meld, okeyColor, okeyValue);
    if (bounds == null || bounds.color == null) return false;

    const isWildcard = isRealOkeyWildcard(tile);
    const candidateColor = effectiveColorOrNull(tile, okeyColor);
    const colorOk = isWildcard || candidateColor === bounds.color;
    if (!colorOk) return false;

    const candidateValue = effectiveValue(tile, okeyValue);

    if (isWildcard) {
      // Serbest wildcard: başa veya sona (1..13 sınırları içinde) uyabilir.
      const canPrepend = bounds.minValue - 1 >= 1;
      const canAppend = bounds.maxValue + 1 <= 13;
      return canPrepend || canAppend;
    }

    const fitsStart = candidateValue === bounds.minValue - 1 && candidateValue >= 1;
    const fitsEnd = candidateValue === bounds.maxValue + 1 && candidateValue <= 13;
    return fitsStart || fitsEnd;
  }

  // meld.type === "set"
  const knownColors = getSetKnownColors(meld, okeyColor);
  if (knownColors.size >= 4) return false;

  // Set'in value'sunu meld.tiles'tan çıkar (ilk taşın etkin değeri yeterli —
  // tüm set aynı value'yu paylaşır).
  if (meld.tiles.length === 0) return false;
  const setValue = effectiveValue(meld.tiles[0], okeyValue);

  const isWildcard = isRealOkeyWildcard(tile);

  if (isWildcard) {
    // Serbest wildcard'ın KENDİ ham tile.value'su HER ZAMAN okeyValue'dur
    // (isOkey tanımı gereği) — bu, temsil ETMESİ istenen değerle (setValue)
    // ALAKASIZDIR. Wildcard, set'in value'su ne olursa olsun eksik bir rengi
    // temsil edebilmeli (zaten 4 renk dolmadıysa yukarıda elendi). Bu yüzden
    // burada candidateValue===setValue kontrolü YAPILMAZ (yapılırsa wildcard
    // yalnızca setValue===okeyValue olan setlere işlenebilir — YANLIŞ).
    return true;
  }

  const candidateValue = effectiveValue(tile, okeyValue);
  if (candidateValue !== setValue) return false;

  const candidateColor = effectiveColorOrNull(tile, okeyColor);
  if (candidateColor == null) return false;
  return !knownColors.has(candidateColor);
}

function buildUpdatedRunLabel(color: SolidColor, minValue: number, maxValue: number): string {
  return `${colorNameTr(color)} Seri (${minValue}-${maxValue})`;
}

function buildUpdatedSetLabel(value: number): string {
  return `${value} Seti`;
}

/**
 * Verilen taşı meld'e ekleyip YENİ bir OkeyMeld döner (immutable — meld
 * mutasyona uğratılmaz). position verilmezse run için otomatik belirlenir
 * (adayın etkin değeri min-1 ise "start", max+1 ise "end"; wildcard'da
 * ikisi de mümkünse "end" tercih edilir). set/pair için position anlamsız,
 * tiles dizisinin sonuna eklenir.
 *
 * Çağrıdan ÖNCE canAddTileToMeld(tile, meld, okeyColor, okeyValue) === true
 * olduğu varsayılır — bu fonksiyon kendi başına validasyon YAPMAZ.
 */
export function addTileToMeld(
  meld: OkeyMeld,
  tile: OkeyGameTile,
  position?: "start" | "end",
  okeyColor?: OkeyTileColor | null,
  okeyValue?: number | null,
): OkeyMeld {
  const resolvedOkeyColor = okeyColor ?? null;
  const resolvedOkeyValue = okeyValue ?? null;
  const isWildcard = isRealOkeyWildcard(tile);

  if (meld.type === "run") {
    const bounds = getRunBounds(meld, resolvedOkeyColor, resolvedOkeyValue);
    let resolvedPosition = position;

    if (resolvedPosition == null && bounds != null) {
      if (!isWildcard) {
        const candidateValue = effectiveValue(tile, resolvedOkeyValue);
        resolvedPosition = candidateValue === bounds.minValue - 1 ? "start" : "end";
      } else {
        // Wildcard: sona eklemeyi tercih et (her iki uç da mümkünse).
        const canAppend = bounds.maxValue + 1 <= 13;
        resolvedPosition = canAppend ? "end" : "start";
      }
    }

    // Bu taşın run içinde TEMSİL ETTİĞİ değer: wildcard'ın kendi ham
    // tile.value'su HER ZAMAN okeyValue'dur (isOkey tanımı gereği) — bu,
    // run'daki slotta TEMSİL ETTİĞİ değerle (min-1 veya max+1) ALAKASIZDIR.
    // canAddTileToMeld'deki mantıkla tutarlı olmak için puan/etiket
    // hesaplaması da temsil edilen değeri kullanır, wildcard'ın kendi ham
    // değerini DEĞİL (aksi halde puan/etiket birbiriyle çelişirdi).
    const representedValue =
      isWildcard && bounds != null
        ? resolvedPosition === "start"
          ? bounds.minValue - 1
          : bounds.maxValue + 1
        : effectiveValue(tile, resolvedOkeyValue);

    const newTiles =
      resolvedPosition === "start" ? [tile, ...meld.tiles] : [...meld.tiles, tile];

    const newScore = meld.score + representedValue;
    let newLabel = meld.label;
    if (bounds != null && bounds.color != null) {
      const newMin = resolvedPosition === "start" ? bounds.minValue - 1 : bounds.minValue;
      const newMax = resolvedPosition === "end" ? bounds.maxValue + 1 : bounds.maxValue;
      newLabel = buildUpdatedRunLabel(bounds.color, newMin, newMax);
    }

    return {
      ...meld,
      tiles: newTiles,
      score: newScore,
      label: newLabel,
    };
  }

  // set / pair (pair pratikte buraya hiç gelmez — canAddTileToMeld hep
  // false döndüğünden processTileToMeld pair meld için asla çağırmaz).
  // Wildcard'ın temsil ettiği değer set'in KENDİ value'sudur (setValue),
  // wildcard'ın kendi ham değeri (=okeyValue) DEĞİL — aynı gerekçe.
  const setValue =
    meld.tiles.length > 0
      ? effectiveValue(meld.tiles[0], resolvedOkeyValue)
      : effectiveValue(tile, resolvedOkeyValue);
  const representedValue = isWildcard ? setValue : effectiveValue(tile, resolvedOkeyValue);

  const newTiles = [...meld.tiles, tile];
  const newScore = meld.score + representedValue;
  const newLabel = meld.type === "set" ? buildUpdatedSetLabel(representedValue) : meld.label;

  return {
    ...meld,
    tiles: newTiles,
    score: newScore,
    label: newLabel,
  };
}

/**
 * Verilen taşın işlenebileceği tüm açık meld'leri (openedMelds içinden)
 * döner (yeni dizi — filter).
 *
 * NOT: "kullanıcı seri açtıysa sadece run/set'e, çift açtıysa sadece
 * pair'e işleyebilir" kuralı burada AYRICA kontrol EDİLMEZ (bu fonksiyon
 * myOpenType parametresi almaz). Kural yine de dolaylı olarak sağlanır:
 * - pair meld'ler için canAddTileToMeld HER ZAMAN false döner (kural 1),
 *   bu yüzden myOpenType === "pair" olan bir kullanıcının openedMelds'i
 *   yalnızca pair tipte meld'ler içerdiğinden getProcessableMelds() bu
 *   kullanıcı için doğal olarak HER ZAMAN boş dizi döner.
 * - myOpenType === "run" olan bir kullanıcının openedMelds'i yalnızca run/
 *   set tipte meld'ler içerir, bunlar zaten normal şekilde değerlendirilir.
 * Yani çağıran taraf (UI) openedMelds'i olduğu gibi geçebilir, ekstra bir
 * myOpenType filtrelemesi GEREKMEZ.
 */
export function getProcessableMelds(
  tile: OkeyGameTile,
  openedMelds: OkeyMeld[],
  okeyColor: OkeyTileColor | null,
  okeyValue: number | null,
): OkeyMeld[] {
  return openedMelds.filter((meld) => canAddTileToMeld(tile, meld, okeyColor, okeyValue));
}
