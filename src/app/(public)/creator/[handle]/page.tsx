import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { and, eq, gt, isNull, or } from "drizzle-orm";
import { getDatabase } from "@/infrastructure/database/client";
import { creatorProfiles, userProfiles, userRoles, users } from "@/infrastructure/database/schema";
import { queryCardsByAuthor } from "@/infrastructure/creation/creation-queries";
import { CreatorProfileView, type CreatorProfileData } from "./creator-profile-view";

async function loadCreator(handle: string): Promise<{ profile: CreatorProfileData; authorId: string } | null> {
  const db = getDatabase();
  const [row] = await db.select({
    id: users.id, handle: users.handle, name: users.name,
    bio: userProfiles.bio, displayTitle: creatorProfiles.displayTitle, specialties: creatorProfiles.specialties,
  }).from(users)
    .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
    .leftJoin(creatorProfiles, eq(creatorProfiles.userId, users.id))
    .where(eq(users.handle, handle.toLowerCase())).limit(1);
  if (!row) return null;

  const now = new Date();
  const [creatorRole] = await db.select({ role: userRoles.role }).from(userRoles)
    .where(and(eq(userRoles.userId, row.id), eq(userRoles.role, "creator"), or(isNull(userRoles.expiresAt), gt(userRoles.expiresAt, now)))).limit(1);

  const works = await queryCardsByAuthor(row.id, 24);
  return {
    authorId: row.id,
    profile: {
      handle: row.handle ?? handle, name: row.name ?? row.handle ?? "Creator",
      bio: row.bio ?? undefined, displayTitle: row.displayTitle ?? undefined,
      specialties: row.specialties ?? [], verified: Boolean(creatorRole), worksCount: works.length,
    },
  };
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  const loaded = await loadCreator(handle);
  if (!loaded) return { title: "未找到创作者 · Picoo" };
  return { title: `${loaded.profile.name} (@${loaded.profile.handle}) · Picoo`, description: loaded.profile.bio ?? `${loaded.profile.name} 在 Picoo 的创作主页` };
}

export default async function CreatorPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const loaded = await loadCreator(handle);
  if (!loaded) notFound();
  const works = await queryCardsByAuthor(loaded.authorId, 24);
  return <CreatorProfileView profile={loaded.profile} works={works} />;
}
