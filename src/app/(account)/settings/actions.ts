"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/modules/identity/application/authorization";
import { getDatabase } from "@/infrastructure/database/client";
import { userProfiles, users } from "@/infrastructure/database/schema";
import { DrizzleIdentityRepository } from "@/infrastructure/identity/drizzle-identity-repository";
import { hashPassword, verifyPassword } from "@/infrastructure/security/password";
import { writeAudit } from "@/infrastructure/audit/audit-service";

const profileSchema = z.object({ name: z.string().trim().min(2).max(50), handle: z.string().trim().toLowerCase().regex(/^[a-z0-9][a-z0-9_-]{2,29}$/), bio: z.string().trim().max(400), region: z.string().trim().max(80), websiteUrl: z.union([z.literal(""), z.string().url()]) });

export async function updateProfile(formData: FormData) {
  const currentUser = await requireUser();
  const parsed = profileSchema.parse(Object.fromEntries(formData.entries()));
  const db = getDatabase();
  await db.transaction(async (tx) => {
    await tx.update(users).set({ name: parsed.name, handle: parsed.handle, updatedAt: new Date() }).where(eq(users.id, currentUser.id));
    await tx.insert(userProfiles).values({ userId: currentUser.id, bio: parsed.bio, region: parsed.region, websiteUrl: parsed.websiteUrl || null }).onConflictDoUpdate({ target: userProfiles.userId, set: { bio: parsed.bio, region: parsed.region, websiteUrl: parsed.websiteUrl || null, updatedAt: new Date() } });
  });
  await writeAudit({ actorId: currentUser.id, action: "profile.update", resourceType: "user", resourceId: currentUser.id });
  revalidatePath("/settings/profile");
}

const passwordSchema = z.object({ currentPassword: z.string().min(8), newPassword: z.string().min(10).max(128).regex(/[a-z]/).regex(/[A-Z]/).regex(/[0-9]/) });

export async function changePassword(formData: FormData) {
  const currentUser = await requireUser();
  const parsed = passwordSchema.parse(Object.fromEntries(formData.entries()));
  const repository = new DrizzleIdentityRepository();
  const user = await repository.findById(currentUser.id);
  if (!user?.passwordHash || !(await verifyPassword(user.passwordHash, parsed.currentPassword))) throw new Error("INVALID_CURRENT_PASSWORD");
  const passwordHash = await hashPassword(parsed.newPassword);
  await getDatabase().update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, currentUser.id));
  await writeAudit({ actorId: currentUser.id, action: "account.password.change", resourceType: "user", resourceId: currentUser.id });
}
