import { requireUser } from "@/modules/identity/application/authorization";

export default async function StudioPage() {
  const user = await requireUser();
  return <><header className="dashboard-header"><div><h1>Creator Studio</h1><p>管理作品、认证和分发渠道。</p></div></header><div className="dashboard-grid"><section className="dashboard-card metric"><span>已发布作品</span><strong>0</strong><small>开始发布你的第一个 AI Creation</small></section><section className="dashboard-card metric"><span>本月收藏</span><strong>0</strong><small>数据将在作品发布后开始统计</small></section><section className="dashboard-card metric"><span>Remix 贡献</span><strong>0</strong><small>记录下游二创和来源关系</small></section></div><section className="dashboard-card" style={{ marginTop: 16 }}><h2>创作者状态</h2><p>当前角色：{user.roles.join(" · ")}。认证创作者将获得可信徽章、搜索增强和更多分发能力。</p></section></>;
}
