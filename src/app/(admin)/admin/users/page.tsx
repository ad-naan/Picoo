import { desc, eq } from "drizzle-orm";
import { getDatabase } from "@/infrastructure/database/client";
import { userRoles, users } from "@/infrastructure/database/schema";

export default async function AdminUsersPage() {
  const rows = await getDatabase().select({ id: users.id, name: users.name, email: users.email, handle: users.handle, status: users.status, createdAt: users.createdAt, role: userRoles.role }).from(users).leftJoin(userRoles, eq(users.id, userRoles.userId)).orderBy(desc(users.createdAt)).limit(200);
  const grouped = new Map<string, { id: string; name: string | null; email: string; handle: string | null; status: string; createdAt: Date; roles: string[] }>();
  for (const row of rows) { const entry = grouped.get(row.id) ?? { ...row, roles: [] }; if (row.role) entry.roles.push(row.role); grouped.set(row.id, entry); }
  return <><header className="dashboard-header"><div><h1>用户管理</h1><p>查看账号状态、平台角色和注册信息。</p></div></header><section className="dashboard-card"><table className="dashboard-table"><thead><tr><th>用户</th><th>角色</th><th>状态</th><th>注册时间</th></tr></thead><tbody>{[...grouped.values()].map((user) => <tr key={user.id}><td><b>{user.name ?? "未设置昵称"}</b><small>{user.email} · @{user.handle ?? "pending"}</small></td><td>{user.roles.map((role) => <span className="role-badge" key={role}>{role}</span>)}</td><td><span className={`status-badge ${user.status}`}>{user.status}</span></td><td>{user.createdAt.toLocaleDateString("zh-CN")}</td></tr>)}</tbody></table></section></>;
}
