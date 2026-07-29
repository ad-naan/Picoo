"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_LOCALE, resolveLocale, type Locale } from "./config";
import { translate, type MessageKey } from "./catalog";
type LocaleContextValue = { locale: Locale; setLocale: (locale: Locale) => void; t: (key: MessageKey) => string };
const LocaleContext = createContext<LocaleContextValue | null>(null);
export function LocaleProvider({ children, initialLocale = DEFAULT_LOCALE }: { children: React.ReactNode; initialLocale?: Locale }) {
  const [locale, updateLocale] = useState<Locale>(initialLocale);
  useEffect(() => { const saved = window.localStorage.getItem("picoo-locale"); if (saved) updateLocale(resolveLocale(saved)); }, []);
  const setLocale = useCallback((next: Locale) => { updateLocale(next); window.localStorage.setItem("picoo-locale", next); document.cookie = `picoo-locale=${encodeURIComponent(next)}; Path=/; Max-Age=31536000; SameSite=Lax`; document.documentElement.lang = next; }, []);
  const t = useCallback((key: MessageKey) => translate(locale, key), [locale]);
  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
export function useLocale() { const context = useContext(LocaleContext); if (!context) throw new Error("useLocale must be used inside LocaleProvider"); return context; }
