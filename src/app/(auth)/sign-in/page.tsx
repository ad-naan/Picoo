"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { AuthShell } from "@/components/auth/auth-shell";
import { useLocale } from "@/i18n/locale-provider";

export default function SignInPage() {
  const { t } = useLocale();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(formData: FormData) {
    setPending(true); setError("");
    const result = await signIn("credentials", { email: formData.get("email"), password: formData.get("password"), redirect: false });
    setPending(false);
    if (result?.error) { setError(t("auth.error.credentials")); return; }
    router.push("/"); router.refresh();
  }

  return <AuthShell title={t("auth.signIn.title")} subtitle={t("auth.signIn.subtitle")}><form className="auth-form" action={submit}>{error && <div className="auth-error">{error}</div>}<label>{t("auth.email")}<input name="email" type="email" autoComplete="email" required /></label><label>{t("auth.password")}<input name="password" type="password" autoComplete="current-password" required /></label><button className="auth-submit" disabled={pending}>{pending ? t("auth.signIn.pending") : t("auth.signIn.action")}</button></form><p className="auth-switch">{t("auth.noAccount")}<Link href="/sign-up">{t("auth.signUp.link")}</Link></p></AuthShell>;
}
