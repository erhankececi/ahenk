// Premium profil arka plan temaları. CSS sınıfları globals.css'te (.theme-<id> + .theme-bg).
// Sessiz Lüks tema seti — neon/mor yok; onyx + metalik/mücevher tonlar.
export const THEMES = [
  { id: "default", label: "Onyx", swatch: "#17151A" },
  { id: "obsidian", label: "Obsidyen", swatch: "#0E0D10" },
  { id: "royalgold", label: "Royal Gold", swatch: "#2A2113" },
  { id: "champagne", label: "Şampanya", swatch: "#2A241A" },
  { id: "bronze", label: "Bronz", swatch: "#2A2018" },
  { id: "platinum", label: "Platin", swatch: "#1F2126" },
  { id: "emerald", label: "Zümrüt", swatch: "#14241D" },
  { id: "bordo", label: "Bordo", swatch: "#2A141A" },
  { id: "sapphire", label: "Safir", swatch: "#13203A" },
] as const;

/** Tema arka plan sınıfı (default -> boş, mevcut yüzey). */
export function themeClass(theme?: string | null): string {
  if (!theme || theme === "default") return "";
  return `theme-${theme} theme-bg`;
}
