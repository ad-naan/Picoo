"use server";

import { and, count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/modules/identity/application/authorization";
import { USER_ROLES } from "@/modules/identity/domain/role";
import { getDatabase } from "@/infrastructure/database/client";
import { userRoles, users } from "@/infrastructure/database/schema";
import { writeAudit } from "@/infrastructure/audit/audit-service";

const userIdSchema = z.string().uuid();
const roleSchema = z.enum(USER_ROLES);
const manageableStatusSchema = z.enum(["active", "restricted", "suspended", "banned"]);

async function assertTargetCanBeManaged(actor: { id: string; roles: readonly string[] }, targetId: string) {
  if (actor.id === targetId) throw new Error("ADMIN_SELF_MUTATION_NOT_ALLOWED");
  const db = getDatabase();
  const [target] = await db.select({ id: users.id }).from(users).where(eq(users.id, targetId)).limit(1);
  if (!target) throw new Error("USER_NOT_FOUND");
  const targetRoles = await db.select({ role: userRoles.role }).from(userRoles).where(eq(userRoles.userId, targetId));
  const targetIsSuperAdmin = targetRoles.some((entry) => entry.role === "super_admin");
  const actorIsSuperAdmin = actor.roles.includes("super_admin");
  if (targetIsSuperAdmin && !actorIsSuperAdmin) throw new Error("SUPER_ADMIN_REQUIRED");
}

export async function updateUserStatus(formData: FormData) {
  const administrator = await requirePermission("user:manage");
  const userId = userIdSchema.parse(formData.get("userId"));
  const status = manageableStatusSchema.parse(formData.get("status"));
  await assertTargetCanBeManaged(administrator, userId);
  await getDatabase().update(users).set({ status, updatedAt: new Date() }).where(eq(users.id, userId));
  await writeAudit({ actorId: administrator.id, action: "user.status.update", resourceType: "user", resourceId: userId, metadata: { status } });
  revalidatePath("/admin/users");
}

export async function grantUserRole(formData: FormData) {
  const administrator = await requirePermission("role:grant");
  const userId = userIdSchema.parse(formData.get("userId"));
  const role = roleSchema.parse(formData.get("role"));
  await assertTargetCanBeManaged(administrator, userId);
  await getDatabase().insert(userRoles).values({ userId, role, grantedBy: administrator.id }).onConflictDoNothing();
  await writeAudit({ actorId: administrator.id, action: "user.role.grant", resourceType: "user", resourceId: userId, metadata: { role } });
  revalidatePath("/admin/users");
}

export async function revokeUserRole(formData: FormData) {
  const administrator = await requirePermission("role:grant");
  const userId = userIdSchema.parse(formData.get("userId"));
  const role = roleSchema.parse(formData.get("role"));
  if (role === "member") throw new Error("BASE_MEMBER_ROLE_CANNOT_BE_REVOKED");
  await assertTargetCanBeManaged(administrator, userId);
  if (role === "super_admin") {
    const [superAdminCount] = await getDatabase().select({ value: count() }).from(userRoles).where(eq(userRoles.role, "super_admin"));
    if (superAdminCount.value <= 1) throw new Error("LAST_SUPER_ADMIN_CANNOT_BE_REVOKED");
  }
  await getDatabase().delete(userRoles).where(and(eq(userRoles.userId, userId), eq(userRoles.role, role)));
  await writeAudit({ actorId: administrator.id, action: "user.role.revoke", resourceType: "user", resourceId: userId, metadata: { role } });
  revalidatePath("/admin/users");
}
