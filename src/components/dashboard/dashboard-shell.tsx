"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftIcon,
  BellIcon,
  CaretRightIcon,
  CertificateIcon,
  ChartLineUpIcon,
  ClipboardTextIcon,
  FolderSimpleIcon,
  GearIcon,
  HouseIcon,
  MedalIcon,
  RssSimpleIcon,
  ShieldCheckIcon,
  SlidersHorizontalIcon,
  SparkleIcon,
  StackIcon,
  UserCircleIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import { useLocale } from "@/i18n/locale-provider";
import type { MessageKey } from "@/i18n/catalog";
import { cn } from "@/shared/lib/cn";

type DashboardArea = "settings" | "studio" | "admin";
type NavItem = readonly [string, React.ElementType, MessageKey];

const areaLabels: Record<DashboardArea, MessageKey> = {
  settings: "dashboard.area.settings",
  studio: "dashboard.area.studio",
  admin: "dashboard.area.admin",
};

const navigation: Record<DashboardArea, readonly NavItem[]> = {
  settings: [
    ["/settings/profile", UserCircleIcon, "dashboard.nav.profile"],
    ["/settings/badges", MedalIcon, "dashboard.nav.badges"],
    ["/settings/collections", FolderSimpleIcon, "dashboard.nav.collections"],
    ["/settings/notifications", BellIcon, "dashboard.nav.notifications"],
    ["/settings/security", ShieldCheckIcon, "dashboard.nav.security"],
  ],
  studio: [
    ["/studio", ChartLineUpIcon, "dashboard.nav.overview"],
    ["/studio/creations", StackIcon, "dashboard.nav.creations"],
    ["/studio/verification", CertificateIcon, "dashboard.nav.verification"],
  ],
  admin: [
    ["/admin", HouseIcon, "dashboard.nav.adminOverview"],
    ["/admin/users", UsersIcon, "dashboard.nav.users"],
    ["/admin/verifications", CertificateIcon, "dashboard.nav.verifications"],
    ["/admin/badges", MedalIcon, "dashboard.nav.badges"],
    ["/admin/syndication", RssSimpleIcon, "dashboard.nav.syndication"],
    ["/admin/audit", ClipboardTextIcon, "dashboard.nav.audit"],
    ["/admin/settings", SlidersHorizontalIcon, "dashboard.nav.advanced"],
  ],
};

function isActivePath(pathname: string, href: string) {
  if (pathname === href) return true;
  if (href === "/admin" || href === "/studio") return false;
  return pathname.startsWith(`${href}/`);
}

export function DashboardShell({ area, userName, children }: { area: DashboardArea; userName: string; children: React.ReactNode }) {
  const { t } = useLocale();
  const pathname = usePathname();
  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <Link className="dashboard-brand" href="/"><span className="dashboard-brand-symbol"><i /><i /><i /></span><span>Picoo</span></Link>
        <div className="dashboard-area"><span><SparkleIcon weight="fill" /></span><div><small>{t("dashboard.workspace")}</small><strong>{t(areaLabels[area])}</strong></div></div>
        <p className="dashboard-nav-label">{t("dashboard.navigation")}</p>
        <nav>{navigation[area].map(([href, Icon, label]) => {
          const active = isActivePath(pathname, href);
          let weight: "fill" | "duotone" = "duotone";
          if (active) weight = "fill";
          return <Link key={href} href={href} className={cn({ active })}><Icon size={19} weight={weight} /><span>{t(label)}</span>{active && <CaretRightIcon className="dashboard-nav-caret" weight="bold" />}</Link>;
        })}</nav>
        <div className="dashboard-sidebar-footer">
          <div className="dashboard-user"><span>{userName.slice(0, 1).toUpperCase()}</span><div><b>{userName}</b><small>{t("dashboard.signedIn")}</small></div></div>
          <Link className="dashboard-back" href="/"><ArrowLeftIcon />{t("dashboard.back")}</Link>
        </div>
      </aside>
      <main className="dashboard-main">
        <div className="dashboard-topline"><div><span className="dashboard-topline-dot" />Picoo Control Center</div><Link href="/">{t("dashboard.viewSite")}<CaretRightIcon /></Link></div>
        <div className="dashboard-content">{children}</div>
      </main>
    </div>
  );
}
