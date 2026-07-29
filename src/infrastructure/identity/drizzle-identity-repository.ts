import { and, count, eq, gt, isNull, or } from "drizzle-orm";
import type { IdentityRepository, IdentityUser } from "@/modules/identity/application/ports/identity-repository";
import type { UserRole } from "@/modules/identity/domain/role";
import { getDatabase } from "@/infrastructure/database/client";
import { badges, badgeTranslations, userBadges, userProfiles, userRoles, users } from "@/infrastructure/database/schema";

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
      const [total] = await tx.select({ value: count() }).from(users);
      const [user] = await tx.insert(users).values({
        email: input.email.toLowerCase(), name: input.name, handle: input.handle.toLowerCase(),
        passwordHash: input.passwordHash, status: "pending",
      }).returning();
      await tx.insert(userProfiles).values({ userId: user.id });
      await tx.insert(userRoles).values({ userId: user.id, role: "member" });
      const configuredEmail = process.env.PICOO_SUPER_ADMIN_EMAIL?.trim().toLowerCase();
      const matchesConfiguredEmail = configuredEmail === input.email.toLowerCase();
      const bootstrapFirstUser = process.env.PICOO_BOOTSTRAP_FIRST_USER_AS_SUPER_ADMIN === "true" && total.value === 0;
      if (matchesConfiguredEmail || bootstrapFirstUser) {
        await tx.insert(userRoles).values({ userId: user.id, role: "super_admin", grantedBy: user.id }).onConflictDoNothing();
        const [founderBadge] = await tx.insert(badges).values({ key: "picoo-founder", rarity: "one_of_one", maxSupply: 1, createdBy: user.id, visualConfig: { treatment: "aurora-crown", animated: true } }).onConflictDoUpdate({ target: badges.key, set: { maxSupply: 1, rarity: "one_of_one", updatedAt: new Date() } }).returning({ id: badges.id });
        await tx.insert(badgeTranslations).values([
          { badgeId: founderBadge.id, locale: "zh-CN", name: "Picoo 创始人", description: "Picoo 世界中唯一的创始者铭牌。编号 #001，永不增发。", unlockHint: "仅授予 Picoo 创始人。" },
          { badgeId: founderBadge.id, locale: "en", name: "Picoo Founder", description: "The one and only founder badge in the Picoo universe. Serial #001, never reissued.", unlockHint: "Reserved for the founder of Picoo." },
        ]).onConflictDoNothing();
        await tx.insert(userBadges).values({ userId: user.id, badgeId: founderBadge.id, serialNumber: 1, awardedBy: user.id, awardReason: "platform_founder", showcased: true }).onConflictDoNothing();
      }
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
