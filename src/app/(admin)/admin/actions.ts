"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/modules/identity/application/authorization";
import { getDatabase } from "@/infrastructure/database/client";
import { creatorProfiles, featureFlags, userRoles, verificationApplications } from "@/infrastructure/database/schema";
import { writeAudit } from "@/infrastructure/audit/audit-service";

export async function approveVerification(formData: FormData) {
  const reviewer = await requirePermission("verification:review");
  const applicationId = String(formData.get("applicationId"));
  const db = getDatabase();
  const [application] = await db.select().from(verificationApplications).where(eq(verificationApplications.id, applicationId)).limit(1);
  if (!application || !["submitted", "under_review"].includes(application.status)) throw new Error("APPLICATION_NOT_REVIEWABLE");
  await db.transaction(async (tx) => {
    await tx.update(verificationApplications).set({ status: "approved", reviewerId: reviewer.id, reviewedAt: new Date(), reviewNote: "认证材料审核通过", updatedAt: new Date() }).where(eq(verificationApplications.id, applicationId));
    await tx.insert(userRoles).values({ userId: application.userId, role: "creator", grantedBy: reviewer.id }).onConflictDoNothing();
    await tx.insert(creatorProfiles).values({ userId: application.userId }).onConflictDoNothing();
  });
  await writeAudit({ actorId: reviewer.id, action: "verification.approve", resourceType: "verification_application", resourceId: applicationId, metadata: { userId: application.userId } });
  revalidatePath("/admin/verifications");
}

export async function rejectVerification(formData: FormData) {
  const reviewer = await requirePermission("verification:review");
  const applicationId = String(formData.get("applicationId"));
  await getDatabase().update(verificationApplications).set({ status: "rejected", reviewerId: reviewer.id, reviewedAt: new Date(), reviewNote: "公开材料不足，请补充代表作品与身份关联", updatedAt: new Date() }).where(eq(verificationApplications.id, applicationId));
  await writeAudit({ actorId: reviewer.id, action: "verification.reject", resourceType: "verification_application", resourceId: applicationId });
  revalidatePath("/admin/verifications");
}

export async function toggleFeatureFlag(formData: FormData) {
  const administrator = await requirePermission("platform:configure");
  const key = String(formData.get("key"));
  const enabled = String(formData.get("enabled")) !== "true";
  await getDatabase().insert(featureFlags).values({ key, enabled, updatedBy: administrator.id }).onConflictDoUpdate({ target: featureFlags.key, set: { enabled, updatedBy: administrator.id, updatedAt: new Date() } });
  await writeAudit({ actorId: administrator.id, action: "feature_flag.toggle", resourceType: "feature_flag", resourceId: key, metadata: { enabled } });
  revalidatePath("/admin/settings");
}
