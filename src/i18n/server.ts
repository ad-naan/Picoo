import "server-only";
import { cookies, headers } from "next/headers";
import { resolveLocale } from "./config";
import { translate, type MessageKey } from "./catalog";

export async function getRequestLocale() {
  const cookieStore = await cookies();
  const requestHeaders = await headers();
  const savedLocale = cookieStore.get("picoo-locale")?.value;
  const acceptedLanguages = requestHeaders.get("accept-language");
  return resolveLocale(savedLocale ?? acceptedLanguages);
}

export async function getServerTranslator() {
  const locale = await getRequestLocale();
  return { locale, t: (key: MessageKey) => translate(locale, key) };
}
