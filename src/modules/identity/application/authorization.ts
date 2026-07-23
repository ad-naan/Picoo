import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { can, type Permission, type UserRole } from "../domain/role";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");
  return session.user;
}

export async function requirePermission(permission: Permission) {
  const user = await requireUser();
  if (!can(user.roles, permission)) redirect("/forbidden");
  return user;
}

export async function requireRole(allowedRoles: readonly UserRole[]) {
  const user = await requireUser();
  const matches = user.roles.some((role) => allowedRoles.includes(role));
  if (!matches) redirect("/forbidden");
  return user;
}
