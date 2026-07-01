// Ahenk — Hediye kataloğu (TikTok/Bigo seviyesi). Tek kaynak; DB gift_catalog seed'i
// bununla AYNI key/cost olmalı (fiyat otoritesi DB; send_gift oradan okur).
// category + rarity + fx (animasyon) frontend metadata'sıdır.

export type GiftCategory =
  | "romantik" | "luks" | "vip" | "seyahat" | "kraliyet" | "efsane" | "ozel";
export type Rarity = "common" | "rare" | "epic" | "legendary" | "mythic";
export type GiftFx =
  | "petals" | "burst" | "drive" | "fly" | "sea" | "build" | "spin" | "ocean" | "royal" | "rise";

export type Gift = {
  key: string;
  name: string;
  emoji: string;
  category: GiftCategory;
  cost: number;
  rarity: Rarity;
  fx: GiftFx;
};

export const GIFT_CATEGORIES: { id: GiftCategory; label: string; emoji: string }[] = [
  { id: "romantik", label: "Romantik", emoji: "❤️" },
  { id: "luks", label: "Lüks", emoji: "💎" },
  { id: "vip", label: "VIP", emoji: "🏆" },
  { id: "seyahat", label: "Seyahat", emoji: "🌍" },
  { id: "kraliyet", label: "Kraliyet", emoji: "👑" },
  { id: "efsane", label: "Efsane", emoji: "🚀" },
  { id: "ozel", label: "Özel", emoji: "🎉" },
];

export const RARITY: Record<Rarity, { label: string; from: string; to: string; ring: string; text: string }> = {
  common:    { label: "Common",    from: "#1b2336", to: "#131a2b", ring: "rgba(148,163,184,0.5)", text: "#cbd5e1" },
  rare:      { label: "Rare",      from: "#0e2a3a", to: "#0b1726", ring: "rgba(56,189,248,0.6)",  text: "#7dd3fc" },
  epic:      { label: "Epic",      from: "#241433", to: "#160d22", ring: "rgba(168,85,247,0.65)", text: "#d8b4fe" },
  legendary: { label: "Legendary", from: "#2a2113", to: "#1a1408", ring: "rgba(212,176,106,0.8)", text: "#f6e27a" },
  mythic:    { label: "Mythic",    from: "#2a0f1a", to: "#1a0a12", ring: "rgba(244,114,128,0.85)",text: "#fda4af" },
};

export const GIFT_CATALOG: Gift[] = [
  // ❤️ Romantik
  { key: "kahve", name: "Kahve", emoji: "☕", category: "romantik", cost: 15, rarity: "common", fx: "rise" },
  { key: "gul", name: "Gül", emoji: "🌹", category: "romantik", cost: 20, rarity: "common", fx: "petals" },
  { key: "cikolata", name: "Çikolata", emoji: "🍫", category: "romantik", cost: 30, rarity: "common", fx: "rise" },
  { key: "pasta", name: "Pasta", emoji: "🎂", category: "romantik", cost: 45, rarity: "common", fx: "rise" },
  { key: "kalp", name: "Kalp", emoji: "💖", category: "romantik", cost: 60, rarity: "common", fx: "petals" },
  { key: "pelus", name: "Peluş", emoji: "🧸", category: "romantik", cost: 80, rarity: "common", fx: "rise" },
  { key: "buket", name: "Buket", emoji: "💐", category: "romantik", cost: 150, rarity: "rare", fx: "petals" },

  // 💎 Lüks
  { key: "parfum", name: "Parfüm", emoji: "🧴", category: "luks", cost: 200, rarity: "rare", fx: "burst" },
  { key: "kolye", name: "Kolye", emoji: "📿", category: "luks", cost: 350, rarity: "rare", fx: "burst" },
  { key: "saat", name: "Saat", emoji: "⌚", category: "luks", cost: 500, rarity: "rare", fx: "burst" },
  { key: "yuzuk", name: "Yüzük", emoji: "💍", category: "luks", cost: 900, rarity: "rare", fx: "burst" },
  { key: "elmas", name: "Elmas", emoji: "💎", category: "luks", cost: 1500, rarity: "epic", fx: "burst" },
  { key: "birkin", name: "Birkin", emoji: "👜", category: "luks", cost: 3000, rarity: "epic", fx: "burst" },

  // 🏆 VIP
  { key: "vipdavet", name: "VIP Davet", emoji: "🎟️", category: "vip", cost: 700, rarity: "rare", fx: "royal" },
  { key: "elmasyuzuk", name: "Elmas Yüzük", emoji: "💍", category: "vip", cost: 2500, rarity: "epic", fx: "burst" },
  { key: "rolex", name: "Rolex", emoji: "⌚", category: "vip", cost: 5000, rarity: "epic", fx: "burst" },
  { key: "ferrari", name: "Ferrari", emoji: "🏎️", category: "vip", cost: 8000, rarity: "epic", fx: "drive" },

  // 🌍 Seyahat
  { key: "helikopter", name: "Helikopter", emoji: "🚁", category: "seyahat", cost: 3000, rarity: "epic", fx: "fly" },
  { key: "yat", name: "Yat", emoji: "🛥️", category: "seyahat", cost: 5000, rarity: "epic", fx: "sea" },
  { key: "villa", name: "Villa Tatili", emoji: "🏖️", category: "seyahat", cost: 7000, rarity: "epic", fx: "ocean" },
  { key: "jet", name: "Özel Jet", emoji: "✈️", category: "seyahat", cost: 9000, rarity: "legendary", fx: "fly" },

  // ❤️ Romantik landmark
  { key: "askkulesi", name: "Aşk Kulesi", emoji: "🗼", category: "kraliyet", cost: 50000, rarity: "legendary", fx: "build" },

  // 👑 Kraliyet
  { key: "tac", name: "Taç", emoji: "👑", category: "kraliyet", cost: 600, rarity: "rare", fx: "royal" },
  { key: "sato", name: "Şato", emoji: "🏰", category: "kraliyet", cost: 15000, rarity: "legendary", fx: "build" },
  { key: "kraliyet", name: "Kraliyet Paketi", emoji: "👑", category: "kraliyet", cost: 80000, rarity: "mythic", fx: "royal" },

  // 🚀 Efsane
  { key: "superaraba", name: "Süper Araba", emoji: "🚗", category: "efsane", cost: 12000, rarity: "legendary", fx: "drive" },
  { key: "superyat", name: "Süper Yat", emoji: "🛳️", category: "efsane", cost: 20000, rarity: "legendary", fx: "sea" },
  { key: "dunya", name: "Dünya Turu", emoji: "🌎", category: "efsane", cost: 30000, rarity: "legendary", fx: "spin" },
  { key: "megayat", name: "Mega Yat", emoji: "🚢", category: "efsane", cost: 40000, rarity: "legendary", fx: "sea" },
  { key: "ada", name: "Özel Ada", emoji: "🏝️", category: "efsane", cost: 60000, rarity: "mythic", fx: "ocean" },
  { key: "uzay", name: "Uzay Yolculuğu", emoji: "🚀", category: "efsane", cost: 100000, rarity: "mythic", fx: "fly" },

  // 🎉 Özel
  { key: "ates", name: "Ateş", emoji: "🔥", category: "ozel", cost: 10, rarity: "common", fx: "rise" },
  { key: "tatli", name: "Tatlı", emoji: "🧁", category: "ozel", cost: 25, rarity: "common", fx: "rise" },
  { key: "cicek", name: "Çiçek", emoji: "🌷", category: "ozel", cost: 35, rarity: "common", fx: "petals" },
  { key: "konfeti", name: "Konfeti", emoji: "🎉", category: "ozel", cost: 100, rarity: "rare", fx: "royal" },
];

// Gönderim animasyon karakteri (overlay'de hediyeye özel his)
export const GIFT_ANIM: Record<string, string> = {
  superyat: "yacht", megayat: "yacht", yat: "yacht",
  dunya: "orbit", ada: "island", kraliyet: "crown", tac: "crown",
  uzay: "rocket", jet: "rocket", helikopter: "rocket",
  superaraba: "car", ferrari: "car", elmas: "diamond", elmasyuzuk: "diamond", yuzuk: "diamond",
  askkulesi: "romantic", gul: "romantic", kalp: "romantic", buket: "romantic",
};
export const animType = (key: string): string => GIFT_ANIM[key] || "default";

export const giftByKey = (key: string) => GIFT_CATALOG.find((g) => g.key === key);
// En uzun isim eşleşmesini seç (ör. "Elmas Yüzük" > "Yüzük" — aynı emoji çakışması).
export const giftByName = (text: string): Gift | undefined => {
  const strong = GIFT_CATALOG.filter((g) => text.includes(g.name) && text.includes(g.emoji));
  if (strong.length) return strong.sort((a, b) => b.name.length - a.name.length)[0];
  const weak = GIFT_CATALOG.filter((g) => text.includes(g.name));
  return weak.sort((a, b) => b.name.length - a.name.length)[0];
};
