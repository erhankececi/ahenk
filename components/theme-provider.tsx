"use client";

import { createContext, useContext, useEffect } from "react";

type Theme = "dark" | "light";
const ThemeCtx = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "dark",
  toggle: () => {},
});

// Ahenk premium kimliği yalnızca grafit-siyah (dark). Light tema kaldırıldı —
// eski cihazlarda kayıtlı "light" tercihi de bu effect ile temizlenir.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.remove("light");
    try { localStorage.setItem("ahenk-theme", "dark"); } catch {}
  }, []);

  return (
    <ThemeCtx.Provider value={{ theme: "dark", toggle: () => {} }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export const useTheme = () => useContext(ThemeCtx);
