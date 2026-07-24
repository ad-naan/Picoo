import Link from "next/link";
import { ArrowLeftIcon, GearIcon, HouseIcon, ShieldCheckIcon, UserCircleIcon, UsersIcon, CertificateIcon, SlidersHorizontalIcon, ChartLineUpIcon, StackIcon } from "@phosphor-icons/react/dist/ssr";

type DashboardArea = "settings" | "studio" | "admin";
const areaLabels: Record<DashboardArea, string> = { settings: "个人中心", studio: "Creator Studio", admin: "管理后台" };
const navigation = {
  settings: [["/settings/profile", UserCircleIcon, "个人资料"], ["/settings/security", ShieldCheckIcon, "账号安全"]],
  studio: [["/studio", ChartLineUpIcon, "创作概览"], ["/studio/creations", StackIcon, "我的作品"], ["/studio/verification", CertificateIcon, "创作者认证"]],
  admin: [["/admin", HouseIcon, "管理概览"], ["/admin/users", UsersIcon, "用户管理"], ["/admin/verifications", CertificateIcon, "认证审核"], ["/admin/settings", SlidersHorizontalIcon, "高级配置"]],
} satisfies Record<DashboardArea, readonly (readonly [string, React.ElementType, string])[]>;

export function DashboardShell({ area, userName, children }: { area: DashboardArea; userName: string; children: React.ReactNode }) {
  return <div className="dashboard-shell"><aside className="dashboard-sidebar"><Link className="dashboard-brand" href="/">Picoo</Link><div className="dashboard-area"><GearIcon size={17} weight="duotone" />{areaLabels[area]}</div><nav>{navigation[area].map(([href, Icon, label]) => <Link key={href} href={href}><Icon size={20} weight="duotone" />{label}</Link>)}</nav><div className="dashboard-user"><span>{userName.slice(0, 1).toUpperCase()}</span><div><b>{userName}</b><small>已安全登录</small></div></div><Link className="dashboard-back" href="/"><ArrowLeftIcon />返回社区</Link></aside><main className="dashboard-main">{children}</main></div>;
}
