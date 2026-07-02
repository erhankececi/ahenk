// Ahenk 101 — oda bekleme ekranı mock verisi.
// Gerçek backend/game server yok; yalnızca UI akışı (koltuk/hazır ol) için kullanılır.

import type { SeatPosition } from "./types";

export interface WaitingPlayer {
  id: string;
  name: string;
  city: string;
  seat: SeatPosition;
  isReady: boolean;
}

/** Oda sohbeti için mock mesajlar (herkes için sabit — prototip amaçlı). */
export const MOCK_ROOM_CHAT: { id: string; author: string; text: string }[] = [
  { id: "c1", author: "Murat K.", text: "Selam, hazır mısınız?" },
  { id: "c2", author: "Selin A.", text: "Sesli oynayalım mı?" },
  { id: "c3", author: "Onur D.", text: "Başlayalım." },
];

const OPPONENT_POOL: Omit<WaitingPlayer, "isReady">[] = [
  { id: "p-top", name: "Murat K.", city: "Ankara", seat: "top" },
  { id: "p-left", name: "Selin A.", city: "İzmir", seat: "left" },
  { id: "p-right", name: "Onur D.", city: "Bursa", seat: "right" },
];

/**
 * roomId'ye göre mock rakip oyuncuları üretir (deterministik — aynı oda her
 * zaman aynı rakipleri/hazır durumlarını gösterir). Bazı odalarda rakipler
 * zaten "hazır" başlar, bazılarında hiç rakip yoktur (boş koltuklar).
 */
export function getMockOpponents(roomId: string): WaitingPlayer[] {
  // roomId'den basit bir deterministik sayı üret (hash yerine karakter kodu toplamı yeterli).
  const seed = roomId.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const opponentCount = seed % 4; // 0, 1, 2 veya 3 rakip

  return OPPONENT_POOL.slice(0, opponentCount).map((p, i) => ({
    ...p,
    // Rakiplerin bir kısmı zaten hazır görünsün (mock canlılık hissi).
    isReady: (seed + i) % 2 === 0,
  }));
}
