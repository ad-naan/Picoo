import { asc, count, eq } from "drizzle-orm";
import { BADGE_RARITIES } from "@/modules/badge/domain/badge";
import { getDatabase } from "@/infrastructure/database/client";
import { badges, badgeTranslations, userBadges } from "@/infrastructure/database/schema";
import { getServerTranslator } from "@/i18n/server";
import { createBadge, awardBadge } from "./actions";

export default async function AdminBadgesPage() {
  const { locale, t } = await getServerTranslator();
  const db = getDatabase();
  const [definitions, translations] = await Promise.all([
    db.select({ id: badges.id, key: badges.key, rarity: badges.rarity, maxSupply: badges.maxSupply, active: badges.active, issued: count(userBadges.id) }).from(badges).leftJoin(userBadges, eq(userBadges.badgeId, badges.id)).groupBy(badges.id).orderBy(asc(badges.createdAt)),
    db.select().from(badgeTranslations),
  ]);
  const names = new Map<string, string>();
  for (const definition of definitions) {
    let localized = translations.find((item) => item.badgeId === definition.id && item.locale === locale);
    if (!localized) localized = translations.find((item) => item.badgeId === definition.id && item.locale === "zh-CN");
    names.set(definition.id, localized?.name ?? definition.key);
  }
  return <><header className="dashboard-header"><div><h1>{t("badge.admin.title")}</h1><p>{t("badge.admin.subtitle")}</p></div></header><div className="dashboard-row"><section className="dashboard-card"><h2>{t("badge.admin.create")}</h2><form className="dashboard-form" action={createBadge}><label>{t("badge.field.key")}<input name="key" placeholder="early-explorer" required /></label><label>{t("badge.field.rarity")}<select name="rarity" defaultValue="rare">{BADGE_RARITIES.map((rarity) => <option value={rarity} key={rarity}>{t(`badge.rarity.${rarity}`)}</option>)}</select></label><label>{t("badge.field.supply")}<input name="maxSupply" type="number" min="1" placeholder="留空表示不限量" /></label><label>{t("badge.field.artwork")}<input name="artworkUrl" type="url" placeholder="https://..." /></label><label>{t("badge.field.zhName")}<input name="zhName" required /></label><label>{t("badge.field.zhDescription")}<textarea name="zhDescription" /></label><label>{t("badge.field.enName")}<input name="enName" required /></label><label>{t("badge.field.enDescription")}<textarea name="enDescription" /></label><button>{t("badge.admin.create")}</button></form></section><section className="dashboard-card"><h2>{t("badge.admin.award")}</h2><form className="dashboard-form" action={awardBadge}><label>{t("badge.field.badge")}<select name="badgeId" required>{definitions.map((badge) => <option key={badge.id} value={badge.id}>{names.get(badge.id)} · {badge.issued}/{badge.maxSupply ?? "∞"}</option>)}</select></label><label>{t("badge.field.recipient")}<input name="email" type="email" required /></label><button>{t("badge.admin.award")}</button></form></section></div><section className="dashboard-card syndication-section"><h2>{t("dashboard.nav.badges")}</h2><table className="dashboard-table"><thead><tr><th>{t("badge.field.key")}</th><th>{t("badge.field.rarity")}</th><th>{t("badge.field.supply")}</th></tr></thead><tbody>{definitions.map((badge) => <tr key={badge.id}><td><b>{names.get(badge.id)}</b><small>{badge.key}</small></td><td><span className={`role-badge rarity-${badge.rarity}`}>{t(`badge.rarity.${badge.rarity}`)}</span></td><td>{badge.issued} / {badge.maxSupply ?? "∞"}</td></tr>)}</tbody></table></section></>;
}
