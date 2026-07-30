import { and, desc, eq } from "drizzle-orm";
import { getDatabase } from "@/infrastructure/database/client";
import { creations, creationTranslations, users } from "@/infrastructure/database/schema";
import { resolveLocale } from "@/i18n/config";
import { siteConfig } from "@/shared/config/site";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function absoluteUrl(pathname: string) {
  return new URL(pathname, siteConfig.url).toString();
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const locale = resolveLocale(requestUrl.searchParams.get("locale") ?? request.headers.get("accept-language"));
  const rows = await getDatabase().select({
    slug: creations.slug,
    title: creations.title,
    description: creations.description,
    content: creations.content,
    type: creations.type,
    tags: creations.tags,
    publishedAt: creations.publishedAt,
    updatedAt: creations.updatedAt,
    authorName: users.name,
    authorHandle: users.handle,
    localizedSlug: creationTranslations.localizedSlug,
    localizedTitle: creationTranslations.title,
    localizedDescription: creationTranslations.description,
    localizedContent: creationTranslations.content,
  }).from(creations)
    .innerJoin(users, eq(users.id, creations.authorId))
    .leftJoin(creationTranslations, and(
      eq(creationTranslations.creationId, creations.id),
      eq(creationTranslations.locale, locale),
      eq(creationTranslations.status, "published"),
    ))
    .where(eq(creations.status, "published"))
    .orderBy(desc(creations.publishedAt), desc(creations.updatedAt))
    .limit(50);

  const channelUrl = absoluteUrl(`/feed.xml?locale=${encodeURIComponent(locale)}`);
  const items = rows.map((row) => {
    const slug = row.localizedSlug ?? row.slug;
    const title = row.localizedTitle ?? row.title;
    const description = row.localizedDescription ?? row.description;
    const content = row.localizedContent ?? row.content;
    const url = absoluteUrl(`/creation/${slug}`);
    const author = row.authorName ?? row.authorHandle ?? "Picoo Creator";
    const publishedAt = row.publishedAt ?? row.updatedAt;
    const categories = [row.type, ...row.tags].map((tag) => `<category>${escapeXml(tag)}</category>`).join("");
    return `<item><title>${escapeXml(title)}</title><link>${escapeXml(url)}</link><guid isPermaLink="true">${escapeXml(url)}</guid><description>${escapeXml(description)}</description><content:encoded><![CDATA[${content.replaceAll("]]>", "]]&gt;")}]]></content:encoded><dc:creator>${escapeXml(author)}</dc:creator>${categories}<pubDate>${publishedAt.toUTCString()}</pubDate></item>`;
  }).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/"><channel><title>${escapeXml(siteConfig.name)}</title><link>${escapeXml(siteConfig.url.toString())}</link><description>${escapeXml(siteConfig.description)}</description><language>${escapeXml(locale)}</language><atom:link href="${escapeXml(channelUrl)}" rel="self" type="application/rss+xml"/>${items}</channel></rss>`;
  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
