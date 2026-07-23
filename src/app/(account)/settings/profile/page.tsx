import { eq } from "drizzle-orm";
import { requireUser } from "@/modules/identity/application/authorization";
import { getDatabase } from "@/infrastructure/database/client";
import { userProfiles, users } from "@/infrastructure/database/schema";
import { updateProfile } from "../actions";

export default async function ProfileSettingsPage() {
  const currentUser = await requireUser();
  const [profile] = await getDatabase().select({ name: users.name, email: users.email, handle: users.handle, bio: userProfiles.bio, region: userProfiles.region, websiteUrl: userProfiles.websiteUrl }).from(users).leftJoin(userProfiles, eq(users.id, userProfiles.userId)).where(eq(users.id, currentUser.id)).limit(1);
  return <><header className="dashboard-header"><div><h1>个人资料</h1><p>管理公开主页、创作者标识和个人介绍。</p></div></header><section className="dashboard-card"><form className="dashboard-form" action={updateProfile}><div className="dashboard-row"><label>昵称<input name="name" defaultValue={profile?.name ?? ""} required /></label><label>Handle<input name="handle" defaultValue={profile?.handle ?? ""} required /></label></div><label>登录邮箱<input value={profile?.email ?? ""} disabled /></label><label>个人简介<textarea name="bio" defaultValue={profile?.bio ?? ""} maxLength={400} /></label><div className="dashboard-row"><label>地区<input name="region" defaultValue={profile?.region ?? ""} /></label><label>个人网站<input name="websiteUrl" type="url" defaultValue={profile?.websiteUrl ?? ""} /></label></div><button>保存资料</button></form></section></>;
}
