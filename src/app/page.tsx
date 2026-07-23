"use client";

import { motion } from "framer-motion";
import {
  BellIcon as Bell, BookmarkSimpleIcon as Bookmark, RobotIcon as Bot, CubeIcon as Box,
  CaretDownIcon as ChevronDown, CaretRightIcon as ChevronRight, UserCircleIcon as CircleUserRound,
  CompassIcon as Compass, FireIcon as Flame, GiftIcon as Gift, HeartIcon as Heart,
  HouseIcon as Home, LightbulbIcon as Lightbulb, LinkSimpleIcon as Link2, ListIcon as Menu,
  ChatCircleIcon as MessageCircle, NewspaperIcon as Newspaper, PlusIcon as Plus,
  MagnifyingGlassIcon as Search, SparkleIcon as Sparkles, StarIcon as Star, TrophyIcon as Trophy,
  UserPlusIcon as UserRoundPlus, MagicWandIcon as WandSparkles, FlowArrowIcon as Workflow,
  WrenchIcon as Wrench, CrownSimpleIcon, CalendarDotsIcon, PulseIcon,
} from "@phosphor-icons/react";
import { useLocale } from "@/i18n/locale-provider";

const nav = [
  [Home, "首页", true], [Compass, "发现"], [Star, "关注"], [Lightbulb, "灵感"],
  [Trophy, "排行榜"], [Gift, "活动", false, "New"],
] as const;

const creationNav = [[Box, "发布作品"], [CircleUserRound, "我的作品"], [Newspaper, "草稿箱"], [Bookmark, "收藏夹"]] as const;
const exploreNav = [[Bot, "Agents"], [Workflow, "工作流"], [WandSparkles, "Prompt"], [Wrench, "工具"], [Newspaper, "资源"]] as const;

const categories = [
  { icon: Bot, title: "AI Agents", sub: "智能体", tone: "violet" },
  { icon: Workflow, title: "工作流", sub: "自动化流程", tone: "mint" },
  { icon: WandSparkles, title: "Prompt", sub: "提示词", tone: "pink" },
  { icon: Wrench, title: "工具", sub: "AI 工具", tone: "blue" },
  { icon: Newspaper, title: "创意资源", sub: "素材 & 资源", tone: "purple" },
  { icon: Gift, title: "免费福利", sub: "限时收集", tone: "orange" },
];

const creations = [
  { title: "小红书爆款笔记生成工作流", desc: "从选题、文案、配图到发布，一键生成爆款内容笔记！", type: "工作流", author: "Luna", likes: "1.2k", comments: 342, art: "planet" },
  { title: "Discord 智能社区助手", desc: "自动欢迎新成员、答疑、管理，内置总结，让你的社区更活跃！", type: "Agent", author: "Jacky", likes: "2.1k", comments: 563, art: "robot" },
  { title: "AI 知识库自动整理工作流", desc: "自动抓取、整理和归档各种资料，构建随身的专属知识库。", type: "工作流", author: "Echo", likes: "987", comments: 201, art: "nodes" },
  { title: "Midjourney 风格提示词合集", desc: "50+ 精选提示词，帮你轻松生成惊艳的 AI 艺术作品。", type: "Prompt", author: "Mike", likes: "1.6k", comments: 412, art: "portrait" },
];

const creators = [
  ["Luna", "创意插画", "2.4k"], ["Jacky", "Agent 构建", "1.8k"], ["Echo", "自动化专家", "1.6k"], ["Mike", "AI 艺术", "1.2k"], ["Zoe", "提示工程", "987"],
];

function Logo() {
  return <div className="logo"><span className="logo-mark"><i /><i /><i /></span>Picoo</div>;
}

function NavItem({ item }: { item: readonly [React.ElementType, string, boolean?, string?] }) {
  const [Icon, label, active, badge] = item;
  return <button className={`nav-item ${active ? "active" : ""}`}><Icon size={20} weight={active ? "fill" : "duotone"} /><span>{label}</span>{badge && <b>{badge}</b>}</button>;
}

function Artwork({ kind }: { kind: string }) {
  return <div className={`artwork ${kind}`} aria-hidden="true">
    {kind === "robot" && <><div className="bot-head"><span>•ᴗ•</span></div><div className="bot-body" /></>}
    {kind === "planet" && <><div className="planet-ball" /><div className="planet-ring" /><Sparkles size={25} /></>}
    {kind === "nodes" && <><span className="node n1">AI</span><span className="node n2">API</span><span className="node n3">DB</span><i /><i /><i /></>}
    {kind === "portrait" && <><div className="portrait-hair" /><div className="portrait-face" /><span className="bubble" /></>}
  </div>;
}

function CreationCard({ item, index }: { item: typeof creations[number]; index: number }) {
  return <motion.article className="creation-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 * index }}>
    <div className="cover"><Artwork kind={item.art} /><button className="save" aria-label="收藏"><Bookmark size={17} /></button><span className="type-pill">{item.type}</span></div>
    <div className="card-copy"><h3>{item.title}</h3><p>{item.desc}</p></div>
    <div className="card-meta"><span className="avatar tiny">{item.author[0]}</span><span>@{item.author}</span><span className="grow" /><Heart size={14} /> {item.likes}<MessageCircle size={14} /> {item.comments}</div>
  </motion.article>;
}

function Sidebar() {
  return <aside className="sidebar">
    <div className="brand-row"><Logo /><button className="icon-button" aria-label="折叠菜单"><Menu size={18} /></button></div>
    <nav>{nav.map((x) => <NavItem key={x[1]} item={x} />)}<p className="nav-label">创作</p>{creationNav.map((x) => <NavItem key={x[1]} item={x} />)}<p className="nav-label">探索</p>{exploreNav.map((x) => <NavItem key={x[1]} item={x} />)}</nav>
    <div className="inspiration"><Sparkles size={22} /><h3>每日灵感</h3><p>每天发现一个有趣的 AI 创意</p><button>去看看 <ChevronRight size={15} /></button><div className="mini-bot">•ᴗ•</div></div>
  </aside>;
}

function RailTitle({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return <b className="rail-title"><span className="rail-title-icon"><Icon size={15} weight="fill" /></span>{children}</b>;
}

function RightRail() {
  const activityActions = ["发布了新作品", "点赞了你的作品", "收藏了你的作品", "关注了你"];
  const activityTimes = ["10 分钟前", "30 分钟前", "1 小时前", "2 小时前"];
  return <aside className="right-rail">
    <section className="rail-card"><header><RailTitle icon={CrownSimpleIcon}>本周热门作者</RailTitle><a>全部榜单 <ChevronRight size={14} weight="bold" /></a></header><div className="creator-list">{creators.map((c, i) => <div className="creator" key={c[0]}><em>{i + 1}</em><span className={`avatar a${i}`}>{c[0][0]}</span><div><strong>@{c[0]}</strong><small>{c[1]}</small></div><span>{c[2]} 粉丝</span></div>)}</div></section>
    <section className="rail-card"><header><RailTitle icon={CalendarDotsIcon}>社区活动</RailTitle><a>全部活动 <ChevronRight size={14} weight="bold" /></a></header><div className="event"><span>进行中</span><h3>Picoo 创意挑战赛</h3><p>用 AI 创造未来城市</p><small>07.01 - 07.21</small><button>立即参与</button><div className="city">▥ ▤ ▥</div></div></section>
    <section className="rail-card activity"><header><RailTitle icon={PulseIcon}>最新动态</RailTitle></header>{creators.slice(0,4).map((c, i) => <div className="activity-row" key={c[0]}><span className={`avatar a${i}`}>{c[0][0]}</span><p><b>@{c[0]}</b> {activityActions[i]}</p><time>{activityTimes[i]}</time></div>)}</section>
    <section className="invite"><h3>创意无限，快乐加倍</h3><p>在 Picoo 遇见有趣的创作者</p><button><UserRoundPlus size={16} weight="bold" /> 邀请好友</button><div className="friends">◕‿◕　•ᴗ•</div></section>
  </aside>;
}

export default function HomePage() {
  const { locale, setLocale, t } = useLocale();
  const alternateLocale = { "zh-CN": "en", en: "zh-CN" } as const;
  return <div className="app-shell"><Sidebar /><main className="main"><header className="topbar"><div className="search"><Search size={18} /><input placeholder={t("search.placeholder")} /><kbd>⌘K</kbd></div><div className="top-actions"><button className="locale-button" onClick={() => setLocale(alternateLocale[locale])}>{t("locale.switch")}</button><button className="publish"><Plus size={19} /> {t("action.publish")}</button><button className="bell" aria-label="通知"><Bell size={20} /><i /></button><span className="avatar user">P</span><ChevronDown size={16} /></div></header>
    <div className="content"><section className="hero"><div className="hero-copy"><h1>{t("hero.title.line1")}<br />{t("hero.title.line2")}<span>{t("hero.title.accent")}</span><Sparkles /></h1><p>{t("hero.subtitle")}</p><div><button className="primary">{t("hero.explore")}</button><button className="secondary">{t("hero.publish")}</button></div></div><div className="hero-art"><span className="crown">♛</span><div className="hero-bot"><div>•ᴗ•</div><i /></div><div className="float-card video">▶</div><div className="float-card code">&lt;/&gt;</div><div className="orbit" /></div></section>
    <section className="categories">{categories.map(({ icon: Icon, title, sub, tone }) => <button className={`category ${tone}`} key={title}><span><Icon size={25} weight="duotone" /></span><div><b>{title}</b><small>{sub}</small></div></button>)}</section>
    <section className="section-heading"><div><h2>{t("section.featured")} <Sparkles size={18} /></h2><nav><button className="selected">{t("tab.recommended")}</button><button>{t("tab.latest")}</button><button>{t("tab.popular")}</button><button>{t("tab.following")}</button></nav></div><a>{t("action.viewAll")} <ChevronRight size={16} /></a></section>
    <section className="creation-grid">{creations.map((item, i) => <CreationCard key={item.title} item={item} index={i} />)}</section>
    <section className="trending"><div className="section-heading compact"><div><h2>{t("section.trending")} <Flame size={20} /></h2><nav className="tags"><button># AI 插画</button><button># 自动化</button><button># 提示词工程</button><button># 生产力</button><button># 游戏开发</button></nav></div><a>换一批</a></div><div className="trend-grid">{["dream", "panda", "castle", "ui", "world"].map((x) => <div className={`trend-art ${x}`} key={x}><Sparkles /></div>)}</div></section>
    <section className="source-strip"><Link2 size={18} /><div><b>{t("syndication.title")}</b><span>{t("syndication.summary")}</span></div><button>{t("syndication.manage")}</button><button>{t("syndication.channels")}</button></section>
    </div></main><RightRail /></div>;
}
