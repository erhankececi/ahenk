// Ahenk 101 — Görev 14 (Faz 1): Colyseus @colyseus/schema oyuncu modeli.
//
// lib/game101/gameTypes.ts'teki OkeyGamePlayer ile KAVRAMSAL olarak
// tutarlıdır (id/name/city/seat/isReady/isConnected/voiceState), ama
// @colyseus/schema Schema sınıfı olarak BAĞIMSIZ tanımlanır (bkz.
// Okey101Tile.ts başındaki not — aynı gerekçe burada da geçerli).
//
// NOT: `isMe` alanı burada YOK — bu tamamen client-taraflı bir kavramdır
// (state-sync'te anlamsız, her client kendi sessionId'sini bilir).

import { Schema, type } from "@colyseus/schema";

export class Okey101Player extends Schema {
  /** Colyseus sessionId (veya options'tan gelen kararlı bir kimlik). */
  @type("string") id: string = "";

  @type("string") name: string = "";

  @type("string") city: string = "";

  /**
   * "bottom" | "top" | "left" | "right" değerlerini alacak, ama schema'da
   * genel pratiğe uygun olarak düz string tutulur (union type SADECE
   * client/gameplay katmanında zorunlu kılınır).
   */
  @type("string") seat: string = "";

  @type("boolean") isReady: boolean = false;

  @type("boolean") isConnected: boolean = true;

  /** "idle" | "speaking" | "muted" (düz string — bkz. seat notu). */
  @type("string") voiceState: string = "idle";
}
