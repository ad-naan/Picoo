import { asc, eq } from "drizzle-orm";
import { requirePermission } from "@/modules/identity/application/authorization";
import { getDatabase } from "@/infrastructure/database/client";
import { badges, badgeTranslations, userBadges } from "@/infrastructure/database/schema";
import { getServerTranslator } from "@/i18n/server";

export default async function UserBadgesPage() {
  const user = await requirePermission("badge:read");
  const { locale, t } = await getServerTranslator();
  const rows = await getDatabase().select({ id: userBadges.id, serialNumber: userBadges.serialNumber, showcased: userBadges.showcased, awardedAt: userBadges.awardedAt, key: badges.key, rarity: badges.rarity, artworkUrl: badges.artworkUrl, visualConfig: badges.visualConfig, locale: badgeTranslations.locale, name: badgeTranslations.name, description: badgeTranslations.description }).from(userBadges).innerJoin(badges, eq(badges.id, userBadges.badgeId)).leftJoin(badgeTranslations, eq(badgeTranslations.badgeId, badges.id)).where(eq(userBadges.userId, user.id)).orderBy(asc(userBadges.displayOrder), asc(userBadges.awardedAt));
  const grouped = new Map<string, typeof rows>();
  for (const row of rows) {
    const existing = grouped.get(row.id) ?? [];
    existing.push(row);
    grouped.set(row.id, existing);
  }
  const owned = [...grouped.values()].map((translations) => {
    const base = translations[0];
    let localized = translations.find((item) => item.locale === locale);
    if (!localized) localized = translations.find((item) => item.locale === "zh-CN");
    return { ...base, name: localized?.name ?? base.key, description: localized?.description ?? "" };
  });
  return <><header className="dashboard-header"><div><h1>{t("badge.title")}</h1><p>{t("badge.subtitle")}</p></div></header><section className="badge-grid">{owned.map((badge) => <article className={`badge-card rarity-${badge.rarity}`} key={badge.id}><div className="badge-art">{badge.artworkUrl && <img src={badge.artworkUrl} alt="" />}{!badge.artworkUrl && <span>✦</span>}</div><div><span className="badge-rarity">{t(`badge.rarity.${badge.rarity}`)}</span><h2>{badge.name}</h2><p>{badge.description}</p><small>{t("badge.serial")} #{String(badge.serialNumber).padStart(3, "0")}</small>{badge.showcased && <b>{t("badge.showcased")}</b>}</div></article>)}{owned.length === 0 && <section className="dashboard-card"><p>{t("badge.empty")}</p></section>}</section></>;
}
