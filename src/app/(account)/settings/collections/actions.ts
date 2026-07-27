"use server";

import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/modules/identity/application/authorization";
import { getDatabase } from "@/infrastructure/database/client";
import { collectionItems, collections } from "@/infrastructure/database/schema";
import { shortSuffix, slugify } from "@/modules/creation/domain/slug";
import { writeAudit } from "@/infrastructure/audit/audit-service";

const collectionSchema = z.object({ title: z.string().trim().min(1).max(60), description: z.string().trim().max(240), visibility: z.enum(["private", "unlisted", "public"]) });

export async function createCollection(formData: FormData) {
  const user = await requireUser();
  const parsed = collectionSchema.parse(Object.fromEntries(formData.entries()));
  const [collection] = await getDatabase().insert(collections).values({ ownerId: user.id, title: parsed.title, description: parsed.description || null, visibility: parsed.visibility, slug: slugify(parsed.title, shortSuffix(randomUUID())) }).returning({ id: collections.id });
  await writeAudit({ actorId: user.id, action: "collection.create", resourceType: "collection", resourceId: collection.id });
  revalidatePath("/settings/collections");
}

export async function deleteCollection(formData: FormData) {
  const user = await requireUser();
  const id = z.string().uuid().parse(formData.get("collectionId"));
  await getDatabase().delete(collections).where(and(eq(collections.id, id), eq(collections.ownerId, user.id)));
  await writeAudit({ actorId: user.id, action: "collection.delete", resourceType: "collection", resourceId: id });
  revalidatePath("/settings/collections");
}

export async function addToCollection(formData: FormData) {
  const user = await requireUser();
  const collectionId = z.string().uuid().parse(formData.get("collectionId"));
  const creationId = z.string().uuid().parse(formData.get("creationId"));
  const [owned] = await getDatabase().select({ id: collections.id }).from(collections).where(and(eq(collections.id, collectionId), eq(collections.ownerId, user.id))).limit(1);
  if (!owned) throw new Error("COLLECTION_NOT_FOUND");
  await getDatabase().insert(collectionItems).values({ collectionId, creationId }).onConflictDoNothing();
  revalidatePath("/settings/collections");
}
