import { desc, eq } from "drizzle-orm";
import { getDatabase } from "@/infrastructure/database/client";
import { userRoles, users } from "@/infrastructure/database/schema";
import { getServerTranslator } from "@/i18n/server";
import { ACCOUNT_STATUS_MESSAGES, ROLE_MESSAGES } from "@/i18n/domain-labels";

export default async function AdminUsersPage() {
  const { locale, t } = await getServerTranslator();
  const rows = await getDatabase().select({ id: users.id, name: users.name, email: users.email, handle: users.handle, status: users.status, createdAt: users.createdAt, role: userRoles.role }).from(users).leftJoin(userRoles, eq(users.id, userRoles.userId)).orderBy(desc(users.createdAt)).limit(200);
  const grouped = new Map<string, { id: string; name: string | null; email: string; handle: string | null; status: string; createdAt: Date; roles: string[] }>();
  for (const row of rows) { const entry = grouped.get(row.id) ?? { ...row, roles: [] }; if (row.role) entry.roles.push(row.role); grouped.set(row.id, entry); }
  return <><header className="dashboard-header"><div><h1>{t("admin.users.title")}</h1><p>{t("admin.users.subtitle")}</p></div></header><section className="dashboard-card"><table className="dashboard-table"><thead><tr><th>{t("admin.users.column.user")}</th><th>{t("admin.users.column.roles")}</th><th>{t("admin.users.column.status")}</th><th>{t("admin.users.column.created")}</th></tr></thead><tbody>{[...grouped.values()].map((user) => <tr key={user.id}><td><b>{user.name ?? t("admin.users.unnamed")}</b><small>{user.email} · @{user.handle ?? "pending"}</small></td><td>{user.roles.map((role) => <span className="role-badge" key={role}>{t(ROLE_MESSAGES[role])}</span>)}</td><td><span className={`status-badge ${user.status}`}>{t(ACCOUNT_STATUS_MESSAGES[user.status])}</span></td><td>{user.createdAt.toLocaleDateString(locale)}</td></tr>)}</tbody></table></section></>;
}
