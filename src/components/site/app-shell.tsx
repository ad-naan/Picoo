"use client";

import Link from "next/link";
import {
  BookmarkSimpleIcon,
  CaretRightIcon,
  CompassIcon,
  FlowArrowIcon,
  GiftIcon,
  HouseIcon,
  ListIcon,
  MagicWandIcon,
  MagnifyingGlassIcon,
  NewspaperIcon,
  PlusIcon,
  RobotIcon,
  SparkleIcon,
  SquaresFourIcon,
  UsersThreeIcon,
  WrenchIcon,
} from "@phosphor-icons/react";
import type { MessageKey } from "@/i18n/catalog";
import { useLocale } from "@/i18n/locale-provider";
import { UserMenu } from "@/components/site/user-menu";
import { cn } from "@/shared/lib/cn";

type NavEntry = Readonly<{
  icon: React.ElementType;
  label: MessageKey;
  href: string;
  badge?: string;
}>;

const primaryNav: readonly NavEntry[] = [
  { icon: HouseIcon, label: "nav.home", href: "/" },
  { icon: CompassIcon, label: "nav.explore", href: "/explore" },
  { icon: UsersThreeIcon, label: "nav.following", href: "/explore?sort=latest" },
  { icon: SparkleIcon, label: "nav.inspiration", href: "/explore?sort=trending" },
  { icon: GiftIcon, label: "nav.deals", href: "/explore?type=tool", badge: "NEW" },
];

const libraryNav: readonly NavEntry[] = [
  { icon: RobotIcon, label: "creation.type.agent", href: "/explore?type=agent" },
  { icon: FlowArrowIcon, label: "creation.type.workflow", href: "/explore?type=workflow" },
  { icon: MagicWandIcon, label: "creation.type.prompt", href: "/explore?type=prompt" },
  { icon: WrenchIcon, label: "creation.type.tool", href: "/explore?type=tool" },
  { icon: NewspaperIcon, label: "creation.type.article", href: "/explore?type=article" },
];

function Logo() {
  return (
    <Link href="/" className="logo" aria-label="Picoo">
      <span className="logo-symbol" aria-hidden="true"><i /><i /><i /><b /></span>
      <span>Picoo</span>
    </Link>
  );
}

function NavItem({ item, active }: { item: NavEntry; active: boolean }) {
  const { t } = useLocale();
  const Icon = item.icon;
  let weight: "fill" | "duotone" = "duotone";
  if (active) weight = "fill";
  return (
    <Link href={item.href} className={cn("nav-item", { active })}>
      <Icon size={20} weight={weight} />
      <span>{t(item.label)}</span>
      {item.badge && <b>{item.badge}</b>}
    </Link>
  );
}

export function AppSidebar({ activeHref }: { activeHref?: string }) {
  const { t } = useLocale();
  return (
    <aside className="sidebar">
      <div className="brand-row">
        <Logo />
        <button className="icon-button" aria-label={t("nav.collapse")}><ListIcon size={18} /></button>
      </div>
      <nav className="sidebar-navigation">
        <div className="nav-cluster">{primaryNav.map((item) => <NavItem key={item.href} item={item} active={item.href === activeHref} />)}</div>
        <p className="nav-label">{t("nav.library")}</p>
        <div className="nav-cluster">{libraryNav.map((item) => <NavItem key={item.href} item={item} active={item.href === activeHref} />)}</div>
      </nav>
      <div className="sidebar-create-card">
        <span><SparkleIcon weight="fill" /></span>
        <strong>{t("nav.createTitle")}</strong>
        <p>{t("nav.createDescription")}</p>
        <Link href="/studio/creations/new">{t("explore.startCreating")}<CaretRightIcon weight="bold" /></Link>
      </div>
      <Link className="sidebar-collection" href="/settings/collections"><BookmarkSimpleIcon weight="duotone" />{t("dashboard.nav.collections")}</Link>
    </aside>
  );
}

export function AppTopbar() {
  const { locale, setLocale, t } = useLocale();
  const nextLocale = new Map([["zh-CN", "en"], ["en", "zh-CN"]] as const).get(locale) ?? "zh-CN";
  return (
    <header className="topbar">
      <label className="search">
        <MagnifyingGlassIcon size={18} />
        <input aria-label={t("search.placeholder")} placeholder={t("search.placeholder")} />
        <kbd>⌘ K</kbd>
      </label>
      <div className="top-actions">
        <button className="locale-button" onClick={() => setLocale(nextLocale)}>{t("locale.switch")}</button>
        <Link href="/studio/creations/new" className="publish"><PlusIcon size={18} weight="bold" /><span>{t("action.publish")}</span></Link>
        <UserMenu />
      </div>
    </header>
  );
}

export function AppShell({ children, rightRail, activeHref }: {
  children: React.ReactNode;
  rightRail?: React.ReactNode;
  activeHref?: string;
}) {
  let shellClassName = "app-shell shell-without-rail";
  if (rightRail) shellClassName = "app-shell";
  return (
    <div className={shellClassName}>
      <AppSidebar activeHref={activeHref} />
      <AppTopbar />
      <main className="main"><div className="content">{children}</div></main>
      {rightRail}
    </div>
  );
}
