import Link from "next/link";
import { count, inArray } from "drizzle-orm";
import { ArrowRightIcon, CertificateIcon, CheckCircleIcon, MedalIcon, RssSimpleIcon, ShieldCheckIcon, StackIcon, UsersIcon } from "@phosphor-icons/react/dist/ssr";
import { getDatabase } from "@/infrastructure/database/client";
import { badges, creations, feedSubscriptions, users, verificationApplications } from "@/infrastructure/database/schema";
import { getServerTranslator } from "@/i18n/server";

export default async function AdminDashboardPage() {
  const { t } = await getServerTranslator();
  const db = getDatabase();
  const [[userCount], [pendingCount], [creationCount], [feedCount], [badgeCount]] = await Promise.all([
    db.select({ value: count() }).from(users),
    db.select({ value: count() }).from(verificationApplications).where(inArray(verificationApplications.status, ["submitted", "under_review"])),
    db.select({ value: count() }).from(creations),
    db.select({ value: count() }).from(feedSubscriptions),
    db.select({ value: count() }).from(badges),
  ]);
  const metrics = [
    { label: t("admin.metric.users"), value: userCount.value, hint: t("admin.metric.usersHint"), icon: UsersIcon, tone: "purple" },
    { label: t("admin.metric.creations"), value: creationCount.value, hint: t("admin.metric.creationsHint"), icon: StackIcon, tone: "blue" },
    { label: t("admin.metric.pending"), value: pendingCount.value, hint: t("admin.metric.pendingHint"), icon: CertificateIcon, tone: "amber" },
    { label: t("admin.metric.system"), value: t("admin.metric.healthy"), hint: t("admin.metric.systemHint"), icon: CheckCircleIcon, tone: "green" },
  ];
  const modules = [
    { href: "/admin/users", label: t("dashboard.nav.users"), description: t("admin.module.users"), icon: UsersIcon, count: userCount.value },
    { href: "/admin/verifications", label: t("dashboard.nav.verifications"), description: t("admin.module.verifications"), icon: ShieldCheckIcon, count: pendingCount.value },
    { href: "/admin/badges", label: t("dashboard.nav.badges"), description: t("admin.module.badges"), icon: MedalIcon, count: badgeCount.value },
    { href: "/admin/syndication", label: t("dashboard.nav.syndication"), description: t("admin.module.syndication"), icon: RssSimpleIcon, count: feedCount.value },
  ];
  return (
    <>
      <header className="dashboard-header"><div><h1>{t("admin.overview.title")}</h1><p>{t("admin.overview.subtitle")}</p></div><Link className="dashboard-action" href="/admin/settings">{t("dashboard.nav.advanced")}<ArrowRightIcon /></Link></header>
      <div className="admin-metric-grid">{metrics.map(({ label, value, hint, icon: Icon, tone }) => <section className={`admin-metric admin-tone-${tone}`} key={label}><div className="admin-metric-icon"><Icon weight="duotone" /></div><span>{label}</span><strong>{value}</strong><small>{hint}</small></section>)}</div>
      <div className="admin-overview-grid">
        <section className="dashboard-card admin-modules"><div className="admin-section-heading"><div><h2>{t("admin.modules.title")}</h2><p>{t("admin.modules.subtitle")}</p></div></div><div className="admin-module-list">{modules.map(({ href, label, description, icon: Icon, count: total }) => <Link href={href} key={href}><span className="admin-module-icon"><Icon weight="duotone" /></span><div><strong>{label}</strong><small>{description}</small></div><em>{total}</em><ArrowRightIcon /></Link>)}</div></section>
        <aside className="dashboard-card admin-system"><div className="admin-system-head"><span><CheckCircleIcon weight="fill" /></span><div><h2>{t("admin.system.title")}</h2><p>{t("admin.system.subtitle")}</p></div></div><div className="admin-system-list"><p><span>PostgreSQL</span><b>{t("admin.metric.healthy")}</b></p><p><span>Redis</span><b>{t("admin.system.degraded")}</b></p><p><span>Next.js</span><b>{t("admin.metric.healthy")}</b></p><p><span>{t("admin.system.jobs")}</span><b>{t("admin.metric.healthy")}</b></p></div><Link href="/admin/settings">{t("admin.system.configure")}<ArrowRightIcon /></Link></aside>
      </div>
    </>
  );
}
