import { getServerTranslator } from "@/i18n/server";
import { createCreation } from "../actions";
import { CreationForm } from "../creation-form";

export default async function NewCreationPage() {
  const { t } = await getServerTranslator();
  return <><header className="dashboard-header"><div><h1>{t("studio.new.title")}</h1><p>{t("studio.new.subtitle")}</p></div></header><div className="dashboard-row"><section className="dashboard-card"><h2>{t("studio.new.information")}</h2><CreationForm action={createCreation} submitLabel={t("studio.new.saveDraft")} /></section><section className="dashboard-card"><h2>{t("studio.new.notice")}</h2><ol><li>{t("studio.new.noticeSave")}</li><li>{t("studio.new.noticePublish")}</li><li>{t("studio.new.noticeArchive")}</li><li>{t("studio.new.noticeRights")}</li></ol></section></div></>;
}
