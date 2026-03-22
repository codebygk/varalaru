"use client";

import { createContext, useContext } from "react";
import type { I18nContextValue, Lang, Strings } from "@/types";
import { STRINGS } from "@/lib/strings";

const I18nCtx = createContext<I18nContextValue>({
  lang: "en",
  s: STRINGS.en,
});

export function I18nProvider({
  lang,
  children,
}: {
  lang: Lang;
  children: React.ReactNode;
}) {
  const s: Strings = STRINGS[lang] ?? STRINGS.en;
  return <I18nCtx.Provider value={{ lang, s }}>{children}</I18nCtx.Provider>;
}

export function useS(): Strings {
  return useContext(I18nCtx).s;
}

export function useLang(): Lang {
  return useContext(I18nCtx).lang;
}
