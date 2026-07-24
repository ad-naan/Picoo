import { requirePermission } from "@/modules/identity/application/authorization";
import { createCreation } from "../actions";
import { CreationForm } from "../creation-form";

export default async function NewCreationPage() {
  await requirePermission("creation:publish");
  return <>
    <header className="dashboard-header">
      <div><h1>发布新作品</h1><p>先保存为草稿，确认无误后再发布到社区。</p></div>
    </header>
    <div className="dashboard-row">
      <section className="dashboard-card">
        <h2>作品信息</h2>
        <CreationForm action={createCreation} submitLabel="保存草稿" />
      </section>
      <section className="dashboard-card">
        <h2>发布须知</h2>
        <ol>
          <li>保存后进入编辑页，可继续完善内容</li>
          <li>确认无误后点击「发布」，作品将出现在探索页</li>
          <li>已发布作品可随时下架回到草稿箱</li>
          <li>请确保内容原创或已获授权，遵守社区规范</li>
        </ol>
      </section>
    </div>
  </>;
}
