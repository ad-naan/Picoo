export type FeedStatus = "active" | "paused" | "failing";
export type DeliveryChannel = "rss" | "webhook" | "newsletter" | "social";

export interface FeedSubscription {
  id: string;
  url: string;
  title: string;
  status: FeedStatus;
  lastPolledAt?: Date;
  etag?: string;
}

export interface SyndicatedItem {
  sourceId: string;
  externalId: string;
  canonicalUrl: string;
  title: string;
  summary: string;
  publishedAt: Date;
  importedAt: Date;
}

export interface DeliveryTarget {
  id: string;
  channel: DeliveryChannel;
  endpoint: string;
  enabled: boolean;
}
