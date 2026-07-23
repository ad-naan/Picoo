import { and, eq, gt, isNull, or } from "drizzle-orm";
import type { IdentityRepository, IdentityUser } from "@/modules/identity/application/ports/identity-repository";
import type { UserRole } from "@/modules/identity/domain/role";
import { getDatabase } from "@/infrastructure/database/client";
import { userProfiles, userRoles, users } from "@/infrastructure/database/schema";

export class DrizzleIdentityRepository implements IdentityRepository {
  private get db() { return getDatabase(); }

  async findByEmail(email: string) {
    const [user] = await this.db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    if (!user) return null;
    return this.withRoles(user);
  }

  async findById(id: string) {
    const [user] = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!user) return null;
    return this.withRoles(user);
  }

  async createWithPassword(input: { email: string; name: string; handle: string; passwordHash: string }) {
    const created = await this.db.transaction(async (tx) => {
      const [user] = await tx.insert(users).values({
        email: input.email.toLowerCase(), name: input.name, handle: input.handle.toLowerCase(),
        passwordHash: input.passwordHash, status: "pending",
      }).returning();
      await tx.insert(userProfiles).values({ userId: user.id });
      await tx.insert(userRoles).values({ userId: user.id, role: "member" });
      return user;
    });
    return this.withRoles(created);
  }

  async assignRole(userId: string, role: UserRole, grantedBy?: string) {
    await this.db.insert(userRoles).values({ userId, role, grantedBy }).onConflictDoNothing();
  }

  private async withRoles(user: typeof users.$inferSelect): Promise<IdentityUser> {
    const now = new Date();
    const rows = await this.db.select({ role: userRoles.role }).from(userRoles).where(and(
      eq(userRoles.userId, user.id),
      or(isNull(userRoles.expiresAt), gt(userRoles.expiresAt, now)),
    ));
    const roles = rows.map((row) => row.role);
    return { ...user, roles };
  }
}
