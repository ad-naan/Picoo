import type { Metadata } from "next";
import { CREATION_TYPES, type CreationType } from "@/modules/creation/domain/creation";
import { queryPublishedCards } from "@/infrastructure/creation/creation-queries";
import { ExploreView } from "./explore-view";
import { getRequestLocale } from "@/i18n/server";
import { getStarterCreations } from "@/shared/content/starter-creations";

export const metadata: Metadata = {
  title: "探索 · Picoo",
  description: "发现社区里的 AI Agent、工作流、Prompt 与工具。",
};

function normalizeType(value?: string): CreationType | undefined {
  return CREATION_TYPES.includes(value as CreationType) ? (value as CreationType) : undefined;
}

export default async function ExplorePage({ searchParams }: {
  searchParams: Promise<{ type?: string; sort?: string; tag?: string }>;
}) {
  const params = await searchParams;
  const type = normalizeType(params.type);
  const sort = params.sort === "latest" ? "latest" : "trending";
  const items = await queryPublishedCards({ type, tag: params.tag, sort, limit: 24 });
  const locale = await getRequestLocale();
  let visibleItems = items;
  let curatedFallback = false;
  if (visibleItems.length === 0) {
    visibleItems = getStarterCreations(locale);
    curatedFallback = true;
    if (type) visibleItems = visibleItems.filter((item) => item.type === type);
  }
  return <ExploreView items={visibleItems} activeType={type ?? ""} activeSort={sort} curatedFallback={curatedFallback} />;
}
