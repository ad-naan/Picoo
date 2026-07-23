"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_LOCALE, resolveLocale, type Locale } from "./config";
import zhCN from "./messages/zh-CN";
import en from "./messages/en";
const dictionaries = { "zh-CN": zhCN, en } as const;
type MessageKey = keyof typeof zhCN;
type LocaleContextValue = { locale: Locale; setLocale: (locale: Locale) => void; t: (key: MessageKey) => string };
const LocaleContext = createContext<LocaleContextValue | null>(null);
export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, updateLocale] = useState<Locale>(DEFAULT_LOCALE);
  useEffect(() => { const saved = window.localStorage.getItem("picoo-locale"); updateLocale(resolveLocale(saved ?? window.navigator.language)); }, []);
  const setLocale = useCallback((next: Locale) => { updateLocale(next); window.localStorage.setItem("picoo-locale", next); document.documentElement.lang = next; }, []);
  const t = useCallback((key: MessageKey) => dictionaries[locale][key], [locale]);
  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
export function useLocale() { const context = useContext(LocaleContext); if (!context) throw new Error("useLocale must be used inside LocaleProvider"); return context; }
