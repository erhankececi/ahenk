// Ahenk 101 — Görev 14 (Faz 1): Colyseus @colyseus/schema oda/oyun state'i.
//
// lib/game101/gameTypes.ts'teki OkeyGameState'in ÇOK daha küçük bir alt
// kümesidir — bu görev sadece server İSKELETİ kurduğu için deste/el/meld
// gibi gerçek oyun motoru alanları BİLEREK dışarıda bırakılmıştır (ChatGPT
// spesifikasyonu madde 5). Gerçek oyun motoru entegrasyonu GELECEKTE.
//
// players için MapSchema kullanılır (Colyseus'ta sessionId -> oyuncu
// eşlemesi için TİPİK/ÖNERİLEN koleksiyon budur — anahtarla O(1) erişim +
// join/leave sırasında öngörülebilir key yönetimi sağlar).

import { MapSchema, Schema, type } from "@colyseus/schema";
import { Okey101Player } from "./Okey101Player";

export class Okey101State extends Schema {
  @type("string") roomId: string = "";

  @type("string") roomName: string = "";

  /** "waiting" | "playing" | "roundEnded" (düz string — client tipi daraltır). */
  @type("string") phase: string = "waiting";

  /** Sırası gelen koltuk ("bottom" | "top" | "left" | "right" | ""). */
  @type("string") currentTurnSeat: string = "";

  /** sessionId -> Okey101Player. */
  @type({ map: Okey101Player }) players = new MapSchema<Okey101Player>();

  @type("number") drawPileCount: number = 0;

  @type("number") discardPileCount: number = 0;

  /** Gösterge taşının okunabilir etiketi (ör. "Kırmızı 7"). Opsiyonel. */
  @type("string") indicatorLabel: string = "";

  /** Okey rengi/değerinin okunabilir etiketi (ör. "Kırmızı 8"). Opsiyonel. */
  @type("string") okeyLabel: string = "";
}
