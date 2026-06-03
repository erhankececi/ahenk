// Ahenk — Hediye kataloğu (tek kaynak). DB gift_catalog seed'i bununla AYNI olmalı
// (fiyat otoritesi DB'de; send_gift gift_catalog'tan okur). Kategoriler + sinematik
// animasyon seviyesi (tier) burada tanımlı.

export type GiftTier = "daily" | "premium" | "luxury" | "legend";

export type Gift = {
  key: string;
  name: string;
  emoji: string;
  category: GiftTier;
  cost: number; // jeton
};

export const GIFT_CATALOG: Gift[] = [
  // ---- Günlük ----
  { key: "ates", name: "Ateş", emoji: "🔥", category: "daily", cost: 10 },
  { key: "kahve", name: "Kahve", emoji: "☕", category: "daily", cost: 15 },
  { key: "gul", name: "Gül", emoji: "🌹", category: "daily", cost: 20 },
  { key: "tatli", name: "Tatlı", emoji: "🧁", category: "daily", cost: 25 },
  { key: "cikolata", name: "Çikolata", emoji: "🍫", category: "daily", cost: 30 },
  { key: "cicek", name: "Çiçek", emoji: "🌷", category: "daily", cost: 35 },
  { key: "kitap", name: "Kitap", emoji: "📚", category: "daily", cost: 40 },
  { key: "kalp", name: "Kalp", emoji: "💖", category: "daily", cost: 50 },

  // ---- Premium ----
  { key: "parfum", name: "Parfüm", emoji: "🧴", category: "premium", cost: 150 },
  { key: "buket", name: "Çiçek Buketi", emoji: "💐", category: "premium", cost: 200 },
  { key: "yemek", name: "Akşam Yemeği", emoji: "🍽️", category: "premium", cost: 250 },
  { key: "kolye", name: "Kolye", emoji: "📿", category: "premium", cost: 300 },
  { key: "taki", name: "Takı Kutusu", emoji: "💍", category: "premium", cost: 350 },
  { key: "saat", name: "Saat", emoji: "⌚", category: "premium", cost: 450 },
  { key: "tac", name: "Taç", emoji: "👑", category: "premium", cost: 500 },
  { key: "vipdavet", name: "VIP Davet", emoji: "🎟️", category: "premium", cost: 600 },

  // ---- Lüks ----
  { key: "aksamyemegi", name: "Lüks Akşam Yemeği", emoji: "🥂", category: "luxury", cost: 1000 },
  { key: "elmas", name: "Elmas", emoji: "💎", category: "luxury", cost: 1500 },
  { key: "elmasyuzuk", name: "Elmas Yüzük", emoji: "💍", category: "luxury", cost: 2500 },
  { key: "helikopter", name: "Helikopter Turu", emoji: "🚁", category: "luxury", cost: 3000 },
  { key: "yat", name: "Yat Turu", emoji: "🛥️", category: "luxury", cost: 4000 },
  { key: "sporaraba", name: "Spor Araba", emoji: "🏎️", category: "luxury", cost: 5000 },
  { key: "villa", name: "Lüks Villa Tatili", emoji: "🏖️", category: "luxury", cost: 6000 },
  { key: "superaraba", name: "Süper Araba", emoji: "🚗", category: "luxury", cost: 7000 },
  { key: "jet", name: "Özel Jet", emoji: "✈️", category: "luxury", cost: 8000 },

  // ---- Efsane ----
  { key: "superyat", name: "Süper Yat", emoji: "🛳️", category: "legend", cost: 20000 },
  { key: "dunyaturu", name: "Dünya Turu", emoji: "🌍", category: "legend", cost: 30000 },
  { key: "megayat", name: "Mega Yat", emoji: "🚢", category: "legend", cost: 40000 },
  { key: "ozada", name: "Özel Ada", emoji: "🏝️", category: "legend", cost: 60000 },
  { key: "kraliyet", name: "Kraliyet Paketi", emoji: "👑", category: "legend", cost: 80000 },
  { key: "uzay", name: "Uzay Yolculuğu", emoji: "🚀", category: "legend", cost: 100000 },
];

export const GIFT_CATEGORIES: { id: GiftTier; label: string }[] = [
  { id: "daily", label: "Günlük" },
  { id: "premium", label: "Premium" },
  { id: "luxury", label: "Lüks" },
  { id: "legend", label: "Efsane" },
];

export const giftByKey = (key: string) => GIFT_CATALOG.find((g) => g.key === key);
export const giftByName = (text: string) =>
  GIFT_CATALOG.find((g) => text.includes(g.name) && text.includes(g.emoji)) ||
  GIFT_CATALOG.find((g) => text.includes(g.name));
