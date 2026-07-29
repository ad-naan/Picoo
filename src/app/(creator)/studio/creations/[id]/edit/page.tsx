import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { requirePermission } from "@/modules/identity/application/authorization";
import { DrizzleCreationRepository } from "@/infrastructure/creation/drizzle-creation-repository";
import { publishCreation, queueCreationTranslation, updateCreation } from "../../actions";
import { CreationForm } from "../../creation-form";
import { getServerTranslator } from "@/i18n/server";
import { SUPPORTED_LOCALES } from "@/i18n/config";
import { localeMetadata } from "@/i18n/catalog";

const repository = new DrizzleCreationRepository();

const STATUS_LABEL: Record<string, string> = {
  draft: "草稿", published: "已发布", under_review: "审核中", archived: "已下架",
};

export default async function EditCreationPage({ params }: { params: Promise<{ id: string }> }) {
  const { t } = await getServerTranslator();
  const { id } = await params;
  const user = await requirePermission("creation:update:own");
  const creation = await repository.findById(id);
  if (!creation) notFound();
  if (creation.props.authorId !== user.id) redirect("/forbidden");
  const p = creation.props;
  return <>
    <header className="dashboard-header">
      <div><h1>编辑作品</h1><p>更新内容并管理发布状态。</p></div>
      <span className={`status-badge ${p.status}`}>{STATUS_LABEL[p.status]}</span>
    </header>
    <div className="dashboard-row">
      <section className="dashboard-card">
        <h2>作品信息</h2>
        <CreationForm action={updateCreation} submitLabel="保存修改" values={{
          id: p.id, type: p.type, title: p.title, description: p.description, content: p.content, sourceLocale: p.sourceLocale as "zh-CN" | "en",
          coverUrl: p.coverUrl, tags: p.tags, compatibleModels: p.compatibleModels,
        }} />
      </section>
      <section className="dashboard-card">
        <h2>发布管理</h2>
        {p.status === "published"
          ? <p>作品已发布。<Link href={`/creation/${p.slug}`}>查看公开页 →</Link></p>
          : <p>作品当前为{STATUS_LABEL[p.status]}，发布后将对所有人可见。</p>}
        {p.status !== "published" && <form className="dashboard-form" action={publishCreation}>
          <input type="hidden" name="id" value={p.id} />
          <button className="approve">立即发布</button>
        </form>}
        <p><small>浏览 {p.stats.views} · 点赞 {p.stats.likes} · 收藏 {p.stats.favorites}</small></p>
        <hr />
        <h2>{t("translation.section")}</h2>
        <p><small>{t("translation.source")}：{p.sourceLocale}。{t("translation.hint")}</small></p>
        <form className="dashboard-form" action={queueCreationTranslation}>
          <input type="hidden" name="id" value={p.id} />
          <label>{t("translation.target")}<select name="targetLocale" defaultValue="en">{SUPPORTED_LOCALES.map((locale) => <option key={locale} value={locale}>{localeMetadata[locale].label}</option>)}</select></label>
          <button>{t("translation.generate")}</button>
        </form>
      </section>
    </div>
  </>;
}
