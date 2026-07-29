"use client";

import Link from "next/link";
import { ArrowRightIcon, CirclesFourIcon, CompassIcon, CubeIcon, FlowArrowIcon, MagicWandIcon, RobotIcon, SparkleIcon, TrendUpIcon, WrenchIcon } from "@phosphor-icons/react";
import { AppShell } from "@/components/site/app-shell";
import { CreationCard, type CreationCardData } from "@/components/site/creation-card";
import { useLocale } from "@/i18n/locale-provider";
import type { MessageKey } from "@/i18n/catalog";

const TYPE_TABS: readonly { key: string; label: MessageKey; icon: React.ElementType }[] = [
  { key: "", label: "explore.all", icon: CirclesFourIcon },
  { key: "agent", label: "creation.type.agent", icon: RobotIcon },
  { key: "workflow", label: "creation.type.workflow", icon: FlowArrowIcon },
  { key: "prompt", label: "creation.type.prompt", icon: MagicWandIcon },
  { key: "tool", label: "creation.type.tool", icon: WrenchIcon },
  { key: "article", label: "creation.type.article", icon: CubeIcon },
];

function buildHref(type: string, sort: string) {
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  if (sort) params.set("sort", sort);
  const query = params.toString();
  if (query) return `/explore?${query}`;
  return "/explore";
}

export function ExploreView({ items, activeType, activeSort, curatedFallback }: {
  items: CreationCardData[]; activeType: string; activeSort: string; curatedFallback: boolean;
}) {
  const { t } = useLocale();
  let trendingClass = "explore-sort-link";
  let latestClass = "explore-sort-link";
  if (activeSort === "latest") latestClass += " selected";
  if (activeSort !== "latest") trendingClass += " selected";
  return <AppShell activeHref="/explore">
    <div className="explore-page">
      <section className="explore-hero">
        <div className="explore-hero-copy"><span className="explore-eyebrow"><CompassIcon weight="fill" />{t("explore.eyebrow")}</span><h1>{t("explore.heroTitle")}</h1><p>{t("explore.heroDescription")}</p><div className="explore-hero-actions"><Link href="/studio/creations/new" className="explore-primary">{t("explore.startCreating")}<ArrowRightIcon weight="bold" /></Link><Link href="/explore?sort=trending" className="explore-secondary"><TrendUpIcon />{t("explore.viewTrending")}</Link></div><div className="explore-stats"><span><b>8+</b>{t("explore.assetCount")}</span><span><b>5</b>{t("explore.categoryCount")}</span><span><b>100%</b>{t("explore.remixReady")}</span></div></div>
        <div className="explore-hero-art" aria-hidden="true"><div className="explore-orbit orbit-one" /><div className="explore-orbit orbit-two" /><div className="explore-art-card art-agent"><RobotIcon weight="duotone" /><span>Agent</span></div><div className="explore-art-card art-flow"><FlowArrowIcon weight="duotone" /><span>Workflow</span></div><div className="explore-art-card art-prompt"><SparkleIcon weight="fill" /><span>Prompt</span></div><div className="explore-spark spark-a">✦</div><div className="explore-spark spark-b">✧</div></div>
      </section>
      <section className="explore-toolbar"><div><h2>{t("explore.resultsTitle")}</h2><p>{t("explore.resultsDescription")}</p></div><div className="explore-sort"><Link href={buildHref(activeType, "trending")} className={trendingClass}>{t("explore.sort.trending")}</Link><Link href={buildHref(activeType, "latest")} className={latestClass}>{t("explore.sort.latest")}</Link></div></section>
      <nav className="explore-type-tabs" aria-label={t("explore.title")}>{TYPE_TABS.map(({ key, label, icon: Icon }) => { let className = "explore-type-tab"; if (key === activeType) className += " selected"; return <Link key={key || "all"} href={buildHref(key, activeSort)} className={className}><Icon weight="duotone" />{t(label)}</Link>; })}</nav>
      {curatedFallback && <section className="curated-notice"><span><SparkleIcon weight="fill" /></span><div><b>{t("explore.curatedTitle")}</b><p>{t("explore.curatedDescription")}</p></div><em>{t("explore.templateBadge")}</em></section>}
      <section className="creation-grid explore-grid">{items.map((item, index) => <CreationCard key={item.slug} item={item} index={index} />)}</section>
      <section className="explore-creator-cta"><div className="cta-icon"><MagicWandIcon weight="duotone" /></div><div><h2>{t("explore.creatorCtaTitle")}</h2><p>{t("explore.creatorCtaDescription")}</p></div><Link href="/studio/creations/new">{t("action.publish")}<ArrowRightIcon weight="bold" /></Link></section>
    </div>
  </AppShell>;
}
