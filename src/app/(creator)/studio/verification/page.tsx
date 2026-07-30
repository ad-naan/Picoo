import { desc, eq } from "drizzle-orm";
import { requirePermission } from "@/modules/identity/application/authorization";
import { getDatabase } from "@/infrastructure/database/client";
import { verificationApplications } from "@/infrastructure/database/schema";
import { VERIFICATION_STATUS_MESSAGES } from "@/i18n/domain-labels";
import { getServerTranslator } from "@/i18n/server";
import { submitVerification } from "./actions";

export default async function CreatorVerificationPage() {
  const user = await requirePermission("verification:submit");
  const { t } = await getServerTranslator();
  const [application] = await getDatabase().select().from(verificationApplications).where(eq(verificationApplications.userId, user.id)).orderBy(desc(verificationApplications.createdAt)).limit(1);
  return <><header className="dashboard-header"><div><h1>{t("studio.verification.title")}</h1><p>{t("studio.verification.subtitle")}</p></div>{application && <span className={`status-badge ${application.status}`}>{t(VERIFICATION_STATUS_MESSAGES[application.status])}</span>}</header><div className="dashboard-row"><section className="dashboard-card"><h2>{t("studio.verification.statementTitle")}</h2><form className="dashboard-form" action={submitVerification}><label>{t("studio.verification.statement")}<textarea name="statement" minLength={60} maxLength={2000} required placeholder={t("studio.verification.statementPlaceholder")} /></label><label>{t("studio.verification.evidence")}<textarea name="evidence" required placeholder={t("studio.verification.evidencePlaceholder")} /><small>{t("studio.verification.evidenceHint")}</small></label><button>{t("studio.verification.submit")}</button></form></section><section className="dashboard-card"><h2>{t("studio.verification.process")}</h2><ol><li>{t("studio.verification.step1")}</li><li>{t("studio.verification.step2")}</li><li>{t("studio.verification.step3")}</li><li>{t("studio.verification.step4")}</li></ol>{application?.reviewNote && <p>{t("studio.verification.reviewNote")}: {application.reviewNote}</p>}</section></div></>;
}
