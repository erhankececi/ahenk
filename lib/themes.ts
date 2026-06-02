// Premium profil arka plan temaları. CSS sınıfları globals.css'te (.theme-<id> + .theme-bg).
export const THEMES = [
  { id: "default", label: "Varsayılan", swatch: "#171923" },
  { id: "midnight", label: "Midnight Black", swatch: "#0b0b0f" },
  { id: "royalgold", label: "Royal Gold", swatch: "#2a2113" },
  { id: "ocean", label: "Ocean Blue", swatch: "#0d2438" },
  { id: "emerald", label: "Emerald Green", swatch: "#0c2a1d" },
  { id: "purple", label: "Purple Elite", swatch: "#241433" },
  { id: "titanium", label: "Titanium", swatch: "#1f2126" },
] as const;

/** Tema arka plan sınıfı (default -> boş, mevcut yüzey). */
export function themeClass(theme?: string | null): string {
  if (!theme || theme === "default") return "";
  return `theme-${theme} theme-bg`;
}
