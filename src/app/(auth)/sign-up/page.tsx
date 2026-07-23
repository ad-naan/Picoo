"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { AuthShell } from "@/components/auth/auth-shell";
import { useLocale } from "@/i18n/locale-provider";

export default function SignUpPage() {
  const { t } = useLocale();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(formData: FormData) {
    setPending(true); setError("");
    const payload = Object.fromEntries(formData.entries());
    const response = await fetch("/api/auth/register", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    if (!response.ok) { setPending(false); setError(t("auth.error.register")); return; }
    await signIn("credentials", { email: payload.email, password: payload.password, redirect: false });
    router.push("/settings/profile"); router.refresh();
  }

  return <AuthShell title={t("auth.signUp.title")} subtitle={t("auth.signUp.subtitle")}><form className="auth-form" action={submit}>{error && <div className="auth-error">{error}</div>}<label>{t("auth.name")}<input name="name" autoComplete="name" required minLength={2} /></label><label>{t("auth.handle")}<input name="handle" autoComplete="username" required minLength={3} placeholder="picoo_creator" /></label><label>{t("auth.email")}<input name="email" type="email" autoComplete="email" required /></label><label>{t("auth.password")}<input name="password" type="password" autoComplete="new-password" required minLength={10} /><small>{t("auth.passwordHint")}</small></label><button className="auth-submit" disabled={pending}>{pending ? t("auth.signUp.pending") : t("auth.signUp.action")}</button></form><p className="auth-switch">{t("auth.hasAccount")}<Link href="/sign-in">{t("auth.signIn.link")}</Link></p></AuthShell>;
}
