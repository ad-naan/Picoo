import { requireUser } from "@/modules/identity/application/authorization";
import { getServerTranslator } from "@/i18n/server";
import { changePassword } from "../actions";

export default async function SecuritySettingsPage() {
  const user = await requireUser();
  const { t } = await getServerTranslator();
  return <><header className="dashboard-header"><div><h1>{t("settings.security.title")}</h1><p>{t("settings.security.subtitle")}</p></div></header><div className="dashboard-grid"><section className="dashboard-card"><h2>{t("settings.security.changePassword")}</h2><form className="dashboard-form" action={changePassword}><label>{t("settings.security.currentPassword")}<input name="currentPassword" type="password" autoComplete="current-password" required /></label><label>{t("settings.security.newPassword")}<input name="newPassword" type="password" autoComplete="new-password" minLength={10} required /><small>{t("settings.security.passwordHint")}</small></label><button>{t("settings.security.updatePassword")}</button></form></section><section className="dashboard-card"><h2>{t("settings.security.session")}</h2><div className="metric"><strong>1</strong><span>{user.email} · {t("settings.security.currentDevice")}</span></div></section><section className="dashboard-card"><h2>{t("settings.security.mfa")}</h2><p>{t("settings.security.mfaHint")}</p><button className="dashboard-action" disabled>{t("settings.security.comingSoon")}</button></section></div></>;
}
