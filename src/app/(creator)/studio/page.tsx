import { and, count, eq, sql } from "drizzle-orm";
import { requireUser } from "@/modules/identity/application/authorization";
import { getDatabase } from "@/infrastructure/database/client";
import { creations } from "@/infrastructure/database/schema";
import { ROLE_MESSAGES } from "@/i18n/domain-labels";
import { getServerTranslator } from "@/i18n/server";

export default async function StudioPage() {
  const user = await requireUser();
  const { t } = await getServerTranslator();
  const [[published], [engagement]] = await Promise.all([
    getDatabase().select({ value: count() }).from(creations).where(and(eq(creations.authorId, user.id), eq(creations.status, "published"))),
    getDatabase().select({ favorites: sql<number>`coalesce(sum(${creations.favorites}), 0)`, remixes: sql<number>`coalesce(sum(${creations.forks}), 0)` }).from(creations).where(eq(creations.authorId, user.id)),
  ]);
  const localizedRoles = user.roles.map((role) => t(ROLE_MESSAGES[role])).join(" · ");
  return <><header className="dashboard-header"><div><h1>{t("studio.overview.title")}</h1><p>{t("studio.overview.subtitle")}</p></div></header><div className="dashboard-grid"><section className="dashboard-card metric"><span>{t("studio.overview.published")}</span><strong>{published.value}</strong><small>{t("studio.overview.publishedHint")}</small></section><section className="dashboard-card metric"><span>{t("studio.overview.favorites")}</span><strong>{Number(engagement.favorites)}</strong><small>{t("studio.overview.favoritesHint")}</small></section><section className="dashboard-card metric"><span>{t("studio.overview.remixes")}</span><strong>{Number(engagement.remixes)}</strong><small>{t("studio.overview.remixesHint")}</small></section></div><section className="dashboard-card syndication-section"><h2>{t("studio.overview.status")}</h2><p>{t("studio.overview.currentRoles")}: {localizedRoles}. {t("studio.overview.statusHint")}</p></section></>;
}
