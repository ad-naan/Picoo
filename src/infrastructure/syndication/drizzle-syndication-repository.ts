import { and, eq } from "drizzle-orm";
import { getDatabase } from "@/infrastructure/database/client";
import { feedSubscriptions, syndicatedItems } from "@/infrastructure/database/schema";
import type { FeedSubscription, SyndicatedItem } from "@/modules/syndication/domain/feed";
import type { FeedFetchResult, SyndicationRepository } from "@/modules/syndication/application/ports/feed-gateway";

function toDomain(row: typeof feedSubscriptions.$inferSelect): FeedSubscription {
  const subscription: FeedSubscription = {
    id: row.id,
    url: row.url,
    title: row.title,
    status: row.status,
    failureCount: row.failureCount,
  };
  if (row.lastPolledAt) subscription.lastPolledAt = row.lastPolledAt;
  if (row.lastSuccessfulAt) subscription.lastSuccessfulAt = row.lastSuccessfulAt;
  if (row.etag) subscription.etag = row.etag;
  if (row.lastModified) subscription.lastModified = row.lastModified;
  if (row.lastError) subscription.lastError = row.lastError;
  return subscription;
}

export class DrizzleSyndicationRepository implements SyndicationRepository {
  async saveItems(items: readonly SyndicatedItem[]) {
    if (items.length === 0) return 0;
    const rows = items.map((item) => ({
      sourceId: item.sourceId,
      externalId: item.externalId,
      canonicalUrl: item.canonicalUrl,
      title: item.title,
      summary: item.summary,
      content: item.content,
      author: item.author,
      imageUrl: item.imageUrl,
      publishedAt: item.publishedAt,
      importedAt: item.importedAt,
    }));
    const inserted = await getDatabase().insert(syndicatedItems).values(rows).onConflictDoNothing().returning({ id: syndicatedItems.id });
    return inserted.length;
  }

  async hasExternalId(sourceId: string, externalId: string) {
    const [item] = await getDatabase().select({ id: syndicatedItems.id }).from(syndicatedItems).where(and(eq(syndicatedItems.sourceId, sourceId), eq(syndicatedItems.externalId, externalId))).limit(1);
    return Boolean(item);
  }

  async findSubscription(id: string) {
    const [row] = await getDatabase().select().from(feedSubscriptions).where(eq(feedSubscriptions.id, id)).limit(1);
    if (!row) return null;
    return toDomain(row);
  }

  async markFetchSucceeded(id: string, result: FeedFetchResult) {
    const values: Partial<typeof feedSubscriptions.$inferInsert> = {
      status: "active",
      lastPolledAt: new Date(),
      lastSuccessfulAt: new Date(),
      failureCount: 0,
      lastError: null,
      updatedAt: new Date(),
    };
    if (result.etag) values.etag = result.etag;
    if (result.lastModified) values.lastModified = result.lastModified;
    await getDatabase().update(feedSubscriptions).set(values).where(eq(feedSubscriptions.id, id));
  }

  async markFetchFailed(id: string, message: string) {
    const subscription = await this.findSubscription(id);
    let failureCount = 1;
    if (subscription) failureCount = subscription.failureCount + 1;
    await getDatabase().update(feedSubscriptions).set({ status: "failing", lastPolledAt: new Date(), failureCount, lastError: message.slice(0, 500), updatedAt: new Date() }).where(eq(feedSubscriptions.id, id));
  }
}
