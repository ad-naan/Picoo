"use server";

import { count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/modules/identity/application/authorization";
import { BADGE_RARITIES, nextBadgeSerial } from "@/modules/badge/domain/badge";
import { getDatabase } from "@/infrastructure/database/client";
import { badges, badgeTranslations, userBadges, users } from "@/infrastructure/database/schema";
import { writeAudit } from "@/infrastructure/audit/audit-service";

const createSchema = z.object({
  key: z.string().trim().toLowerCase().regex(/^[a-z0-9][a-z0-9-]{2,63}$/),
  rarity: z.enum(BADGE_RARITIES),
  maxSupply: z.string().trim().regex(/^\d*$/),
  artworkUrl: z.union([z.literal(""), z.string().url().max(2000)]),
  zhName: z.string().trim().min(1).max(80),
  zhDescription: z.string().trim().max(400),
  enName: z.string().trim().min(1).max(80),
  enDescription: z.string().trim().max(400),
});

export async function createBadge(formData: FormData) {
  const administrator = await requirePermission("badge:manage");
  const input = createSchema.parse(Object.fromEntries(formData.entries()));
  let maxSupply: number | null = null;
  if (input.maxSupply) maxSupply = Number(input.maxSupply);
  const db = getDatabase();
  const badgeId = await db.transaction(async (tx) => {
    const [badge] = await tx.insert(badges).values({ key: input.key, rarity: input.rarity, maxSupply, artworkUrl: input.artworkUrl || null, createdBy: administrator.id }).returning({ id: badges.id });
    await tx.insert(badgeTranslations).values([
      { badgeId: badge.id, locale: "zh-CN", name: input.zhName, description: input.zhDescription },
      { badgeId: badge.id, locale: "en", name: input.enName, description: input.enDescription },
    ]);
    return badge.id;
  });
  await writeAudit({ actorId: administrator.id, action: "badge.create", resourceType: "badge", resourceId: badgeId, metadata: { key: input.key, rarity: input.rarity, maxSupply } });
  revalidatePath("/admin/badges");
}

export async function awardBadge(formData: FormData) {
  const administrator = await requirePermission("badge:award");
  const badgeId = z.string().uuid().parse(formData.get("badgeId"));
  const email = z.string().trim().toLowerCase().email().parse(formData.get("email"));
  const db = getDatabase();
  const awarded = await db.transaction(async (tx) => {
    const [badge] = await tx.select().from(badges).where(eq(badges.id, badgeId)).limit(1);
    if (!badge || !badge.active) throw new Error("BADGE_NOT_AVAILABLE");
    const [recipient] = await tx.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (!recipient) throw new Error("BADGE_RECIPIENT_NOT_FOUND");
    const [issued] = await tx.select({ value: count() }).from(userBadges).where(eq(userBadges.badgeId, badgeId));
    const serialNumber = nextBadgeSerial(issued.value, badge.maxSupply);
    const [record] = await tx.insert(userBadges).values({ userId: recipient.id, badgeId, serialNumber, awardedBy: administrator.id, awardReason: "manual_admin_award" }).returning({ id: userBadges.id });
    return { id: record.id, recipientId: recipient.id, serialNumber };
  });
  await writeAudit({ actorId: administrator.id, action: "badge.award", resourceType: "user_badge", resourceId: awarded.id, metadata: { badgeId, recipientId: awarded.recipientId, serialNumber: awarded.serialNumber } });
  revalidatePath("/admin/badges");
  revalidatePath("/settings/badges");
}
