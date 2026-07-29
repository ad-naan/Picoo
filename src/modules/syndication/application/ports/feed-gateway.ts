import type { FeedSubscription, SyndicatedItem } from "../../domain/feed";

export interface FeedFetchResult {
  items: readonly SyndicatedItem[];
  etag?: string;
  lastModified?: string;
  notModified: boolean;
}

export interface FeedGateway {
  fetch(subscription: FeedSubscription): Promise<FeedFetchResult>;
}

export interface ItemPublisher {
  publish(item: SyndicatedItem, targetId: string): Promise<void>;
}

export interface SyndicationRepository {
  saveItems(items: readonly SyndicatedItem[]): Promise<number>;
  hasExternalId(sourceId: string, externalId: string): Promise<boolean>;
  findSubscription(id: string): Promise<FeedSubscription | null>;
  markFetchSucceeded(id: string, result: FeedFetchResult): Promise<void>;
  markFetchFailed(id: string, message: string): Promise<void>;
}
