// Ahenk 101 — Görev 13 (Faz 1): sabit Türkçe hata mesajları.
//
// Bu sabitler, lib/game101/gameReducer.ts'in COMMAND_REJECTED event'lerinde
// (OkeyGameEvent.message) kullandığı GENEL/YENİDEN KULLANILABİLİR mesajlardır.
//
// ÖNEMLİ: mevcut lib/game101/gameActions.ts içindeki fonksiyonlar (drawTile,
// discardTile, openMelds, processTileToMeld, finishRound, ...) guard'ları
// sağlanmadığında SADECE no-op state döner — kendi içlerinde spesifik bir
// hata METNİ üretmezler. HANGİ guard'ın tetiklendiğini tespit edip uygun
// ERR_* sabitini seçmek gameReducer.ts'in sorumluluğudur (bkz. o dosyadaki
// determineRejectionReason).
//
// Bu dosya SAF sabitlerden ibarettir — hiçbir mevcut dosyaya (gameActions.ts
// dahil) dokunmaz/bağımlı değildir.

/** Sıra bende değilken sıra gerektiren bir komut denenirse. */
export const ERR_NOT_YOUR_TURN = "Sıra sende değil.";

/** Bir taş seçilmesi gereken bir komut, hiçbir taş seçili değilken denenirse. */
export const ERR_NO_TILE_SELECTED = "Önce taş seçmelisin.";

/** Henüz seri/çift açmadan BİTİR denenirse. */
export const ERR_MUST_OPEN_BEFORE_FINISH = "Bitirmek için önce açmalısın.";

/** Seçili taş, işlenmek istenen açık gruba (meld) uygun değilse. */
export const ERR_TILE_NOT_ELIGIBLE_FOR_MELD = "Bu taş seçili gruba işlenemez.";

/** Yukarıdaki spesifik sebeplerin hiçbiri net şekilde eşleşmiyorsa (genel fallback). */
export const ERR_ACTION_NOT_ALLOWED = "Bu hamle şu anda yapılamaz.";

/** El zaten bitmişken (phase !== "playing") oyun içi bir hamle denenirse. */
export const ERR_ROUND_ENDED = "El bittiği için hamle yapılamaz.";
