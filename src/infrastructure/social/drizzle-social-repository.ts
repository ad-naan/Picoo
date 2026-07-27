import { and, count, desc, eq, sql } from "drizzle-orm";
import type { SocialRepository } from "@/modules/social/application/ports/social-repository";
import type { SocialCounts } from "@/modules/social/domain/social";
import { getDatabase } from "@/infrastructure/database/client";
import { comments, creationLikes, creations, favorites, follows, notifications, users } from "@/infrastructure/database/schema";

export class DrizzleSocialRepository implements SocialRepository {
  private get db() { return getDatabase(); }

  async getCreationState(userId: string | undefined, creationId: string) {
    if (!userId) return { liked: false, favorited: false };
    const [like, favorite] = await Promise.all([
      this.db.select({ userId: creationLikes.userId }).from(creationLikes).where(and(eq(creationLikes.userId, userId), eq(creationLikes.creationId, creationId))).limit(1),
      this.db.select({ userId: favorites.userId }).from(favorites).where(and(eq(favorites.userId, userId), eq(favorites.creationId, creationId))).limit(1),
    ]);
    return { liked: like.length > 0, favorited: favorite.length > 0 };
  }

  async toggleLike(userId: string, creationId: string) {
    const active = await this.db.transaction(async (tx) => {
      const removed = await tx.delete(creationLikes).where(and(eq(creationLikes.userId, userId), eq(creationLikes.creationId, creationId))).returning({ userId: creationLikes.userId });
      if (removed.length > 0) {
        await tx.update(creations).set({ likes: sql`greatest(${creations.likes} - 1, 0)` }).where(eq(creations.id, creationId));
        return false;
      }
      const inserted = await tx.insert(creationLikes).values({ userId, creationId }).onConflictDoNothing().returning({ userId: creationLikes.userId });
      if (inserted.length > 0) {
        await tx.update(creations).set({ likes: sql`${creations.likes} + 1` }).where(eq(creations.id, creationId));
        const [creation] = await tx.select({ authorId: creations.authorId, slug: creations.slug, title: creations.title }).from(creations).where(eq(creations.id, creationId)).limit(1);
        if (creation && creation.authorId !== userId) await tx.insert(notifications).values({ recipientId: creation.authorId, actorId: userId, type: "creation.liked", entityType: "creation", entityId: creationId, data: { slug: creation.slug, title: creation.title } });
      }
      return true;
    });
    return { active, counts: await this.counts(creationId) };
  }

  async toggleFavorite(userId: string, creationId: string) {
    const active = await this.db.transaction(async (tx) => {
      const removed = await tx.delete(favorites).where(and(eq(favorites.userId, userId), eq(favorites.creationId, creationId))).returning({ userId: favorites.userId });
      if (removed.length > 0) {
        await tx.update(creations).set({ favorites: sql`greatest(${creations.favorites} - 1, 0)` }).where(eq(creations.id, creationId));
        return false;
      }
      const inserted = await tx.insert(favorites).values({ userId, creationId }).onConflictDoNothing().returning({ userId: favorites.userId });
      if (inserted.length > 0) await tx.update(creations).set({ favorites: sql`${creations.favorites} + 1` }).where(eq(creations.id, creationId));
      return true;
    });
    return { active, counts: await this.counts(creationId) };
  }

  async listComments(creationId: string, limit = 50) {
    const rows = await this.db.select({ id: comments.id, content: comments.content, authorId: comments.authorId, authorName: users.name, authorHandle: users.handle, authorImage: users.image, createdAt: comments.createdAt }).from(comments).innerJoin(users, eq(users.id, comments.authorId)).where(and(eq(comments.creationId, creationId), eq(comments.status, "active"))).orderBy(desc(comments.createdAt)).limit(limit);
    return rows.map((row) => ({ ...row, authorName: row.authorName ?? "Picoo Creator", authorHandle: row.authorHandle ?? "creator", authorImage: row.authorImage ?? undefined }));
  }

  async createComment(userId: string, creationId: string, content: string) {
    const [comment] = await this.db.transaction(async (tx) => {
      const inserted = await tx.insert(comments).values({ authorId: userId, creationId, content }).returning();
      const [creation] = await tx.select({ authorId: creations.authorId, slug: creations.slug, title: creations.title }).from(creations).where(eq(creations.id, creationId)).limit(1);
      if (creation && creation.authorId !== userId) await tx.insert(notifications).values({ recipientId: creation.authorId, actorId: userId, type: "creation.commented", entityType: "creation", entityId: creationId, data: { slug: creation.slug, title: creation.title } });
      return inserted;
    });
    const [author] = await this.db.select({ name: users.name, handle: users.handle, image: users.image }).from(users).where(eq(users.id, userId)).limit(1);
    return { id: comment.id, content: comment.content, authorId: userId, authorName: author?.name ?? "Picoo Creator", authorHandle: author?.handle ?? "creator", authorImage: author?.image ?? undefined, createdAt: comment.createdAt };
  }

  async isFollowing(followerId: string | undefined, followingId: string) {
    if (!followerId || followerId === followingId) return false;
    const row = await this.db.select({ followerId: follows.followerId }).from(follows).where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId))).limit(1);
    return row.length > 0;
  }

  async toggleFollow(followerId: string, followingId: string) {
    if (followerId === followingId) throw new Error("CANNOT_FOLLOW_SELF");
    return this.db.transaction(async (tx) => {
      const removed = await tx.delete(follows).where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId))).returning({ followerId: follows.followerId });
      if (removed.length > 0) return false;
      const inserted = await tx.insert(follows).values({ followerId, followingId }).onConflictDoNothing().returning({ followerId: follows.followerId });
      if (inserted.length > 0) await tx.insert(notifications).values({ recipientId: followingId, actorId: followerId, type: "creator.followed", entityType: "user", entityId: followingId });
      return true;
    });
  }

  private async counts(creationId: string): Promise<SocialCounts> {
    const [[creation], [commentCount]] = await Promise.all([
      this.db.select({ likes: creations.likes, favorites: creations.favorites }).from(creations).where(eq(creations.id, creationId)).limit(1),
      this.db.select({ value: count() }).from(comments).where(and(eq(comments.creationId, creationId), eq(comments.status, "active"))),
    ]);
    return { likes: creation?.likes ?? 0, favorites: creation?.favorites ?? 0, comments: commentCount.value };
  }
}
