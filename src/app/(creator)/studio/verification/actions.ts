"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/modules/identity/application/authorization";
import { getDatabase } from "@/infrastructure/database/client";
import { verificationApplications } from "@/infrastructure/database/schema";
import { writeAudit } from "@/infrastructure/audit/audit-service";

const applicationSchema = z.object({ statement: z.string().trim().min(60).max(2000), evidence: z.string().trim().min(5).max(4000) });

export async function submitVerification(formData: FormData) {
  const user = await requirePermission("verification:submit");
  const parsed = applicationSchema.parse(Object.fromEntries(formData.entries()));
  const db = getDatabase();
  const [existing] = await db.select({ id: verificationApplications.id }).from(verificationApplications).where(and(eq(verificationApplications.userId, user.id), inArray(verificationApplications.status, ["submitted", "under_review", "approved"]))).limit(1);
  if (existing) throw new Error("ACTIVE_APPLICATION_EXISTS");
  const evidenceLinks = parsed.evidence.split(/\r?\n/).map((item: string) => item.trim()).filter(Boolean);
  const [application] = await db.insert(verificationApplications).values({ userId: user.id, statement: parsed.statement, evidenceLinks, status: "submitted", submittedAt: new Date() }).returning({ id: verificationApplications.id });
  await writeAudit({ actorId: user.id, action: "verification.submit", resourceType: "verification_application", resourceId: application.id });
  revalidatePath("/studio/verification");
}
