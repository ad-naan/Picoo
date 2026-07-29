"use client";

import Link from "next/link";
import {
  RobotIcon as Bot, CaretRightIcon as ChevronRight,
  FireIcon as Flame, GiftIcon as Gift,
  LinkSimpleIcon as Link2, NewspaperIcon as Newspaper,
  SparkleIcon as Sparkles,
  UserPlusIcon as UserRoundPlus, MagicWandIcon as WandSparkles, FlowArrowIcon as Workflow, WrenchIcon as Wrench,
  CrownSimpleIcon, CalendarDotsIcon, PulseIcon,
} from "@phosphor-icons/react";
import { useLocale } from "@/i18n/locale-provider";
import { CreationCard, type CreationCardData } from "@/components/site/creation-card";
import type { TopCreator } from "@/infrastructure/creation/creation-queries";
import { AppShell } from "@/components/site/app-shell";

const categories = [
  { icon: Bot, title: "AI Agents", sub: "智能体", tone: "violet", href: "/explore?type=agent" },
  { icon: Workflow, title: "工作流", sub: "自动化流程", tone: "mint", href: "/explore?type=workflow" },
  { icon: WandSparkles, title: "Prompt", sub: "提示词", tone: "pink", href: "/explore?type=prompt" },
  { icon: Wrench, title: "工具", sub: "AI 工具", tone: "blue", href: "/explore?type=tool" },
  { icon: Newspaper, title: "创意资源", sub: "素材 & 资源", tone: "purple", href: "/explore?type=article" },
  { icon: Gift, title: "免费福利", sub: "限时收集", tone: "orange", href: "/explore" },
];

function RailTitle({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return <b className="rail-title"><span className="rail-title-icon"><Icon size={15} weight="fill" /></span>{children}</b>;
}

function RightRail({ creators }: { creators: TopCreator[] }) {
  const activityActions = ["发布了新作品", "点赞了你的作品", "收藏了你的作品", "关注了你"];
  const activityTimes = ["10 分钟前", "30 分钟前", "1 小时前", "2 小时前"];
  return <aside className="right-rail">
    <section className="rail-card"><header><RailTitle icon={CrownSimpleIcon}>本周热门作者</RailTitle><Link href="/explore">全部榜单 <ChevronRight size={14} weight="bold" /></Link></header><div className="creator-list">{creators.map((c, i) => <Link className="creator" href={`/creator/${c.handle}`} key={c.handle}><em>{i + 1}</em><span className={`avatar a${i}`}>{c.handle[0]?.toUpperCase()}</span><div><strong>@{c.handle}</strong><small>{c.specialty}</small></div><span>{c.followers}</span></Link>)}</div></section>
    <section className="rail-card"><header><RailTitle icon={CalendarDotsIcon}>社区活动</RailTitle><Link href="/explore">全部活动 <ChevronRight size={14} weight="bold" /></Link></header><div className="event"><span>进行中</span><h3>Picoo 创意挑战赛</h3><p>用 AI 创造未来城市</p><small>07.01 - 07.21</small><button>立即参与</button><div className="city">▥ ▤ ▥</div></div></section>
    <section className="rail-card activity"><header><RailTitle icon={PulseIcon}>最新动态</RailTitle></header>{creators.slice(0, 4).map((c, i) => <div className="activity-row" key={c.handle}><span className={`avatar a${i}`}>{c.handle[0]?.toUpperCase()}</span><p><b>@{c.handle}</b> {activityActions[i]}</p><time>{activityTimes[i]}</time></div>)}</section>
    <section className="invite"><h3>创意无限，快乐加倍</h3><p>在 Picoo 遇见有趣的创作者</p><button><UserRoundPlus size={16} weight="bold" /> 邀请好友</button><div className="friends">◕‿◕　•ᴗ•</div></section>
  </aside>;
}

export function HomeView({ creations, creators }: { creations: CreationCardData[]; creators: TopCreator[] }) {
  const { t } = useLocale();
  return <AppShell activeHref="/" rightRail={<RightRail creators={creators} />}><section className="hero"><div className="hero-copy"><h1>{t("hero.title.line1")}<br />{t("hero.title.line2")}<span>{t("hero.title.accent")}</span><Sparkles /></h1><p>{t("hero.subtitle")}</p><div><Link href="/explore" className="primary">{t("hero.explore")}</Link><Link href="/studio/creations/new" className="secondary">{t("hero.publish")}</Link></div></div><div className="hero-art"><span className="crown">♛</span><div className="hero-bot"><div>•ᴗ•</div><i /></div><div className="float-card video">▶</div><div className="float-card code">&lt;/&gt;</div><div className="orbit" /></div></section>
    <section className="categories">{categories.map(({ icon: Icon, title, sub, tone, href }) => <Link className={`category ${tone}`} key={title} href={href}><span><Icon size={25} weight="duotone" /></span><div><b>{title}</b><small>{sub}</small></div></Link>)}</section>
    <section className="section-heading"><div><h2>{t("section.featured")} <Sparkles size={18} /></h2><nav><button className="selected">{t("tab.recommended")}</button><button>{t("tab.latest")}</button><button>{t("tab.popular")}</button><button>{t("tab.following")}</button></nav></div><Link href="/explore">{t("action.viewAll")} <ChevronRight size={16} /></Link></section>
    <section className="creation-grid">{creations.map((item, i) => <CreationCard key={item.slug} item={item} index={i} />)}</section>
    <section className="trending"><div className="section-heading compact"><div><h2>{t("section.trending")} <Flame size={20} /></h2><nav className="tags"><button># AI 插画</button><button># 自动化</button><button># 提示词工程</button><button># 生产力</button><button># 游戏开发</button></nav></div><Link href="/explore?sort=trending">换一批</Link></div><div className="trend-grid">{["dream", "panda", "castle", "ui", "world"].map((x) => <Link href="/explore" className={`trend-art ${x}`} key={x}><Sparkles /></Link>)}</div></section>
    <section className="source-strip"><Link2 size={18} /><div><b>{t("syndication.title")}</b><span>{t("syndication.summary")}</span></div><button>{t("syndication.manage")}</button><button>{t("syndication.channels")}</button></section>
    </AppShell>;
}
