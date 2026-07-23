import { desc, eq, inArray } from "drizzle-orm";
import { getDatabase } from "@/infrastructure/database/client";
import { users, verificationApplications } from "@/infrastructure/database/schema";
import { approveVerification, rejectVerification } from "../actions";

export default async function AdminVerificationsPage() {
  const applications = await getDatabase().select({ id: verificationApplications.id, status: verificationApplications.status, statement: verificationApplications.statement, evidenceLinks: verificationApplications.evidenceLinks, submittedAt: verificationApplications.submittedAt, userName: users.name, userEmail: users.email }).from(verificationApplications).innerJoin(users, eq(users.id, verificationApplications.userId)).where(inArray(verificationApplications.status, ["submitted", "under_review"])).orderBy(desc(verificationApplications.submittedAt));
  return <><header className="dashboard-header"><div><h1>认证审核</h1><p>基于公开作品和创作者影响力进行审核。</p></div></header><section className="dashboard-card"><table className="dashboard-table"><thead><tr><th>申请人</th><th>申请说明</th><th>公开证明</th><th>操作</th></tr></thead><tbody>{applications.map((application) => <tr key={application.id}><td><b>{application.userName}</b><small>{application.userEmail}</small></td><td>{application.statement.slice(0, 100)}</td><td>{application.evidenceLinks.length} 个链接</td><td><div className="review-actions"><form action={approveVerification}><input type="hidden" name="applicationId" value={application.id} /><button className="approve">通过</button></form><form action={rejectVerification}><input type="hidden" name="applicationId" value={application.id} /><button>驳回</button></form></div></td></tr>)}</tbody></table>{applications.length === 0 && <p>当前没有待审核的认证申请。</p>}</section></>;
}
