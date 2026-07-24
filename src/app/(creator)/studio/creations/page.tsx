import Link from "next/link";
import { requirePermission } from "@/modules/identity/application/authorization";
import { DrizzleCreationRepository } from "@/infrastructure/creation/drizzle-creation-repository";
import { archiveCreation, deleteCreation, publishCreation } from "./actions";

const repository = new DrizzleCreationRepository();

const STATUS_LABEL: Record<string, string> = {
  draft: "草稿", published: "已发布", under_review: "审核中", archived: "已下架",
};
const TYPE_LABEL: Record<string, string> = {
  agent: "Agent", workflow: "工作流", prompt: "Prompt", tool: "工具", article: "文章",
};

export default async function StudioCreationsPage() {
  const user = await requirePermission("creation:publish");
  const items = await repository.findByAuthor(user.id);
  return <>
    <header className="dashboard-header">
      <div><h1>我的作品</h1><p>发布、更新和管理你的 AI Creation。</p></div>
      <Link className="status-badge approved" href="/studio/creations/new">+ 发布新作品</Link>
    </header>
    <section className="dashboard-card">
      <table className="dashboard-table">
        <thead><tr><th>标题</th><th>类型</th><th>状态</th><th>浏览</th><th>操作</th></tr></thead>
        <tbody>{items.map((item) => {
          const p = item.props;
          return <tr key={p.id}>
            <td><b>{p.title}</b><small>{p.description.slice(0, 60)}</small></td>
            <td>{TYPE_LABEL[p.type]}</td>
            <td><span className={`status-badge ${p.status}`}>{STATUS_LABEL[p.status]}</span></td>
            <td>{p.stats.views}</td>
            <td><div className="review-actions">
              <Link href={`/studio/creations/${p.id}/edit`}>编辑</Link>
              {p.status === "published"
                ? <><Link href={`/creation/${p.slug}`}>查看</Link><form action={archiveCreation}><input type="hidden" name="id" value={p.id} /><button>下架</button></form></>
                : <form action={publishCreation}><input type="hidden" name="id" value={p.id} /><button className="approve">发布</button></form>}
              <form action={deleteCreation}><input type="hidden" name="id" value={p.id} /><button>删除</button></form>
            </div></td>
          </tr>;
        })}</tbody>
      </table>
      {items.length === 0 && <p>还没有作品。点击右上角「发布新作品」创建你的第一个 Creation。</p>}
    </section>
  </>;
}
