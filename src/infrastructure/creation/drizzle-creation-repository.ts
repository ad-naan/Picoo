import { and, desc, eq, sql } from "drizzle-orm";
import { Creation, type CreationStatus } from "@/modules/creation/domain/creation";
import { shortSuffix, slugify } from "@/modules/creation/domain/slug";
import type {
  CreateCreationInput, CreationRepository, ListPublishedOptions, UpdateCreationPatch,
} from "@/modules/creation/application/ports/creation-repository";
import { getDatabase } from "@/infrastructure/database/client";
import { creations } from "@/infrastructure/database/schema";

type CreationRow = typeof creations.$inferSelect;

export class DrizzleCreationRepository implements CreationRepository {
  private get db() { return getDatabase(); }

  async findFeatured(limit: number) {
    const rows = await this.db.select().from(creations)
      .where(eq(creations.status, "published"))
      .orderBy(desc(creations.likes), desc(creations.views)).limit(limit);
    return rows.map(toDomain);
  }

  async findTrending(type?: Creation["props"]["type"], limit = 12) {
    const rows = await this.db.select().from(creations)
      .where(type ? and(eq(creations.status, "published"), eq(creations.type, type)) : eq(creations.status, "published"))
      .orderBy(desc(creations.views), desc(creations.likes)).limit(limit);
    return rows.map(toDomain);
  }

  async findById(id: string) {
    const [row] = await this.db.select().from(creations).where(eq(creations.id, id)).limit(1);
    return row ? toDomain(row) : null;
  }

  async findBySlug(slug: string) {
    const [row] = await this.db.select().from(creations).where(eq(creations.slug, slug)).limit(1);
    return row ? toDomain(row) : null;
  }

  async findByAuthor(authorId: string, opts?: { status?: CreationStatus }) {
    const filter = opts?.status
      ? and(eq(creations.authorId, authorId), eq(creations.status, opts.status))
      : eq(creations.authorId, authorId);
    const rows = await this.db.select().from(creations).where(filter).orderBy(desc(creations.updatedAt));
    return rows.map(toDomain);
  }

  async listPublished(opts: ListPublishedOptions) {
    const conditions = [eq(creations.status, "published")];
    if (opts.type) conditions.push(eq(creations.type, opts.type));
    if (opts.tag) conditions.push(sql`${creations.tags} ? ${opts.tag}`);
    const order = opts.sort === "latest"
      ? [desc(creations.publishedAt), desc(creations.createdAt)]
      : [desc(creations.views), desc(creations.likes)];
    const rows = await this.db.select().from(creations)
      .where(and(...conditions)).orderBy(...order).limit(opts.limit).offset(opts.offset);
    return rows.map(toDomain);
  }

  async create(input: CreateCreationInput) {
    const row = await this.db.transaction(async (tx) => {
      const id = crypto.randomUUID();
      const slug = slugify(input.title, shortSuffix(id));
      const [created] = await tx.insert(creations).values({
        id, authorId: input.authorId, type: input.type, slug, status: "draft",
        title: input.title, description: input.description, content: input.content,
        coverUrl: input.coverUrl, tags: [...input.tags], compatibleModels: [...input.compatibleModels],
        remixedFromId: input.remixedFromId,
      }).returning();
      return created;
    });
    return toDomain(row);
  }

  async update(id: string, authorId: string, patch: UpdateCreationPatch) {
    const [row] = await this.db.update(creations).set({
      ...(patch.type !== undefined && { type: patch.type }),
      ...(patch.title !== undefined && { title: patch.title }),
      ...(patch.description !== undefined && { description: patch.description }),
      ...(patch.content !== undefined && { content: patch.content }),
      ...(patch.coverUrl !== undefined && { coverUrl: patch.coverUrl }),
      ...(patch.tags !== undefined && { tags: [...patch.tags] }),
      ...(patch.compatibleModels !== undefined && { compatibleModels: [...patch.compatibleModels] }),
      updatedAt: new Date(),
    }).where(and(eq(creations.id, id), eq(creations.authorId, authorId))).returning();
    if (!row) throw new Error("CREATION_NOT_FOUND_OR_FORBIDDEN");
    return toDomain(row);
  }

  async setStatus(id: string, authorId: string, status: CreationStatus) {
    const [row] = await this.db.update(creations).set({
      status, updatedAt: new Date(),
      ...(status === "published" && { publishedAt: new Date() }),
    }).where(and(eq(creations.id, id), eq(creations.authorId, authorId))).returning();
    if (!row) throw new Error("CREATION_NOT_FOUND_OR_FORBIDDEN");
    return toDomain(row);
  }

  async incrementView(id: string) {
    await this.db.update(creations).set({ views: sql`${creations.views} + 1` }).where(eq(creations.id, id));
  }

  async remove(id: string, authorId: string) {
    const rows = await this.db.delete(creations)
      .where(and(eq(creations.id, id), eq(creations.authorId, authorId))).returning({ id: creations.id });
    if (rows.length === 0) throw new Error("CREATION_NOT_FOUND_OR_FORBIDDEN");
  }

  async save(creation: Creation) {
    const p = creation.props;
    await this.db.insert(creations).values({
      id: p.id, authorId: p.authorId, type: p.type, slug: p.slug, status: p.status,
      title: p.title, description: p.description, content: p.content, coverUrl: p.coverUrl,
      tags: [...p.tags], compatibleModels: [...p.compatibleModels], remixedFromId: p.remixedFromId,
      likes: p.stats.likes, views: p.stats.views, forks: p.stats.forks, favorites: p.stats.favorites,
      publishedAt: p.publishedAt, createdAt: p.createdAt,
    }).onConflictDoUpdate({
      target: creations.id,
      set: {
        type: p.type, slug: p.slug, status: p.status, title: p.title, description: p.description,
        content: p.content, coverUrl: p.coverUrl, tags: [...p.tags], compatibleModels: [...p.compatibleModels],
        publishedAt: p.publishedAt, updatedAt: new Date(),
      },
    });
  }
}

function toDomain(row: CreationRow): Creation {
  return Creation.create({
    id: row.id, type: row.type, slug: row.slug, status: row.status,
    title: row.title, description: row.description, content: row.content,
    coverUrl: row.coverUrl ?? undefined, authorId: row.authorId,
    tags: row.tags, compatibleModels: row.compatibleModels,
    stats: { likes: row.likes, views: row.views, forks: row.forks, favorites: row.favorites },
    remixedFromId: row.remixedFromId ?? undefined,
    publishedAt: row.publishedAt ?? undefined, createdAt: row.createdAt,
  });
}
