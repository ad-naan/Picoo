import { getDatabase } from "@/infrastructure/database/client";
import { featureFlags } from "@/infrastructure/database/schema";
import { toggleFeatureFlag } from "../actions";

const defaultFlags = [
  ["registration.enabled", "开放注册", "控制新用户是否可以注册"],
  ["creation.publish.enabled", "作品发布", "控制 Creator 发布新 Creation"],
  ["creation.remix.enabled", "Remix 功能", "控制用户是否可以创建二创关系"],
  ["syndication.ingest.enabled", "RSS 聚合", "控制外部 Feed 抓取任务"],
  ["marketplace.enabled", "Marketplace", "控制资产市场入口，默认关闭"],
] as const;

export default async function AdminSettingsPage() {
  const storedFlags = await getDatabase().select().from(featureFlags);
  const enabledByKey = new Map(storedFlags.map((flag) => [flag.key, flag.enabled]));
  return <><header className="dashboard-header"><div><h1>高级配置</h1><p>功能开关、集成与运行策略。修改会进入审计日志。</p></div></header><section className="dashboard-card"><h2>功能开关</h2><div className="setting-list">{defaultFlags.map(([key, label, description]) => { const enabled = enabledByKey.get(key) ?? false; return <div className="setting-item" key={key}><div><b>{label}</b><small>{description} · {key}</small></div><form action={toggleFeatureFlag}><input type="hidden" name="key" value={key} /><input type="hidden" name="enabled" value={String(enabled)} /><button>{enabled ? "已开启" : "已关闭"}</button></form></div>; })}</div></section></>;
}
