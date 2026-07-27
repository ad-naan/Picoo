import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { and, count, eq, gt, isNull, or } from "drizzle-orm";
import { getDatabase } from "@/infrastructure/database/client";
import { creatorProfiles, follows, userProfiles, userRoles, users } from "@/infrastructure/database/schema";
import { queryCardsByAuthor } from "@/infrastructure/creation/creation-queries";
import { CreatorProfileView, type CreatorProfileData } from "./creator-profile-view";
import { DrizzleSocialRepository } from "@/infrastructure/social/drizzle-social-repository";
import { auth } from "@/auth";

const socialRepository = new DrizzleSocialRepository();

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
      id: row.id, authenticated: false, isSelf: false, following: false, followerCount: 0,
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
  const session = await auth();
  const [works, following, followerRows] = await Promise.all([
    queryCardsByAuthor(loaded.authorId, 24),
    socialRepository.isFollowing(session?.user?.id, loaded.authorId),
    getDatabase().select({ value: count() }).from(follows).where(eq(follows.followingId, loaded.authorId)),
  ]);
  loaded.profile.authenticated = Boolean(session?.user?.id);
  loaded.profile.isSelf = session?.user?.id === loaded.authorId;
  loaded.profile.following = following;
  loaded.profile.followerCount = followerRows[0]?.value ?? 0;
  return <CreatorProfileView profile={loaded.profile} works={works} />;
}
