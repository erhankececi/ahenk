// Ahenk 101 — Görev 13 (Faz 1): oyun motoru EVENT tipleri.
//
// Bu dosya lib/game101/gameReducer.ts'in applyGameCommand'ının ürettiği
// event'lerin tipini tanımlar. Client, artık state mutasyonunu DOĞRUDAN
// çağırmak yerine bir OkeyGameCommand (commands.ts) dispatch eder; reducer
// bunu işleyip (varsa) state günceller ve "ne oldu"yu anlatan bir/birden
// fazla OkeyGameEvent döner.
//
// payload BİLİNÇLİ olarak `unknown` tutulur (discriminated union DEĞİL):
// event tipine göre farklı (veya hiç) ek bilgi taşıyabilir, ve bu ek bilgi
// event.message (kullanıcıya gösterilecek Türkçe kısa metin) ile zaten
// yeterince özetlenir — payload sadece debug/gelecekteki genişleme için
// opsiyonel bir "ekstra veri" alanıdır. gameReducer.ts VE ileride hook
// entegrasyonu bu unknown sözleşmesini TUTARLI kullanmalı (payload'a bel
// bağlamadan önce message'ı okumak/güvenli tip daraltması yapmak gerekir).

import type { OkeySeatPosition } from "./gameTypes";

export type OkeyEventType =
  | "TILE_DRAWN"
  | "TILE_DISCARDED"
  | "MELDS_OPENED"
  | "TILE_PROCESSED"
  | "ROUND_FINISHED"
  | "HAND_REORDERED"
  | "HAND_SORTED"
  | "ROUND_STARTED"
  | "COMMAND_REJECTED";

export interface OkeyGameEvent {
  type: OkeyEventType;
  /** Komutu tetikleyen oyuncunun id'si (bu fazda pratikte hep "me" / bottom). */
  playerId: string;
  /** Komutu tetikleyen koltuk. */
  seat: OkeySeatPosition;
  /** Event tipine göre değişen, opsiyonel ek veri (debug amaçlı). */
  payload?: unknown;
  /**
   * Kullanıcıya gösterilebilecek KISA Türkçe metin. Mevcut
   * gameActions.ts'teki lastAction metinleriyle TUTARLIDIR (başarılı
   * komutlarda genelde o metnin AYNISI kullanılır); COMMAND_REJECTED'de
   * gameErrors.ts'teki sabitlerden biridir.
   */
  message: string;
  /** Event'in üretildiği epoch ms zamanı (Date.now()). */
  createdAt: number;
}
