import { desc, eq } from "drizzle-orm";
import { requireUser } from "@/modules/identity/application/authorization";
import { getDatabase } from "@/infrastructure/database/client";
import { notifications, users } from "@/infrastructure/database/schema";
import { markAllNotificationsRead } from "./actions";

const notificationLabels: Record<string, string> = { "creation.liked": "点赞了你的作品", "creation.commented": "评论了你的作品", "creator.followed": "关注了你" };

export default async function NotificationsPage() {
  const user = await requireUser();
  const rows = await getDatabase().select({ id: notifications.id, type: notifications.type, data: notifications.data, readAt: notifications.readAt, createdAt: notifications.createdAt, actorName: users.name, actorHandle: users.handle }).from(notifications).leftJoin(users, eq(users.id, notifications.actorId)).where(eq(notifications.recipientId, user.id)).orderBy(desc(notifications.createdAt)).limit(100);
  return <><header className="dashboard-header"><div><h1>通知中心</h1><p>关注作品反馈、认证进度和平台动态。</p></div><form action={markAllNotificationsRead}><button className="dashboard-action">全部标为已读</button></form></header><section className="dashboard-card"><div className="setting-list">{rows.map((item) => <article className="setting-item" key={item.id}><div><b>{item.actorName ?? item.actorHandle ?? "Picoo"} {notificationLabels[item.type] ?? item.type}</b><small>{typeof item.data.title === "string" ? item.data.title : ""} · {item.createdAt.toLocaleString("zh-CN")}</small></div>{!item.readAt && <span className="status-badge">新</span>}</article>)}{rows.length === 0 && <p>暂时没有新通知。</p>}</div></section></>;
}
