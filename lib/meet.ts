// Ahenk — gerçek buluşma türleri.
export const MEET_KINDS = [
  { key: "kahve", label: "Kahve", emoji: "☕" },
  { key: "yemek", label: "Akşam Yemeği", emoji: "🍽️" },
  { key: "sinema", label: "Sinema", emoji: "🎬" },
  { key: "yuruyus", label: "Yürüyüş", emoji: "🚶" },
  { key: "muze", label: "Müze", emoji: "🏛️" },
  { key: "konser", label: "Konser", emoji: "🎵" },
];
export const meetByKey = (k: string) => MEET_KINDS.find((m) => m.key === k);
