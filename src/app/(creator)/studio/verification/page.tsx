import { desc, eq } from "drizzle-orm";
import { requirePermission } from "@/modules/identity/application/authorization";
import { getDatabase } from "@/infrastructure/database/client";
import { verificationApplications } from "@/infrastructure/database/schema";
import { submitVerification } from "./actions";

export default async function CreatorVerificationPage() {
  const user = await requirePermission("verification:submit");
  const [application] = await getDatabase().select().from(verificationApplications).where(eq(verificationApplications.userId, user.id)).orderBy(desc(verificationApplications.createdAt)).limit(1);
  return <><header className="dashboard-header"><div><h1>创作者认证</h1><p>认证依据公开作品与专业影响力，不收集身份证件。</p></div>{application && <span className={`status-badge ${application.status}`}>{application.status}</span>}</header><div className="dashboard-row"><section className="dashboard-card"><h2>申请说明</h2><form className="dashboard-form" action={submitVerification}><label>创作经历与认证理由<textarea name="statement" minLength={60} maxLength={2000} required placeholder="介绍你的 AI 创作方向、代表作品和社区贡献..." /></label><label>公开证明链接<textarea name="evidence" required placeholder={"每行一个链接，例如：\nhttps://github.com/...\nhttps://your-site.com/..."} /><small>仅提交公开作品、主页或社交账号，不要提交证件和敏感信息。</small></label><button>提交认证申请</button></form></section><section className="dashboard-card"><h2>审核流程</h2><ol><li>提交公开作品与说明</li><li>管理员检查真实性和原创贡献</li><li>批准后授予 Creator 角色和认证徽章</li><li>认证可申诉、撤销并保留审计记录</li></ol>{application?.reviewNote && <p>审核备注：{application.reviewNote}</p>}</section></div></>;
}
