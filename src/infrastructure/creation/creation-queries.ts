import { and, desc, eq, sql } from "drizzle-orm";
import { getDatabase } from "@/infrastructure/database/client";
import { creations, users } from "@/infrastructure/database/schema";
import type { CreationType } from "@/modules/creation/domain/creation";
import { formatCount } from "@/shared/lib/format";
import type { CreationCardData } from "@/components/site/creation-card";

// 读模型：面向展示的查询，join 出作者 handle，与写侧仓储分离。
export interface CreationCardQuery {
  type?: CreationType;
  tag?: string;
  sort?: "trending" | "latest";
  limit: number;
  offset?: number;
}

function toCardData(row: {
  slug: string; title: string; description: string; type: string;
  handle: string | null; name: string | null; likes: number; favorites: number; coverUrl: string | null;
}): CreationCardData {
  return {
    slug: row.slug, title: row.title, description: row.description, type: row.type,
    authorHandle: row.handle ?? row.name ?? "creator",
    likes: formatCount(row.likes), comments: row.favorites,
    coverUrl: row.coverUrl ?? undefined,
  };
}

const CARD_COLUMNS = {
  slug: creations.slug, title: creations.title, description: creations.description, type: creations.type,
  handle: users.handle, name: users.name, likes: creations.likes, favorites: creations.favorites, coverUrl: creations.coverUrl,
} as const;

export async function queryPublishedCards(opts: CreationCardQuery): Promise<CreationCardData[]> {
  const conditions = [eq(creations.status, "published")];
  if (opts.type) conditions.push(eq(creations.type, opts.type));
  if (opts.tag) conditions.push(sql`${creations.tags} ? ${opts.tag}`);
  const order = opts.sort === "latest"
    ? [desc(creations.publishedAt), desc(creations.createdAt)]
    : [desc(creations.views), desc(creations.likes)];
  const rows = await getDatabase().select(CARD_COLUMNS).from(creations)
    .innerJoin(users, eq(users.id, creations.authorId))
    .where(and(...conditions)).orderBy(...order).limit(opts.limit).offset(opts.offset ?? 0);
  return rows.map(toCardData);
}

export async function queryFeaturedCards(limit: number): Promise<CreationCardData[]> {
  const rows = await getDatabase().select(CARD_COLUMNS).from(creations)
    .innerJoin(users, eq(users.id, creations.authorId))
    .where(eq(creations.status, "published"))
    .orderBy(desc(creations.likes), desc(creations.views)).limit(limit);
  return rows.map(toCardData);
}

// 作者主页用：按作者已发布作品返回卡片。
export async function queryCardsByAuthor(authorId: string, limit: number): Promise<CreationCardData[]> {
  const rows = await getDatabase().select(CARD_COLUMNS).from(creations)
    .innerJoin(users, eq(users.id, creations.authorId))
    .where(and(eq(creations.authorId, authorId), eq(creations.status, "published")))
    .orderBy(desc(creations.publishedAt)).limit(limit);
  return rows.map(toCardData);
}

// 首页热门作者读模型。
export interface TopCreator { handle: string; specialty: string; followers: string; }

export async function queryTopCreators(limit: number): Promise<TopCreator[]> {
  const rows = await getDatabase().select({
    handle: users.handle, name: users.name, works: sql<number>`count(${creations.id})`.as("works"),
  }).from(users)
    .innerJoin(creations, and(eq(creations.authorId, users.id), eq(creations.status, "published")))
    .groupBy(users.id, users.handle, users.name)
    .orderBy(desc(sql`count(${creations.id})`)).limit(limit);
  return rows.map((row) => ({
    handle: row.handle ?? row.name ?? "creator",
    specialty: `${row.works} 个作品`,
    followers: formatCount(Number(row.works)),
  }));
}
