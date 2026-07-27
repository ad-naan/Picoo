"use client";

import Link from "next/link";
import {
  BellIcon as Bell, BookmarkSimpleIcon as Bookmark, RobotIcon as Bot, CubeIcon as Box,
  CaretDownIcon as ChevronDown, CaretRightIcon as ChevronRight, UserCircleIcon as CircleUserRound,
  CompassIcon as Compass, GiftIcon as Gift, HouseIcon as Home, LightbulbIcon as Lightbulb,
  ListIcon as Menu, NewspaperIcon as Newspaper, PlusIcon as Plus, MagnifyingGlassIcon as Search,
  SparkleIcon as Sparkles, StarIcon as Star, TrophyIcon as Trophy, MagicWandIcon as WandSparkles,
  FlowArrowIcon as Workflow, WrenchIcon as Wrench,
} from "@phosphor-icons/react";
import { useLocale } from "@/i18n/locale-provider";

type NavEntry = readonly [React.ElementType, string, string, string?];

const primaryNav: readonly NavEntry[] = [
  [Home, "首页", "/"], [Compass, "发现", "/explore"], [Star, "关注", "/explore?sort=latest"],
  [Lightbulb, "灵感", "/explore?sort=trending"], [Trophy, "排行榜", "/explore"], [Gift, "活动", "/explore", "New"],
];
const creationNav: readonly NavEntry[] = [
  [Box, "发布作品", "/studio/creations/new"], [CircleUserRound, "我的作品", "/studio/creations"],
  [Newspaper, "草稿箱", "/studio/creations"], [Bookmark, "收藏夹", "/settings/profile"],
];
const exploreNav: readonly NavEntry[] = [
  [Bot, "Agents", "/explore?type=agent"], [Workflow, "工作流", "/explore?type=workflow"],
  [WandSparkles, "Prompt", "/explore?type=prompt"], [Wrench, "工具", "/explore?type=tool"],
  [Newspaper, "资源", "/explore?type=article"],
];

function Logo() {
  return <div className="logo"><span className="logo-mark"><i /><i /><i /></span>Picoo</div>;
}

function NavItem({ item, active }: { item: NavEntry; active: boolean }) {
  const [Icon, label, href, badge] = item;
  return <Link href={href} className={`nav-item ${active ? "active" : ""}`}><Icon size={20} weight={active ? "fill" : "duotone"} /><span>{label}</span>{badge && <b>{badge}</b>}</Link>;
}

export function AppSidebar({ activeHref }: { activeHref?: string }) {
  return <aside className="sidebar">
    <div className="brand-row"><Logo /><button className="icon-button" aria-label="折叠菜单"><Menu size={18} /></button></div>
    <nav>
      {primaryNav.map((x) => <NavItem key={x[1]} item={x} active={x[2] === activeHref} />)}
      <p className="nav-label">创作</p>
      {creationNav.map((x) => <NavItem key={x[1]} item={x} active={x[2] === activeHref} />)}
      <p className="nav-label">探索</p>
      {exploreNav.map((x) => <NavItem key={x[1]} item={x} active={x[2] === activeHref} />)}
    </nav>
    <div className="inspiration"><Sparkles size={22} /><h3>每日灵感</h3><p>每天发现一个有趣的 AI 创意</p><Link href="/explore?sort=trending" className="inspiration-cta">去看看 <ChevronRight size={15} /></Link><div className="mini-bot">•ᴗ•</div></div>
  </aside>;
}

export function AppTopbar() {
  const { locale, setLocale, t } = useLocale();
  const alternateLocale = { "zh-CN": "en", en: "zh-CN" } as const;
  return <header className="topbar">
    <div className="search"><Search size={18} /><input placeholder={t("search.placeholder")} /><kbd>⌘K</kbd></div>
    <div className="top-actions">
      <button className="locale-button" onClick={() => setLocale(alternateLocale[locale])}>{t("locale.switch")}</button>
      <Link href="/studio/creations/new" className="publish"><Plus size={19} /> {t("action.publish")}</Link>
      <Link href="/settings/notifications" className="bell" aria-label="通知"><Bell size={20} /><i /></Link>
      <Link href="/settings/profile" className="avatar user">P</Link><ChevronDown size={16} />
    </div>
  </header>;
}

// 公开页外壳：侧栏 + 顶栏 + 内容区 + 右栏。首页保留自有实现以维持独特视觉。
export function AppShell({ children, rightRail, activeHref }: {
  children: React.ReactNode; rightRail?: React.ReactNode; activeHref?: string;
}) {
  return <div className="app-shell">
    <AppSidebar activeHref={activeHref} />
    <main className="main"><AppTopbar /><div className="content">{children}</div></main>
    {rightRail ?? <aside className="right-rail" />}
  </div>;
}
