import type { FeedSubscription, SyndicatedItem } from "../../domain/feed";

export interface FeedGateway {
  fetch(subscription: FeedSubscription): Promise<readonly SyndicatedItem[]>;
}

export interface ItemPublisher {
  publish(item: SyndicatedItem, targetId: string): Promise<void>;
}

export interface SyndicationRepository {
  saveItems(items: readonly SyndicatedItem[]): Promise<number>;
  hasExternalId(sourceId: string, externalId: string): Promise<boolean>;
}
