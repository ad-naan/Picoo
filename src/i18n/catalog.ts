import zhCN from "./messages/zh-CN";
import en from "./messages/en";
import type { Locale } from "./config";

export type MessageKey = keyof typeof zhCN;
export type MessageCatalog = Record<MessageKey, string>;

export const localeMetadata: Record<Locale, { label: string; htmlLang: string; direction: "ltr" | "rtl" }> = {
  "zh-CN": { label: "简体中文", htmlLang: "zh-CN", direction: "ltr" },
  en: { label: "English", htmlLang: "en", direction: "ltr" },
};

export const messageCatalogs: Record<Locale, MessageCatalog> = { "zh-CN": zhCN, en };

export function translate(locale: Locale, key: MessageKey) {
  return messageCatalogs[locale][key];
}
