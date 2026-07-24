"use client";

import Link from "next/link";
import { CaretRightIcon as ChevronRight } from "@phosphor-icons/react";
import { AppShell } from "@/components/site/app-shell";
import { CreationCard, type CreationCardData } from "@/components/site/creation-card";
import { useLocale } from "@/i18n/locale-provider";

const TYPE_TABS = [
  { key: "", label: "全部" }, { key: "agent", label: "Agent" }, { key: "workflow", label: "工作流" },
  { key: "prompt", label: "Prompt" }, { key: "tool", label: "工具" }, { key: "article", label: "文章" },
];

function buildHref(type: string, sort: string) {
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  if (sort) params.set("sort", sort);
  const query = params.toString();
  return query ? `/explore?${query}` : "/explore";
}

export function ExploreView({ items, activeType, activeSort }: {
  items: CreationCardData[]; activeType: string; activeSort: string;
}) {
  const { t } = useLocale();
  return <AppShell activeHref="/explore">
    <section className="section-heading" style={{ marginTop: 22 }}>
      <div>
        <h2>{t("explore.title")}</h2>
        <nav>{TYPE_TABS.map((tab) => <Link key={tab.key || "all"} href={buildHref(tab.key, activeSort)} className={tab.key === activeType ? "selected" : ""}>{tab.label}</Link>)}</nav>
      </div>
      <nav className="section-heading" style={{ gap: 18 }}>
        <Link href={buildHref(activeType, "trending")} className={activeSort !== "latest" ? "selected" : ""}>{t("explore.sort.trending")}</Link>
        <Link href={buildHref(activeType, "latest")} className={activeSort === "latest" ? "selected" : ""}>{t("explore.sort.latest")}</Link>
      </nav>
    </section>
    {items.length > 0
      ? <section className="creation-grid">{items.map((item, i) => <CreationCard key={item.slug} item={item} index={i} />)}</section>
      : <section className="dashboard-card" style={{ textAlign: "center", padding: 48 }}><p>{t("explore.empty")}</p><Link href="/studio/creations/new" className="primary" style={{ display: "inline-flex", padding: "10px 20px", borderRadius: 12, marginTop: 12 }}>{t("action.publish")} <ChevronRight size={16} /></Link></section>}
  </AppShell>;
}
