export const VIBES = [
  { id: "kahve", label: "Kahve içmek istiyorum", emoji: "☕" },
  { id: "sohbet", label: "Sohbet etmek istiyorum", emoji: "💬" },
  { id: "tanis", label: "Yeni insanlarla tanışmak istiyorum", emoji: "✨" },
  { id: "sessiz", label: "Sessizim", emoji: "🤫" },
  { id: "eglence", label: "Eğlenmek istiyorum", emoji: "🎉" },
  { id: "yalniz", label: "Yalnız kalmak istiyorum", emoji: "🌙" },
] as const;

export type VibeId = (typeof VIBES)[number]["id"];

export function vibeBilgisi(id?: string | null) {
  return VIBES.find((v) => v.id === id) || null;
}

/** Vibe 24 saatten eskiyse pasif sayılır (otomatik sıfırlama). */
export function vibeAktif(vibe?: string | null, vibeAt?: string | null): boolean {
  if (!vibe || !vibeAt) return false;
  return Date.now() - new Date(vibeAt).getTime() < 24 * 60 * 60 * 1000;
}
