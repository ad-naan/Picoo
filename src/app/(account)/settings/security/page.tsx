import { requireUser } from "@/modules/identity/application/authorization";
import { changePassword } from "../actions";

export default async function SecuritySettingsPage() {
  const user = await requireUser();
  return <><header className="dashboard-header"><div><h1>账号安全</h1><p>修改密码、检查登录状态并管理身份连接。</p></div></header><div className="dashboard-grid"><section className="dashboard-card"><h2>修改密码</h2><form className="dashboard-form" action={changePassword}><label>当前密码<input name="currentPassword" type="password" autoComplete="current-password" required /></label><label>新密码<input name="newPassword" type="password" autoComplete="new-password" minLength={10} required /><small>至少 10 位，包含大小写字母和数字。</small></label><button>更新密码</button></form></section><section className="dashboard-card"><h2>当前会话</h2><div className="metric"><strong>1</strong><span>{user.email} 当前设备已登录</span></div></section><section className="dashboard-card"><h2>多因素认证</h2><p>管理员账号将强制启用 TOTP；普通用户可在下一阶段自行开启。</p><button className="dashboard-action" disabled>即将开放</button></section></div></>;
}
