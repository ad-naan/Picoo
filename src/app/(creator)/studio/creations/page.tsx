import Link from "next/link";
import { requirePermission } from "@/modules/identity/application/authorization";
import { DrizzleCreationRepository } from "@/infrastructure/creation/drizzle-creation-repository";
import { CREATION_STATUS_MESSAGES, CREATION_TYPE_MESSAGES } from "@/i18n/domain-labels";
import { getServerTranslator } from "@/i18n/server";
import { archiveCreation, deleteCreation, publishCreation } from "./actions";

const repository = new DrizzleCreationRepository();

export default async function StudioCreationsPage() {
  const user = await requirePermission("creation:publish");
  const { t } = await getServerTranslator();
  const items = await repository.findByAuthor(user.id);
  return <><header className="dashboard-header"><div><h1>{t("studio.creations.title")}</h1><p>{t("studio.creations.subtitle")}</p></div><Link className="status-badge approved" href="/studio/creations/new">+ {t("studio.creations.new")}</Link></header><section className="dashboard-card"><table className="dashboard-table"><thead><tr><th>{t("studio.creations.column.title")}</th><th>{t("studio.creations.column.type")}</th><th>{t("studio.creations.column.status")}</th><th>{t("studio.creations.column.views")}</th><th>{t("common.actions")}</th></tr></thead><tbody>{items.map((item) => { const p = item.props; let publishAction: React.ReactNode = <form action={publishCreation}><input type="hidden" name="id" value={p.id} /><button className="approve">{t("studio.creations.publish")}</button></form>; if (p.status === "published") publishAction = <><Link href={`/creation/${p.slug}`}>{t("studio.creations.view")}</Link><form action={archiveCreation}><input type="hidden" name="id" value={p.id} /><button>{t("studio.creations.archive")}</button></form></>; return <tr key={p.id}><td><b>{p.title}</b><small>{p.description.slice(0, 60)}</small></td><td>{t(CREATION_TYPE_MESSAGES[p.type])}</td><td><span className={`status-badge ${p.status}`}>{t(CREATION_STATUS_MESSAGES[p.status])}</span></td><td>{p.stats.views}</td><td><div className="review-actions"><Link href={`/studio/creations/${p.id}/edit`}>{t("studio.creations.edit")}</Link>{publishAction}<form action={deleteCreation}><input type="hidden" name="id" value={p.id} /><button>{t("common.delete")}</button></form></div></td></tr>; })}</tbody></table>{items.length === 0 && <p>{t("studio.creations.empty")}</p>}</section></>;
}
