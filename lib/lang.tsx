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
