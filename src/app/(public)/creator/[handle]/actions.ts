"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/modules/identity/application/authorization";
import { DrizzleSocialRepository } from "@/infrastructure/social/drizzle-social-repository";
import { writeAudit } from "@/infrastructure/audit/audit-service";

const repository = new DrizzleSocialRepository();

export async function toggleCreatorFollow(creatorId: string, handle: string) {
  const user = await requireUser();
  const active = await repository.toggleFollow(user.id, z.string().uuid().parse(creatorId));
  await writeAudit({ actorId: user.id, action: active ? "creator.follow" : "creator.unfollow", resourceType: "user", resourceId: creatorId });
  revalidatePath(`/creator/${handle}`);
  return active;
}
