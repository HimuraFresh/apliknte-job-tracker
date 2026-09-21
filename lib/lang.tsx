"use client";

import { createContext, useContext } from "react";
import { dict, type Dict, type Locale } from "./dict";

const Ctx = createContext<{ t: Dict; locale: Locale }>({ t: dict.es, locale: "es" });

export function LangProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={{ t: dict[locale], locale }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);

export function setLocale(next: Locale) {
  document.cookie = `locale=${next}; path=/; max-age=31536000`;
  location.reload();
}

// El tema cambia al instante, sin recargar: basta con cambiar data-theme en <html>.
export function setTheme(next: "light" | "dark") {
  document.cookie = `theme=${next}; path=/; max-age=31536000`;
  document.documentElement.dataset.theme = next;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", next === "dark" ? "#0b0d12" : "#ffffff");
}
