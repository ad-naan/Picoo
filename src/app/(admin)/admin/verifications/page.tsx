import { desc, eq, inArray } from "drizzle-orm";
import { getDatabase } from "@/infrastructure/database/client";
import { users, verificationApplications } from "@/infrastructure/database/schema";
import { getServerTranslator } from "@/i18n/server";
import { approveVerification, rejectVerification } from "../actions";

export default async function AdminVerificationsPage() {
  const { t } = await getServerTranslator();
  const applications = await getDatabase().select({ id: verificationApplications.id, status: verificationApplications.status, statement: verificationApplications.statement, evidenceLinks: verificationApplications.evidenceLinks, submittedAt: verificationApplications.submittedAt, userName: users.name, userEmail: users.email }).from(verificationApplications).innerJoin(users, eq(users.id, verificationApplications.userId)).where(inArray(verificationApplications.status, ["submitted", "under_review"])).orderBy(desc(verificationApplications.submittedAt));
  return <><header className="dashboard-header"><div><h1>{t("admin.verifications.title")}</h1><p>{t("admin.verifications.subtitle")}</p></div></header><section className="dashboard-card"><table className="dashboard-table"><thead><tr><th>{t("admin.verifications.applicant")}</th><th>{t("admin.verifications.statement")}</th><th>{t("admin.verifications.evidence")}</th><th>{t("common.actions")}</th></tr></thead><tbody>{applications.map((application) => <tr key={application.id}><td><b>{application.userName}</b><small>{application.userEmail}</small></td><td>{application.statement.slice(0, 100)}</td><td>{application.evidenceLinks.length} {t("common.links")}</td><td><div className="review-actions"><form action={approveVerification}><input type="hidden" name="applicationId" value={application.id} /><button className="approve">{t("admin.verifications.approve")}</button></form><form action={rejectVerification}><input type="hidden" name="applicationId" value={application.id} /><button>{t("admin.verifications.reject")}</button></form></div></td></tr>)}</tbody></table>{applications.length === 0 && <p>{t("admin.verifications.empty")}</p>}</section></>;
}
