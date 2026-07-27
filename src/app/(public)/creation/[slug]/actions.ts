"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/modules/identity/application/authorization";
import { DrizzleSocialRepository } from "@/infrastructure/social/drizzle-social-repository";
import { writeAudit } from "@/infrastructure/audit/audit-service";
import { DrizzleCreationRepository } from "@/infrastructure/creation/drizzle-creation-repository";
import { redirect } from "next/navigation";

const idSchema = z.string().uuid();
const commentSchema = z.string().trim().min(1).max(1000);
const socialRepository = new DrizzleSocialRepository();
const creationRepository = new DrizzleCreationRepository();

async function assertPublished(creationId: string) {
  const id = idSchema.parse(creationId);
  const creation = await creationRepository.findById(id);
  if (!creation || creation.props.status !== "published") throw new Error("CREATION_NOT_AVAILABLE");
  return id;
}

export async function toggleCreationLike(creationId: string, slug: string) {
  const user = await requireUser();
  const result = await socialRepository.toggleLike(user.id, await assertPublished(creationId));
  await writeAudit({ actorId: user.id, action: result.active ? "creation.like" : "creation.unlike", resourceType: "creation", resourceId: creationId });
  revalidatePath(`/creation/${slug}`);
  return result;
}

export async function toggleCreationFavorite(creationId: string, slug: string) {
  const user = await requireUser();
  const result = await socialRepository.toggleFavorite(user.id, await assertPublished(creationId));
  await writeAudit({ actorId: user.id, action: result.active ? "creation.favorite" : "creation.unfavorite", resourceType: "creation", resourceId: creationId });
  revalidatePath(`/creation/${slug}`);
  return result;
}

export async function addCreationComment(creationId: string, slug: string, content: string) {
  const user = await requireUser();
  const comment = await socialRepository.createComment(user.id, await assertPublished(creationId), commentSchema.parse(content));
  await writeAudit({ actorId: user.id, action: "comment.create", resourceType: "creation", resourceId: creationId });
  revalidatePath(`/creation/${slug}`);
  return { ...comment, createdAt: comment.createdAt.toISOString() };
}

export async function createCreationRemix(creationId: string) {
  const user = await requireUser();
  if (!user.roles.some((role) => ["creator", "admin", "super_admin"].includes(role))) redirect("/studio/verification");
  const remix = await creationRepository.createRemix(idSchema.parse(creationId), user.id);
  await writeAudit({ actorId: user.id, action: "creation.remix", resourceType: "creation", resourceId: remix.props.id, metadata: { sourceId: creationId } });
  redirect(`/studio/creations/${remix.props.id}/edit`);
}
