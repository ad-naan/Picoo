export type FeedStatus = "active" | "paused" | "failing";
export type DeliveryChannel = "rss" | "webhook" | "newsletter" | "social";

export interface FeedSubscription {
  id: string;
  url: string;
  title: string;
  status: FeedStatus;
  lastPolledAt?: Date;
  lastSuccessfulAt?: Date;
  etag?: string;
  lastModified?: string;
  failureCount: number;
  lastError?: string;
}

export interface SyndicatedItem {
  sourceId: string;
  externalId: string;
  canonicalUrl: string;
  title: string;
  summary: string;
  content: string;
  author?: string;
  imageUrl?: string;
  publishedAt: Date;
  importedAt: Date;
}

export interface DeliveryTarget {
  id: string;
  name: string;
  channel: DeliveryChannel;
  endpoint: string;
  enabled: boolean;
  configuration: Readonly<Record<string, unknown>>;
}
