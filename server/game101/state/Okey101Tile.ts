// Ahenk 101 — Görev 14 (Faz 1): Colyseus @colyseus/schema taş modeli.
//
// Bu sınıf, lib/game101/gameTypes.ts içindeki OkeyGameTile interface'i ile
// KAVRAMSAL olarak tutarlıdır (id/color/value/isFakeOkey/isOkey), ancak
// @colyseus/schema'nın state-sync mimarisi TypeScript interface'i DEĞİL,
// `@type()` decorator'larıyla işaretlenmiş bir Schema sınıfı gerektirir —
// bu yüzden burada BAĞIMSIZ olarak yeniden tanımlanır. lib/game101'deki
// tipler bu dosyaya IMPORT EDİLMEZ (server ve client/mock state modelleri
// bu görevde kasıtlı olarak AYRI tutulur, gerçek entegrasyon ileride).
//
// Bu, bir İSKELET'tir: gerçek oyun motoru (deste oluşturma, dağıtım, vb.)
// bu görevde YOK.

import { Schema, type } from "@colyseus/schema";

export class Okey101Tile extends Schema {
  @type("string") id: string = "";

  /** "red" | "blue" | "black" | "yellow" | "joker" (schema'da düz string tutulur). */
  @type("string") color: string = "";

  /** 1-13 arası taş değeri. Joker taşta anlamsızdır (0 kullanılır). */
  @type("number") value: number = 0;

  /** Fiziksel joker taşı mı (destede sabit 2 adet, baskılı "OKEY" yazılı taş)? */
  @type("boolean") isFakeOkey: boolean = false;

  /** Göstergeye göre hesaplanan "gerçek okey" mi? */
  @type("boolean") isOkey: boolean = false;
}
