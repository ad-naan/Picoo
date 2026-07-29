import { createHash } from "node:crypto";
import { XMLParser } from "fast-xml-parser";
import type { FeedSubscription, SyndicatedItem } from "@/modules/syndication/domain/feed";
import type { FeedFetchResult, FeedGateway } from "@/modules/syndication/application/ports/feed-gateway";
import { assertPublicFeedUrl } from "./public-feed-url";

type XmlRecord = Record<string, unknown>;

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_", textNodeName: "#text", trimValues: true, processEntities: true });

function record(value: unknown): XmlRecord {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) return value as XmlRecord;
  return {};
}

function list(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null) return [];
  return [value];
}

function text(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") return String(value).trim();
  const object = record(value);
  if (typeof object["#text"] === "string") return object["#text"].trim();
  return "";
}

function firstText(...values: unknown[]) {
  for (const value of values) {
    const candidate = text(value);
    if (candidate) return candidate;
  }
  return "";
}

function linkValue(value: unknown) {
  for (const candidate of list(value)) {
    const object = record(candidate);
    const relation = text(object["@_rel"]);
    if (relation && relation !== "alternate") continue;
    const href = firstText(object["@_href"], candidate);
    if (href) return href;
  }
  return "";
}

function plainText(value: string) {
  return value.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function validDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return new Date();
  return parsed;
}

function externalId(sourceId: string, item: XmlRecord, canonicalUrl: string) {
  const explicit = firstText(item.guid, item.id);
  if (explicit) return explicit;
  return createHash("sha256").update(`${sourceId}:${canonicalUrl}`).digest("hex");
}

function imageValue(item: XmlRecord) {
  const media = record(item["media:content"]);
  const thumbnail = record(item["media:thumbnail"]);
  const enclosure = record(item.enclosure);
  return firstText(media["@_url"], thumbnail["@_url"], enclosure["@_url"]);
}

function normalizeItem(sourceId: string, raw: unknown): SyndicatedItem | null {
  const item = record(raw);
  const canonicalUrl = firstText(linkValue(item.link), item.url);
  const title = firstText(item.title);
  if (!canonicalUrl || !title) return null;
  const summaryHtml = firstText(item.description, item.summary, item["content:encoded"], item.content);
  const content = firstText(item["content:encoded"], item.content, item.description, item.summary);
  const published = firstText(item.pubDate, item.published, item.updated, item.date);
  const author = firstText(item.author, item["dc:creator"]);
  const imageUrl = imageValue(item);
  const normalized: SyndicatedItem = {
    sourceId,
    externalId: externalId(sourceId, item, canonicalUrl),
    canonicalUrl,
    title: plainText(title),
    summary: plainText(summaryHtml).slice(0, 1000),
    content,
    publishedAt: validDate(published),
    importedAt: new Date(),
  };
  if (author) normalized.author = plainText(author);
  if (imageUrl) normalized.imageUrl = imageUrl;
  return normalized;
}

function extractItems(document: XmlRecord) {
  const rss = record(document.rss);
  const channel = record(rss.channel);
  if (Object.keys(channel).length > 0) return list(channel.item);
  const rdf = record(document["rdf:RDF"]);
  if (Object.keys(rdf).length > 0) return list(rdf.item);
  const feed = record(document.feed);
  return list(feed.entry);
}

async function fetchWithSafeRedirects(url: URL, headers: HeadersInit, redirects = 0): Promise<Response> {
  if (redirects > 3) throw new Error("FEED_TOO_MANY_REDIRECTS");
  await assertPublicFeedUrl(url.href);
  const response = await fetch(url, { headers, redirect: "manual", signal: AbortSignal.timeout(12_000) });
  if (response.status < 300 || response.status >= 400) return response;
  const location = response.headers.get("location");
  if (!location) throw new Error("FEED_REDIRECT_WITHOUT_LOCATION");
  return fetchWithSafeRedirects(new URL(location, url), headers, redirects + 1);
}

export class XmlFeedGateway implements FeedGateway {
  async fetch(subscription: FeedSubscription): Promise<FeedFetchResult> {
    const headers = new Headers({ Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9" });
    if (subscription.etag) headers.set("If-None-Match", subscription.etag);
    if (subscription.lastModified) headers.set("If-Modified-Since", subscription.lastModified);
    const response = await fetchWithSafeRedirects(new URL(subscription.url), headers);
    if (response.status === 304) return { items: [], notModified: true, etag: subscription.etag, lastModified: subscription.lastModified };
    if (!response.ok) throw new Error(`FEED_HTTP_${response.status}`);
    const declaredSize = Number(response.headers.get("content-length") ?? "0");
    if (declaredSize > 5_000_000) throw new Error("FEED_RESPONSE_TOO_LARGE");
    const xml = await response.text();
    if (xml.length > 5_000_000) throw new Error("FEED_RESPONSE_TOO_LARGE");
    const document = record(parser.parse(xml));
    const items = extractItems(document).map((item) => normalizeItem(subscription.id, item)).filter((item): item is SyndicatedItem => item !== null);
    const result: FeedFetchResult = { items, notModified: false };
    const etag = response.headers.get("etag");
    const lastModified = response.headers.get("last-modified");
    if (etag) result.etag = etag;
    if (lastModified) result.lastModified = lastModified;
    return result;
  }
}
