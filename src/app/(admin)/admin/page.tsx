import { count, eq, inArray } from "drizzle-orm";
import { getDatabase } from "@/infrastructure/database/client";
import { users, verificationApplications } from "@/infrastructure/database/schema";

export default async function AdminDashboardPage() {
  const db = getDatabase();
  const [[userCount], [pendingCount]] = await Promise.all([
    db.select({ value: count() }).from(users),
    db.select({ value: count() }).from(verificationApplications).where(inArray(verificationApplications.status, ["submitted", "under_review"])),
  ]);
  return <><header className="dashboard-header"><div><h1>管理概览</h1><p>用户、认证、内容和平台运行状态。</p></div></header><div className="dashboard-grid"><section className="dashboard-card metric"><span>注册用户</span><strong>{userCount.value}</strong><small>包含待验证账号</small></section><section className="dashboard-card metric"><span>待审核认证</span><strong>{pendingCount.value}</strong><small>需要管理员处理</small></section><section className="dashboard-card metric"><span>平台状态</span><strong>正常</strong><small>PostgreSQL、Redis 与任务系统</small></section></div></>;
}
