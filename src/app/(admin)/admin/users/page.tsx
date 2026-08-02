import type { ReactNode } from "react";
import { and, desc, eq, ilike, inArray, or, type SQL } from "drizzle-orm";
import { MagnifyingGlassIcon, PlusIcon, XIcon } from "@phosphor-icons/react/dist/ssr";
import { requirePermission } from "@/modules/identity/application/authorization";
import { ACCOUNT_STATUSES, USER_ROLES, can, type AccountStatus } from "@/modules/identity/domain/role";
import { getDatabase } from "@/infrastructure/database/client";
import { userRoles, users } from "@/infrastructure/database/schema";
import { getServerTranslator } from "@/i18n/server";
import { ACCOUNT_STATUS_MESSAGES, ROLE_MESSAGES } from "@/i18n/domain-labels";
import { grantUserRole, revokeUserRole, updateUserStatus } from "./actions";

const MANAGEABLE_STATUSES = ["active", "restricted", "suspended", "banned"] as const;

function normalizeStatus(value?: string) {
  if (!value) return undefined;
  if (ACCOUNT_STATUSES.includes(value as AccountStatus)) return value as AccountStatus;
  return undefined;
}

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const viewer = await requirePermission("user:read");
  const { locale, t } = await getServerTranslator();
  const params = await searchParams;
  const query = params.q?.trim().slice(0, 100) ?? "";
  const status = normalizeStatus(params.status);
  const conditions: SQL[] = [];
  if (query) conditions.push(or(ilike(users.name, `%${query}%`), ilike(users.email, `%${query}%`), ilike(users.handle, `%${query}%`)) as SQL);
  if (status) conditions.push(eq(users.status, status));

  let where: SQL | undefined;
  if (conditions.length > 0) where = and(...conditions);

  const userRows = await getDatabase()
    .select({ id: users.id, name: users.name, email: users.email, handle: users.handle, status: users.status, createdAt: users.createdAt })
    .from(users)
    .where(where)
    .orderBy(desc(users.createdAt))
    .limit(100);

  let roleRows: { userId: string; role: (typeof USER_ROLES)[number] }[] = [];
  if (userRows.length > 0) {
    roleRows = await getDatabase()
      .select({ userId: userRoles.userId, role: userRoles.role })
      .from(userRoles)
      .where(inArray(userRoles.userId, userRows.map((user) => user.id)));
  }

  const rolesByUser = new Map<string, (typeof USER_ROLES)[number][] >();
  for (const row of roleRows) {
    const roles = rolesByUser.get(row.userId) ?? [];
    roles.push(row.role);
    rolesByUser.set(row.userId, roles);
  }

  const canGrantRoles = can(viewer.roles, "role:grant");
  const viewerIsSuperAdmin = viewer.roles.includes("super_admin");

  return (
    <>
      <header className="dashboard-header">
        <div><h1>{t("admin.users.title")}</h1><p>{t("admin.users.subtitle")}</p></div>
        <span className="admin-result-count">{userRows.length} {t("admin.users.resultCount")}</span>
      </header>
      <form className="admin-filter-bar" method="get">
        <label><MagnifyingGlassIcon /><input name="q" defaultValue={query} placeholder={t("admin.users.searchPlaceholder")} /></label>
        <select name="status" defaultValue={status ?? ""}>
          <option value="">{t("admin.users.allStatuses")}</option>
          {ACCOUNT_STATUSES.map((accountStatus) => <option value={accountStatus} key={accountStatus}>{t(ACCOUNT_STATUS_MESSAGES[accountStatus])}</option>)}
        </select>
        <button>{t("admin.users.search")}</button>
      </form>
      <section className="dashboard-card admin-users-card">
        <table className="dashboard-table admin-users-table">
          <thead><tr><th>{t("admin.users.column.user")}</th><th>{t("admin.users.column.roles")}</th><th>{t("admin.users.column.status")}</th><th>{t("admin.users.column.created")}</th></tr></thead>
          <tbody>{userRows.map((user) => {
            const roles = rolesByUser.get(user.id) ?? [];
            const isSelf = user.id === viewer.id;
            const targetIsSuperAdmin = roles.includes("super_admin");
            let allowStatusChange = !isSelf;
            if (targetIsSuperAdmin && !viewerIsSuperAdmin) allowStatusChange = false;

            let statusControl: ReactNode = <span className={`status-badge ${user.status}`}>{t(ACCOUNT_STATUS_MESSAGES[user.status])}</span>;
            if (allowStatusChange) {
              statusControl = <form action={updateUserStatus} className="inline-admin-form"><input type="hidden" name="userId" value={user.id} /><select name="status" defaultValue={user.status} aria-label={t("admin.users.manageStatus")}>{MANAGEABLE_STATUSES.map((accountStatus) => <option value={accountStatus} key={accountStatus}>{t(ACCOUNT_STATUS_MESSAGES[accountStatus])}</option>)}</select><button title={t("admin.users.saveStatus")}>{t("admin.users.saveStatus")}</button></form>;
            }

            let grantControl: ReactNode = null;
            if (canGrantRoles && !isSelf) {
              grantControl = <form action={grantUserRole} className="inline-role-form"><input type="hidden" name="userId" value={user.id} /><select name="role" aria-label={t("admin.users.grantRole")}>{USER_ROLES.map((role) => <option key={role} value={role}>{t(ROLE_MESSAGES[role])}</option>)}</select><button aria-label={t("admin.users.addRole")} title={t("admin.users.addRole")}><PlusIcon /></button></form>;
            }

            let permissionNote: ReactNode = null;
            if (!canGrantRoles) permissionNote = <small className="role-permission-note">{t("admin.users.roleRestricted")}</small>;

            let selfLabel: ReactNode = null;
            if (isSelf) selfLabel = <em>{t("admin.users.you")}</em>;

            return <tr key={user.id}><td><div className="admin-user-identity"><span>{(user.name ?? user.email).slice(0, 1).toUpperCase()}</span><div><b>{user.name ?? t("admin.users.unnamed")} {selfLabel}</b><small>{user.email}<i />@{user.handle ?? "pending"}</small></div></div></td><td><div className="admin-role-stack">{roles.map((role) => {
              let removeControl: ReactNode = null;
              if (canGrantRoles && !isSelf && role !== "member") removeControl = <form action={revokeUserRole}><input type="hidden" name="userId" value={user.id} /><input type="hidden" name="role" value={role} /><button aria-label={t("admin.users.revokeRole")} title={t("admin.users.revokeRole")}><XIcon /></button></form>;
              return <span className={`role-badge role-${role}`} key={role}>{t(ROLE_MESSAGES[role])}{removeControl}</span>;
            })}{grantControl}</div>{permissionNote}</td><td>{statusControl}</td><td>{user.createdAt.toLocaleDateString(locale)}</td></tr>;
          })}</tbody>
        </table>
        {userRows.length === 0 && <div className="admin-empty-state">{t("admin.users.noResults")}</div>}
      </section>
    </>
  );
}
