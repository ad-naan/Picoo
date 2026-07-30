import { eq } from "drizzle-orm";
import { requireUser } from "@/modules/identity/application/authorization";
import { getDatabase } from "@/infrastructure/database/client";
import { userProfiles, users } from "@/infrastructure/database/schema";
import { getServerTranslator } from "@/i18n/server";
import { updateProfile } from "../actions";

export default async function ProfileSettingsPage() {
  const currentUser = await requireUser();
  const { t } = await getServerTranslator();
  const [profile] = await getDatabase().select({ name: users.name, email: users.email, handle: users.handle, bio: userProfiles.bio, region: userProfiles.region, websiteUrl: userProfiles.websiteUrl }).from(users).leftJoin(userProfiles, eq(users.id, userProfiles.userId)).where(eq(users.id, currentUser.id)).limit(1);
  return <><header className="dashboard-header"><div><h1>{t("settings.profile.title")}</h1><p>{t("settings.profile.subtitle")}</p></div></header><section className="dashboard-card"><form className="dashboard-form" action={updateProfile}><div className="dashboard-row"><label>{t("settings.profile.name")}<input name="name" defaultValue={profile?.name ?? ""} required /></label><label>{t("settings.profile.handle")}<input name="handle" defaultValue={profile?.handle ?? ""} required /></label></div><label>{t("settings.profile.email")}<input value={profile?.email ?? ""} disabled /></label><label>{t("settings.profile.bio")}<textarea name="bio" defaultValue={profile?.bio ?? ""} maxLength={400} /></label><div className="dashboard-row"><label>{t("settings.profile.region")}<input name="region" defaultValue={profile?.region ?? ""} /></label><label>{t("settings.profile.website")}<input name="websiteUrl" type="url" defaultValue={profile?.websiteUrl ?? ""} /></label></div><button>{t("settings.profile.save")}</button></form></section></>;
}
