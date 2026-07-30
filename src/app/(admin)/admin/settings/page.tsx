import { getDatabase } from "@/infrastructure/database/client";
import { featureFlags } from "@/infrastructure/database/schema";
import { getServerTranslator } from "@/i18n/server";
import type { MessageKey } from "@/i18n/catalog";
import { toggleFeatureFlag } from "../actions";

const defaultFlags: readonly (readonly [string, MessageKey, MessageKey])[] = [
  ["registration.enabled", "admin.flag.registration.label", "admin.flag.registration.description"],
  ["creation.publish.enabled", "admin.flag.publish.label", "admin.flag.publish.description"],
  ["creation.remix.enabled", "admin.flag.remix.label", "admin.flag.remix.description"],
  ["syndication.ingest.enabled", "admin.flag.syndication.label", "admin.flag.syndication.description"],
  ["marketplace.enabled", "admin.flag.marketplace.label", "admin.flag.marketplace.description"],
];

export default async function AdminSettingsPage() {
  const { t } = await getServerTranslator();
  const storedFlags = await getDatabase().select().from(featureFlags);
  const enabledByKey = new Map(storedFlags.map((flag) => [flag.key, flag.enabled]));
  return <><header className="dashboard-header"><div><h1>{t("admin.settings.title")}</h1><p>{t("admin.settings.subtitle")}</p></div></header><section className="dashboard-card"><h2>{t("admin.settings.flags")}</h2><div className="setting-list">{defaultFlags.map(([key, labelKey, descriptionKey]) => { const enabled = enabledByKey.get(key) ?? false; let stateLabel = t("common.disabled"); if (enabled) stateLabel = t("common.enabled"); return <div className="setting-item" key={key}><div><b>{t(labelKey)}</b><small>{t(descriptionKey)} · {key}</small></div><form action={toggleFeatureFlag}><input type="hidden" name="key" value={key} /><input type="hidden" name="enabled" value={String(enabled)} /><button>{stateLabel}</button></form></div>; })}</div></section></>;
}
