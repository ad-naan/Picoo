"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { AuthShell } from "@/components/auth/auth-shell";
import { useLocale } from "@/i18n/locale-provider";
import type { MessageKey } from "@/i18n/catalog";

const registrationErrors: Record<string, MessageKey> = {
  INVALID_INPUT: "auth.error.invalidInput",
  EMAIL_IN_USE: "auth.error.emailInUse",
  RATE_LIMITED: "auth.error.rateLimited",
  AUTH_SERVICE_UNAVAILABLE: "auth.error.serviceUnavailable",
  ACCOUNT_CREATE_FAILED: "auth.error.accountCreate",
};

export default function SignUpPage() {
  const { t } = useLocale();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(formData: FormData) {
    setPending(true); setError("");
    const payload = Object.fromEntries(formData.entries());
    const response = await fetch("/api/auth/register", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    if (!response.ok) {
      setPending(false);
      const body = await response.json().catch(() => ({})) as { error?: string };
      let messageKey: MessageKey = "auth.error.register";
      if (body.error && registrationErrors[body.error]) messageKey = registrationErrors[body.error];
      setError(t(messageKey));
      return;
    }
    await signIn("credentials", { email: payload.email, password: payload.password, redirect: false });
    router.push("/settings/profile"); router.refresh();
  }

  let submitLabel = t("auth.signUp.action");
  if (pending) submitLabel = t("auth.signUp.pending");
  return <AuthShell title={t("auth.signUp.title")} subtitle={t("auth.signUp.subtitle")}><form className="auth-form" action={submit}>{error && <div className="auth-error">{error}</div>}<label>{t("auth.name")}<input name="name" autoComplete="name" required minLength={2} maxLength={50} /></label><label>{t("auth.handle")}<input name="handle" autoComplete="username" required minLength={3} maxLength={30} pattern="[a-z0-9][a-z0-9_-]{2,29}" placeholder="picoo_creator" /><small>{t("auth.handleHint")}</small></label><label>{t("auth.email")}<input name="email" type="email" autoComplete="email" required /></label><label>{t("auth.password")}<input name="password" type="password" autoComplete="new-password" required minLength={10} maxLength={128} pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{10,128}" /><small>{t("auth.passwordHint")}</small></label><button className="auth-submit" disabled={pending}>{submitLabel}</button></form><p className="auth-switch">{t("auth.hasAccount")}<Link href="/sign-in">{t("auth.signIn.link")}</Link></p></AuthShell>;
}
