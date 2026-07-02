// 101 Okey prototip — sadece görsel/etkileşim mock tipleri.
// Gerçek oyun motoru (kural/puanlama/kazanan tespiti) burada YOK.

export type TileColor = "red" | "blue" | "gold" | "navy";

export interface Tile {
  /** Sahne genelinde benzersiz kimlik (React key + drag-drop kaynağı). */
  id: string;
  /** 1-13 arası taş değeri. Joker taşlarda anlamsız (0). */
  value: number;
  /** Klasik okey renk şeması: 1-4 kırmızı, 5-7 mavi, 8-10 altın, 11-13 lacivert/siyah. */
  color: TileColor;
  /** Joker (sahte okey) taşı mı? */
  isJoker?: boolean;
  /** Gösterge taşından hesaplanan "gerçek okey" mi? (hafif parıltı efekti için) */
  isOkey?: boolean;
}

export type SeatPosition = "bottom" | "top" | "left" | "right";

export interface Player {
  id: string;
  name: string;
  city: string;
  seat: SeatPosition;
  /** Yalnızca "bottom" (kullanıcı) için taşlar açık/gerçek; diğerleri kapalı sırt render eder. */
  tileCount: number;
  isActiveTurn?: boolean;
  /** Mini profil kartı için kısa tanıtım metni (mock). */
  bio?: string;
  /** Mini profil kartında etiket olarak gösterilecek ilgi alanları (mock). */
  interests?: string[];
}

export interface GameState {
  players: Player[];
  /** Kullanıcının (bottom) elindeki gerçek taşlar — 2 sıralı ıstaka. */
  myTiles: Tile[];
  /** Kapalı deste kalan taş sayısı (yalnız görsel yığın kalınlığı için). */
  drawPileCount: number;
  /** Açık/atılan son taş. */
  discardTile: Tile | null;
  /** Sırası gelen oyuncu id'si. */
  currentTurnPlayerId: string;
}
