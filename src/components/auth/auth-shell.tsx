"use client";

import { SparkleIcon } from "@phosphor-icons/react";
import { useLocale } from "@/i18n/locale-provider";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  const { t } = useLocale();
  return <main className="auth-shell"><section className="auth-visual"><div className="auth-logo">Picoo</div><div className="auth-spark"><SparkleIcon size={42} weight="fill" /></div><h2>Discover.<br />Remix. Create.</h2><p>{t("auth.visual.description")}</p><div className="auth-orb" /></section><section className="auth-panel"><h1>{title}</h1><p>{subtitle}</p>{children}</section></main>;
}
