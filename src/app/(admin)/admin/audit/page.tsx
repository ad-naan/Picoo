import { and, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr";
import { requirePermission } from "@/modules/identity/application/authorization";
import { getDatabase } from "@/infrastructure/database/client";
import { auditLogs, users } from "@/infrastructure/database/schema";
import { getServerTranslator } from "@/i18n/server";
import { AUDIT_ACTION_MESSAGES, AUDIT_OUTCOME_MESSAGES } from "@/i18n/domain-labels";
import type { MessageKey } from "@/i18n/catalog";

const AUDIT_OUTCOMES = ["success", "denied", "failed"] as const;
type AuditOutcome = (typeof AUDIT_OUTCOMES)[number];

function normalizeOutcome(value?: string) {
  if (!value) return undefined;
  if (AUDIT_OUTCOMES.includes(value as AuditOutcome)) return value as AuditOutcome;
  return undefined;
}

function resolveActionMessage(action: string): MessageKey {
  const message = AUDIT_ACTION_MESSAGES[action];
  if (message) return message;
  return "admin.audit.unknownAction";
}

export default async function AdminAuditPage({ searchParams }: { searchParams: Promise<{ q?: string; outcome?: string }> }) {
  await requirePermission("audit:read");
  const { locale, t } = await getServerTranslator();
  const params = await searchParams;
  const query = params.q?.trim().slice(0, 100) ?? "";
  const outcome = normalizeOutcome(params.outcome);
  const conditions: SQL[] = [];
  if (query) conditions.push(or(ilike(auditLogs.action, `%${query}%`), ilike(auditLogs.resourceType, `%${query}%`), ilike(auditLogs.resourceId, `%${query}%`)) as SQL);
  if (outcome) conditions.push(eq(auditLogs.outcome, outcome));

  let where: SQL | undefined;
  if (conditions.length > 0) where = and(...conditions);

  const entries = await getDatabase()
    .select({ id: auditLogs.id, action: auditLogs.action, resourceType: auditLogs.resourceType, resourceId: auditLogs.resourceId, outcome: auditLogs.outcome, createdAt: auditLogs.createdAt, actorName: users.name, actorEmail: users.email })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.actorId, users.id))
    .where(where)
    .orderBy(desc(auditLogs.createdAt))
    .limit(200);

  return (
    <>
      <header className="dashboard-header">
        <div><h1>{t("admin.audit.title")}</h1><p>{t("admin.audit.subtitle")}</p></div>
        <span className="admin-result-count">{entries.length} {t("admin.audit.resultCount")}</span>
      </header>
      <form className="admin-filter-bar" method="get">
        <label><MagnifyingGlassIcon /><input name="q" defaultValue={query} placeholder={t("admin.audit.searchPlaceholder")} /></label>
        <select name="outcome" defaultValue={outcome ?? ""}>
          <option value="">{t("admin.audit.allOutcomes")}</option>
          {AUDIT_OUTCOMES.map((auditOutcome) => <option value={auditOutcome} key={auditOutcome}>{t(AUDIT_OUTCOME_MESSAGES[auditOutcome])}</option>)}
        </select>
        <button>{t("admin.audit.search")}</button>
      </form>
      <section className="dashboard-card admin-users-card">
        <table className="dashboard-table admin-audit-table">
          <thead><tr><th>{t("admin.audit.column.actor")}</th><th>{t("admin.audit.column.action")}</th><th>{t("admin.audit.column.resource")}</th><th>{t("admin.audit.column.outcome")}</th><th>{t("admin.audit.column.time")}</th></tr></thead>
          <tbody>{entries.map((entry) => {
            let actor = t("admin.audit.system");
            if (entry.actorName) actor = entry.actorName;
            if (!entry.actorName && entry.actorEmail) actor = entry.actorEmail;
            let resourceId = "-";
            if (entry.resourceId) resourceId = entry.resourceId;
            return <tr key={entry.id}><td><b>{actor}</b><small>{entry.actorEmail}</small></td><td><b>{t(resolveActionMessage(entry.action))}</b><small className="audit-technical-label">{entry.action}</small></td><td><b>{entry.resourceType}</b><small className="audit-resource-id">{resourceId}</small></td><td><span className={`status-badge audit-${entry.outcome}`}>{t(AUDIT_OUTCOME_MESSAGES[entry.outcome])}</span></td><td><time dateTime={entry.createdAt.toISOString()}>{entry.createdAt.toLocaleString(locale)}</time></td></tr>;
          })}</tbody>
        </table>
        {entries.length === 0 && <div className="admin-empty-state">{t("admin.audit.empty")}</div>}
      </section>
    </>
  );
}
