export const SUPPORTED_LOCALES = ["zh-CN", "en"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "zh-CN";

export function isLocale(value: string): value is Locale {
  return SUPPORTED_LOCALES.some((locale) => locale === value);
}

export function resolveLocale(value?: string | null): Locale {
  if (!value) return DEFAULT_LOCALE;
  if (isLocale(value)) return value;
  const language = value.split(",")[0]?.split("-")[0];
  const aliases: Record<string, Locale> = { zh: "zh-CN", en: "en" };
  return aliases[language] ?? DEFAULT_LOCALE;
}
