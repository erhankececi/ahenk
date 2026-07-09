// Ahenk 101 — Görev 12 (Faz 1): el sonu puanlama, saf fonksiyonlar
// (frontend-only, mock). Backend/Supabase/socket/Colyseus YOK.
//
// Bu dosya RoundEndOverlay.tsx (UI) tarafından TÜKETİLECEK ama bu görevde
// UI'a HİÇ dokunulmadı — burada sadece tipler/sabitler/saf hesap fonksiyonları
// var.
//
// TERMİNOLOJİ (gameTypes.ts / mockGame.ts / meldValidation.ts ile TUTARLI,
// ters yazılmasın):
// - isFakeOkey (fiziksel joker, "OKEY" baskılı taş) → puanlama amacıyla SABİT
//   bir taş gibi davranır: değeri, göstergeden hesaplanan okeyValue'dur
//   (wildcard/serbest DEĞİLDİR — bkz. FAKE_OKEY_USES_OKEY_VALUE).
// - isOkey (gerçek okey, göstergeden hesaplanan normal sayılı taş) → elde
//   KALIRSA kendi sayısal değeriyle DEĞİL, sabit OKEY_REMAINING_PENALTY kadar
//   ceza olarak sayılır (108 kuralı: elde kalan gerçek okey ağır cezalıdır).
//
// ALAN SÖZLEŞMESİ (spec'in net tanımlamadığı, burada KESİNLEŞTİRİLEN kısım):
// - remainingTileScore: HER OYUNCU için HER ZAMAN
//   calculateHandPenalty(hand, okeyColor, okeyValue) sonucudur — elde kalan
//   taşların GERÇEK toplam değeri (kazanan için hand boş olduğundan 0).
//   Açık/kapalı fark etmez, bu alan HAM/bilgi amaçlıdır.
// - penaltyScore: SENARYOYA göre uygulanan fiili ceza:
//     kazanan            → WINNER_SCORE (0)
//     açmış ama kaybeden  → remainingTileScore ile AYNI değer
//     açmamış (kaybeden)  → SABİT UNOPENED_PENALTY (101), remainingTileScore'
//                            dan BAĞIMSIZDIR (elde kaç taş/ne değer olursa
//                            olsun ceza sabit 101'dir).
// - bonusScore: v1'de HER ZAMAN 0 (spec bonus kuralı tanımlamıyor; alan
//   gelecekteki genişleme için tipte duruyor).
// - totalRoundScore = penaltyScore - bonusScore (v1'de bonusScore hep 0
//   olduğundan pratikte totalRoundScore === penaltyScore, ama formül İLERİDE
//   bonus eklenebilsin diye bu şekilde yazılır).

import type { OkeyGameState, OkeyGameTile, OkeySeatPosition, OkeyTileColor } from "./gameTypes";

/** Bir oyuncunun el sonu (round) puan detayı. */
export interface PlayerRoundScore {
  playerId: string;
  seat: OkeySeatPosition;
  name: string;
  isWinner: boolean;
  hasOpened: boolean;
  openType: "none" | "run" | "pair";
  /** El sonunda elinde kalan taş sayısı. */
  remainingTileCount: number;
  /**
   * Elde kalan taşların GERÇEK toplam değeri (calculateHandPenalty sonucu).
   * Ham/bilgi amaçlıdır — fiilen uygulanan ceza için penaltyScore'a bakın.
   */
  remainingTileScore: number;
  /** Bu el için fiilen uygulanan ceza puanı (bkz. dosya başı alan sözleşmesi). */
  penaltyScore: number;
  /** v1'de her zaman 0 — gelecekteki bonus kuralları için ayrılmış alan. */
  bonusScore: number;
  /** totalRoundScore = penaltyScore - bonusScore. */
  totalRoundScore: number;
  /** Kısa Türkçe açıklama (ör. "Eli bitirdi", "Açmadan yakalandı"). */
  note: string;
}

/** Bir elin tüm oyuncular için puanlama sonucu. */
export interface RoundScoreResult {
  winnerPlayerId?: string;
  winnerSeat?: OkeySeatPosition;
  scores: PlayerRoundScore[];
  /** Kısa Türkçe özet cümlesi (ör. kazanan + kaç rakibin açmadan yakalandığı). */
  summaryText: string;
}

// --- Config sabitleri -------------------------------------------------

/** Açmadan yakalanan oyuncuya v1'de uygulanan SABİT ceza. */
export const UNOPENED_PENALTY = 101;
/** Kazanan oyuncunun bu el için aldığı puan. */
export const WINNER_SCORE = 0;
/** Elde kalan GERÇEK okey (isOkey) taşı başına uygulanan SABİT ceza. */
export const OKEY_REMAINING_PENALTY = 20;
/**
 * true ise fiziksel sahte okey (isFakeOkey), puanlamada göstergeden
 * hesaplanan okeyValue kadar sayılır (kendi value'su DEĞİL, hep 0'dır).
 * v1'de bu her zaman true'dur — config olarak burada tutulur ki kural
 * ileride tartışmaya açılırsa tek yerden değiştirilebilsin.
 */
export const FAKE_OKEY_USES_OKEY_VALUE = true;

// --- Saf hesap fonksiyonları -------------------------------------------

/**
 * Tek bir taşın puanlama değerini döner:
 * - isOkey (gerçek okey) ise → OKEY_REMAINING_PENALTY (kendi sayısal değeri
 *   DEĞİL, elde kalan gerçek okey her zaman sabit 20 ceza sayılır).
 * - isFakeOkey (fiziksel sahte okey) ise → okeyValue (null ise 0 fallback;
 *   FAKE_OKEY_USES_OKEY_VALUE bu davranışı ifade eder).
 * - aksi halde (normal taş) → tile.value.
 *
 * isOkey kontrolü isFakeOkey'den ÖNCE yapılır (ikisi teorik olarak birlikte
 * set edilmez ama sıralama, terminolojideki önceliği netleştirir).
 */
export function getTilePenaltyValue(
  tile: OkeyGameTile,
  okeyColor: OkeyTileColor | null,
  okeyValue: number | null,
): number {
  if (tile.isOkey) return OKEY_REMAINING_PENALTY;
  if (tile.isFakeOkey) return FAKE_OKEY_USES_OKEY_VALUE ? (okeyValue ?? 0) : tile.value;
  return tile.value;
}

/**
 * Bir eldeki (hand) tüm taşların toplam ceza puanını döner
 * (getTilePenaltyValue toplamı). Boş el için 0 döner.
 */
export function calculateHandPenalty(
  hand: OkeyGameTile[],
  okeyColor: OkeyTileColor | null,
  okeyValue: number | null,
): number {
  return hand.reduce((sum, tile) => sum + getTilePenaltyValue(tile, okeyColor, okeyValue), 0);
}

/**
 * Verilen state'e göre TÜM oyuncular için el sonu puanlamasını hesaplar.
 * Çağrıldığı anda state.winnerSeat/winnerPlayerId/hasOpened/hands'in ZATEN
 * doğru (el bitmiş) hale getirilmiş olması beklenir — bu fonksiyon state'i
 * DEĞİŞTİRMEZ, sadece OKUR.
 *
 * Koltuk bazlı açma takibi: state şu an SADECE "bottom" (ben) için
 * hasOpened/myOpenType tutuyor — diğer üç koltuk için gerçek bir açma takibi
 * YOK (mock rakip hamleleri seri/çift açma simüle etmiyor). Bu yüzden
 * "bottom" DIŞINDAKİ koltuklar için hasOpened AÇIKÇA false, openType AÇIKÇA
 * "none" varsayılır (ChatGPT spec madde 4: "Mock rakipler için hasOpened=false
 * varsayılabilir"). Kazanan her zaman "bottom" olduğundan (Görev 10'da sadece
 * ben BİTİR diyebiliyorum) bu varsayım pratikte rakipleri hep "açmadan
 * yakalandı" (UNOPENED_PENALTY) dalına düşürür — ama kod genel/doğru yazılır,
 * gelecekte rakip açma eklenirse sadece "bottom" özel-durumu kaldırılır.
 */
export function calculateRoundScore(state: OkeyGameState): RoundScoreResult {
  const scores: PlayerRoundScore[] = state.players.map((player) => {
    const isWinner = player.seat === state.winnerSeat;

    // Yalnızca "bottom" için gerçek hasOpened/myOpenType state'te tutuluyor;
    // diğer koltuklar için per-seat açma takibi YOK, bu yüzden güvenli
    // varsayılan false/"none" kullanılır (bkz. fonksiyon docstring'i).
    const hasOpenedForPlayer = player.seat === "bottom" ? state.hasOpened : false;
    const openType = player.seat === "bottom" ? state.myOpenType : "none";

    // state.hands tipi (Record<OkeySeatPosition, OkeyGameTile[]>) her koltuk
    // için bir dizi garanti eder, undefined OLAMAZ; yine de savunma amaçlı
    // ?? [] kullanılır.
    const remainingHand = state.hands[player.seat] ?? [];
    const remainingTileCount = remainingHand.length;
    const remainingTileScore = calculateHandPenalty(remainingHand, state.okeyColor, state.okeyValue);

    let penaltyScore: number;
    let note: string;

    if (isWinner) {
      penaltyScore = WINNER_SCORE;
      note = "Eli bitirdi";
    } else if (hasOpenedForPlayer) {
      // Açmış ama eli bitirmemiş oyuncu: ceza, elde kalan taşların gerçek
      // toplam değeridir. Şu an bu dal ULAŞILAMAZ (yalnızca "bottom" için
      // hasOpened biliniyor ve "bottom" zaten her zaman kazanan) ama kod
      // ileride rakip açma eklenebilsin diye genel/doğru yazılır.
      penaltyScore = remainingTileScore;
      note = "Açtı ama bitiremedi.";
    } else {
      // Açmadan yakalanan oyuncu: ceza SABİTTİR (101), elde kalan taşların
      // gerçek değerinden BAĞIMSIZDIR.
      penaltyScore = UNOPENED_PENALTY;
      note = "Açmadan yakalandı";
    }

    const bonusScore = 0;
    const totalRoundScore = penaltyScore - bonusScore;

    return {
      playerId: player.id,
      seat: player.seat,
      name: player.name,
      isWinner,
      hasOpened: hasOpenedForPlayer,
      openType,
      remainingTileCount,
      remainingTileScore,
      penaltyScore,
      bonusScore,
      totalRoundScore,
      note,
    };
  });

  const winner = scores.find((s) => s.isWinner);
  const unopenedCount = scores.filter((s) => !s.isWinner && !s.hasOpened).length;
  const summaryText = winner
    ? `${winner.name} eli bitirdi. ${unopenedCount} rakip açmadan yakalandı.`
    : "El sonuçlandı.";

  return {
    winnerPlayerId: state.winnerPlayerId,
    winnerSeat: state.winnerSeat,
    scores,
    summaryText,
  };
}
