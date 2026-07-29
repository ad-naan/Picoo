import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { getDatabase } from "@/infrastructure/database/client";
import { deliveryLogs, deliveryTargets, feedSubscriptions, syndicatedItems } from "@/infrastructure/database/schema";
import { createDeliveryTarget, createFeedSubscription, deleteFeedSubscription, pollFeedSubscription, toggleDeliveryTarget, toggleFeedSubscription } from "./actions";

const statusLabels = { active: "运行中", paused: "已暂停", failing: "抓取异常" } as const;
const channelLabels = { rss: "RSS", webhook: "Webhook", newsletter: "Newsletter", social: "社交平台" } as const;

function displayTime(value: Date | null) {
  if (!value) return "尚未执行";
  return value.toLocaleString("zh-CN");
}

export default async function AdminSyndicationPage() {
  const db = getDatabase();
  const [feeds, targets, latestItems, failedDeliveries] = await Promise.all([
    db.select({ id: feedSubscriptions.id, title: feedSubscriptions.title, url: feedSubscriptions.url, status: feedSubscriptions.status, lastPolledAt: feedSubscriptions.lastPolledAt, lastSuccessfulAt: feedSubscriptions.lastSuccessfulAt, failureCount: feedSubscriptions.failureCount, lastError: feedSubscriptions.lastError, itemCount: sql<number>`count(${syndicatedItems.id})` }).from(feedSubscriptions).leftJoin(syndicatedItems, eq(syndicatedItems.sourceId, feedSubscriptions.id)).groupBy(feedSubscriptions.id).orderBy(desc(feedSubscriptions.createdAt)),
    db.select().from(deliveryTargets).orderBy(desc(deliveryTargets.createdAt)),
    db.select({ id: syndicatedItems.id, title: syndicatedItems.title, canonicalUrl: syndicatedItems.canonicalUrl, sourceTitle: feedSubscriptions.title, publishedAt: syndicatedItems.publishedAt }).from(syndicatedItems).innerJoin(feedSubscriptions, eq(feedSubscriptions.id, syndicatedItems.sourceId)).orderBy(desc(syndicatedItems.publishedAt)).limit(12),
    db.select({ value: sql<number>`count(*)` }).from(deliveryLogs).where(eq(deliveryLogs.status, "failed")),
  ]);
  let failureTotal = 0;
  if (failedDeliveries[0]) failureTotal = Number(failedDeliveries[0].value);
  return <>
    <header className="dashboard-header"><div><h1>RSS 与内容分发</h1><p>订阅可信外站、去重导入内容，并管理 Picoo 的对外发布渠道。</p></div><Link className="dashboard-action" href="/feed.xml" target="_blank">查看公开 RSS</Link></header>
    <div className="dashboard-grid syndication-metrics"><section className="dashboard-card metric"><strong>{feeds.length}</strong><span>订阅源</span></section><section className="dashboard-card metric"><strong>{latestItems.length}</strong><span>最近导入条目</span></section><section className="dashboard-card metric"><strong>{failureTotal}</strong><span>分发失败</span></section></div>
    <div className="dashboard-row syndication-forms"><section className="dashboard-card"><h2>添加 RSS / Atom 订阅</h2><form className="dashboard-form" action={createFeedSubscription}><label>来源名称<input name="title" maxLength={120} placeholder="例如：OpenAI Blog" required /></label><label>Feed 地址<input name="url" type="url" placeholder="https://example.com/feed.xml" required /></label><small>仅允许公网 HTTP/HTTPS 地址；系统会阻止内网和本机地址。</small><button>添加订阅</button></form></section><section className="dashboard-card"><h2>添加对外分发渠道</h2><form className="dashboard-form" action={createDeliveryTarget}><label>渠道名称<input name="name" maxLength={80} placeholder="例如：产品更新 Webhook" required /></label><label>类型<select name="channel" defaultValue="webhook"><option value="webhook">Webhook</option><option value="newsletter">Newsletter</option><option value="social">社交平台</option></select></label><label>目标地址<input name="endpoint" type="url" placeholder="https://hooks.example.com/picoo" required /></label><small>新增渠道默认关闭，完成密钥配置和测试后再启用。</small><button>保存渠道</button></form></section></div>
    <section className="dashboard-card syndication-section"><h2>订阅源</h2><div className="setting-list">{feeds.map((feed) => <article className="setting-item syndication-source" key={feed.id}><div><b>{feed.title} <span className={`status-badge ${feed.status}`}>{statusLabels[feed.status]}</span></b><small>{feed.url}</small><small>{Number(feed.itemCount)} 条 · 最近成功：{displayTime(feed.lastSuccessfulAt)} · 失败 {feed.failureCount} 次</small>{feed.lastError && <small className="syndication-error">{feed.lastError}</small>}</div><div className="review-actions"><form action={pollFeedSubscription}><input type="hidden" name="id" value={feed.id} /><button className="approve">立即抓取</button></form><form action={toggleFeedSubscription}><input type="hidden" name="id" value={feed.id} /><input type="hidden" name="status" value={feed.status} /><button>切换状态</button></form><form action={deleteFeedSubscription}><input type="hidden" name="id" value={feed.id} /><button>删除</button></form></div></article>)}{feeds.length === 0 && <p>还没有订阅源。</p>}</div></section>
    <section className="dashboard-card syndication-section"><h2>分发渠道</h2><div className="setting-list">{targets.map((target) => <article className="setting-item" key={target.id}><div><b>{target.name} <span className="role-badge">{channelLabels[target.channel]}</span></b><small>{target.endpoint}</small></div><form action={toggleDeliveryTarget}><input type="hidden" name="id" value={target.id} /><input type="hidden" name="enabled" value={String(target.enabled)} /><button>{target.enabled && "已启用"}{!target.enabled && "已关闭"}</button></form></article>)}{targets.length === 0 && <p>还没有配置分发渠道。公开 RSS 已默认通过 `/feed.xml` 提供。</p>}</div></section>
    <section className="dashboard-card syndication-section"><h2>最近导入</h2><table className="dashboard-table"><thead><tr><th>标题</th><th>来源</th><th>发布时间</th></tr></thead><tbody>{latestItems.map((item) => <tr key={item.id}><td><a href={item.canonicalUrl} target="_blank" rel="noreferrer">{item.title}</a></td><td>{item.sourceTitle}</td><td>{displayTime(item.publishedAt)}</td></tr>)}</tbody></table>{latestItems.length === 0 && <p>执行一次抓取后，外部条目会出现在这里。</p>}</section>
  </>;
}
