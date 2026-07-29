"use client";

import { SessionProvider } from "next-auth/react";
import { LocaleProvider } from "@/i18n/locale-provider";
import type { Locale } from "@/i18n/config";

export function AppProviders({ children, locale }: { children: React.ReactNode; locale: Locale }) {
  return <SessionProvider><LocaleProvider initialLocale={locale}>{children}</LocaleProvider></SessionProvider>;
}
