"use client";

import Link from "next/link";
import { ArrowLeftIcon, BellIcon, GearIcon, HouseIcon, ShieldCheckIcon, UserCircleIcon, UsersIcon, CertificateIcon, SlidersHorizontalIcon, ChartLineUpIcon, StackIcon, FolderSimpleIcon, RssSimpleIcon, MedalIcon } from "@phosphor-icons/react/dist/ssr";
import { useLocale } from "@/i18n/locale-provider";
import type { MessageKey } from "@/i18n/catalog";

type DashboardArea = "settings" | "studio" | "admin";
const areaLabels: Record<DashboardArea, MessageKey> = { settings: "dashboard.area.settings", studio: "dashboard.area.studio", admin: "dashboard.area.admin" };
const navigation = {
  settings: [["/settings/profile", UserCircleIcon, "dashboard.nav.profile"], ["/settings/badges", MedalIcon, "dashboard.nav.badges"], ["/settings/collections", FolderSimpleIcon, "dashboard.nav.collections"], ["/settings/notifications", BellIcon, "dashboard.nav.notifications"], ["/settings/security", ShieldCheckIcon, "dashboard.nav.security"]],
  studio: [["/studio", ChartLineUpIcon, "dashboard.nav.overview"], ["/studio/creations", StackIcon, "dashboard.nav.creations"], ["/studio/verification", CertificateIcon, "dashboard.nav.verification"]],
  admin: [["/admin", HouseIcon, "dashboard.nav.adminOverview"], ["/admin/users", UsersIcon, "dashboard.nav.users"], ["/admin/verifications", CertificateIcon, "dashboard.nav.verifications"], ["/admin/badges", MedalIcon, "dashboard.nav.badges"], ["/admin/syndication", RssSimpleIcon, "dashboard.nav.syndication"], ["/admin/settings", SlidersHorizontalIcon, "dashboard.nav.advanced"]],
} satisfies Record<DashboardArea, readonly (readonly [string, React.ElementType, MessageKey])[]>;

export function DashboardShell({ area, userName, children }: { area: DashboardArea; userName: string; children: React.ReactNode }) {
  const { t } = useLocale();
  return <div className="dashboard-shell"><aside className="dashboard-sidebar"><Link className="dashboard-brand" href="/">Picoo</Link><div className="dashboard-area"><GearIcon size={17} weight="duotone" />{t(areaLabels[area])}</div><nav>{navigation[area].map(([href, Icon, label]) => <Link key={href} href={href}><Icon size={20} weight="duotone" />{t(label)}</Link>)}</nav><div className="dashboard-user"><span>{userName.slice(0, 1).toUpperCase()}</span><div><b>{userName}</b><small>{t("dashboard.signedIn")}</small></div></div><Link className="dashboard-back" href="/"><ArrowLeftIcon />{t("dashboard.back")}</Link></aside><main className="dashboard-main">{children}</main></div>;
}
