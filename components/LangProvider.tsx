"use client";

import { createContext, useContext } from "react";
import { getAppDict, normalizeLang, type Lang, type AppDict } from "@/lib/i18n";

type LangCtx = { lang: Lang; t: AppDict };

const Ctx = createContext<LangCtx>({ lang: "tr", t: getAppDict("tr") });

export function LangProvider({ lang, children }: { lang: string; children: React.ReactNode }) {
  const code = normalizeLang(lang);
  return <Ctx.Provider value={{ lang: code, t: getAppDict(code) }}>{children}</Ctx.Provider>;
}

/** Uygulama-içi client bileşenleri için aktif dil + sözlük. */
export function useLang() {
  return useContext(Ctx);
}
