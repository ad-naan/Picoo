import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { requirePermission } from "@/modules/identity/application/authorization";
import { DrizzleCreationRepository } from "@/infrastructure/creation/drizzle-creation-repository";
import { CREATION_STATUS_MESSAGES } from "@/i18n/domain-labels";
import { getServerTranslator } from "@/i18n/server";
import { SUPPORTED_LOCALES } from "@/i18n/config";
import { localeMetadata } from "@/i18n/catalog";
import { publishCreation, queueCreationTranslation, updateCreation } from "../../actions";
import { CreationForm } from "../../creation-form";

const repository = new DrizzleCreationRepository();

export default async function EditCreationPage({ params }: { params: Promise<{ id: string }> }) {
  const { t } = await getServerTranslator();
  const { id } = await params;
  const user = await requirePermission("creation:update:own");
  const creation = await repository.findById(id);
  if (!creation) notFound();
  if (creation.props.authorId !== user.id) redirect("/forbidden");
  const p = creation.props;
  let publishingState: React.ReactNode = <><p>{t("studio.edit.currentStatus")}: {t(CREATION_STATUS_MESSAGES[p.status])}. {t("studio.edit.publishHint")}</p><form className="dashboard-form" action={publishCreation}><input type="hidden" name="id" value={p.id} /><button className="approve">{t("studio.edit.publishNow")}</button></form></>;
  if (p.status === "published") publishingState = <p>{t("studio.edit.published")} <Link href={`/creation/${p.slug}`}>{t("studio.edit.viewPublic")} →</Link></p>;
  return <><header className="dashboard-header"><div><h1>{t("studio.edit.title")}</h1><p>{t("studio.edit.subtitle")}</p></div><span className={`status-badge ${p.status}`}>{t(CREATION_STATUS_MESSAGES[p.status])}</span></header><div className="dashboard-row"><section className="dashboard-card"><h2>{t("studio.edit.information")}</h2><CreationForm action={updateCreation} submitLabel={t("studio.edit.save")} values={{ id: p.id, type: p.type, title: p.title, description: p.description, content: p.content, sourceLocale: p.sourceLocale as "zh-CN" | "en", coverUrl: p.coverUrl, tags: p.tags, compatibleModels: p.compatibleModels }} /></section><section className="dashboard-card"><h2>{t("studio.edit.publishManagement")}</h2>{publishingState}<p><small>{t("studio.edit.views")} {p.stats.views} · {t("studio.edit.likes")} {p.stats.likes} · {t("studio.edit.favorites")} {p.stats.favorites}</small></p><hr /><h2>{t("translation.section")}</h2><p><small>{t("translation.source")}: {p.sourceLocale}. {t("translation.hint")}</small></p><form className="dashboard-form" action={queueCreationTranslation}><input type="hidden" name="id" value={p.id} /><label>{t("translation.target")}<select name="targetLocale" defaultValue="en">{SUPPORTED_LOCALES.map((locale) => <option key={locale} value={locale}>{localeMetadata[locale].label}</option>)}</select></label><button>{t("translation.generate")}</button></form></section></div></>;
}
