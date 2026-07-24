"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/modules/identity/application/authorization";
import { CREATION_TYPES } from "@/modules/creation/domain/creation";
import { DrizzleCreationRepository } from "@/infrastructure/creation/drizzle-creation-repository";
import { writeAudit } from "@/infrastructure/audit/audit-service";

const repository = new DrizzleCreationRepository();

const listField = (raw: string) => raw.split(/[\r\n,]+/).map((item) => item.trim()).filter(Boolean).slice(0, 20);

const creationSchema = z.object({
  type: z.enum(CREATION_TYPES),
  title: z.string().trim().min(4).max(120),
  description: z.string().trim().min(10).max(400),
  content: z.string().trim().max(20000).default(""),
  coverUrl: z.string().trim().url().max(500).optional().or(z.literal("")),
  tags: z.string().max(400).default(""),
  compatibleModels: z.string().max(400).default(""),
});

function parseForm(formData: FormData) {
  const parsed = creationSchema.parse(Object.fromEntries(formData.entries()));
  return {
    type: parsed.type,
    title: parsed.title,
    description: parsed.description,
    content: parsed.content ?? "",
    coverUrl: parsed.coverUrl ? parsed.coverUrl : undefined,
    tags: listField(parsed.tags),
    compatibleModels: listField(parsed.compatibleModels),
  };
}

// 确认作品归属；非本人操作一律拒绝。
async function assertOwner(id: string, userId: string) {
  const existing = await repository.findById(id);
  if (!existing) throw new Error("CREATION_NOT_FOUND");
  if (existing.props.authorId !== userId) throw new Error("FORBIDDEN");
  return existing;
}

export async function createCreation(formData: FormData) {
  const user = await requirePermission("creation:publish");
  const input = parseForm(formData);
  const creation = await repository.create({ authorId: user.id, ...input });
  await writeAudit({ actorId: user.id, action: "creation.create", resourceType: "creation", resourceId: creation.props.id });
  revalidatePath("/studio/creations");
  redirect(`/studio/creations/${creation.props.id}/edit`);
}

export async function updateCreation(formData: FormData) {
  const user = await requirePermission("creation:update:own");
  const id = String(formData.get("id"));
  await assertOwner(id, user.id);
  const input = parseForm(formData);
  await repository.update(id, user.id, input);
  await writeAudit({ actorId: user.id, action: "creation.update", resourceType: "creation", resourceId: id });
  revalidatePath("/studio/creations");
  revalidatePath(`/studio/creations/${id}/edit`);
}

export async function publishCreation(formData: FormData) {
  const user = await requirePermission("creation:publish");
  const id = String(formData.get("id"));
  const creation = await assertOwner(id, user.id);
  creation.publish(new Date()); // 领域校验：拒绝重复发布 / 归档作品
  const published = await repository.setStatus(id, user.id, "published");
  await writeAudit({ actorId: user.id, action: "creation.publish", resourceType: "creation", resourceId: id });
  revalidatePath("/studio/creations");
  revalidatePath("/explore");
  redirect(`/creation/${published.props.slug}`);
}

export async function archiveCreation(formData: FormData) {
  const user = await requirePermission("creation:update:own");
  const id = String(formData.get("id"));
  await assertOwner(id, user.id);
  await repository.setStatus(id, user.id, "archived");
  await writeAudit({ actorId: user.id, action: "creation.archive", resourceType: "creation", resourceId: id });
  revalidatePath("/studio/creations");
  revalidatePath("/explore");
}

export async function deleteCreation(formData: FormData) {
  const user = await requirePermission("creation:update:own");
  const id = String(formData.get("id"));
  await assertOwner(id, user.id);
  await repository.remove(id, user.id);
  await writeAudit({ actorId: user.id, action: "creation.delete", resourceType: "creation", resourceId: id });
  revalidatePath("/studio/creations");
  revalidatePath("/explore");
}
