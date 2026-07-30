import { desc, eq } from "drizzle-orm";
import { requireUser } from "@/modules/identity/application/authorization";
import { getDatabase } from "@/infrastructure/database/client";
import { notifications, users } from "@/infrastructure/database/schema";
import { NOTIFICATION_MESSAGES } from "@/i18n/domain-labels";
import { getServerTranslator } from "@/i18n/server";
import { markAllNotificationsRead } from "./actions";

export default async function NotificationSettingsPage() {
  const user = await requireUser();
  const { locale, t } = await getServerTranslator();
  const rows = await getDatabase().select({ id: notifications.id, type: notifications.type, data: notifications.data, readAt: notifications.readAt, createdAt: notifications.createdAt, actorName: users.name, actorHandle: users.handle }).from(notifications).leftJoin(users, eq(users.id, notifications.actorId)).where(eq(notifications.recipientId, user.id)).orderBy(desc(notifications.createdAt)).limit(100);
  return <><header className="dashboard-header"><div><h1>{t("settings.notifications.title")}</h1><p>{t("settings.notifications.subtitle")}</p></div><form action={markAllNotificationsRead}><button className="dashboard-action">{t("settings.notifications.markAll")}</button></form></header><section className="dashboard-card"><div className="setting-list">{rows.map((item) => { let title = ""; if (typeof item.data.title === "string") title = item.data.title; const notificationKey = NOTIFICATION_MESSAGES[item.type]; let action = item.type; if (notificationKey) action = t(notificationKey); return <article className="setting-item" key={item.id}><div><b>{item.actorName ?? item.actorHandle ?? "Picoo"} {action}</b><small>{title} · {item.createdAt.toLocaleString(locale)}</small></div>{!item.readAt && <span className="status-badge">{t("settings.notifications.new")}</span>}</article>; })}{rows.length === 0 && <p>{t("settings.notifications.empty")}</p>}</div></section></>;
}
