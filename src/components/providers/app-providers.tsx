"use client";

import { SessionProvider } from "next-auth/react";
import { LocaleProvider } from "@/i18n/locale-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <SessionProvider><LocaleProvider>{children}</LocaleProvider></SessionProvider>;
}
