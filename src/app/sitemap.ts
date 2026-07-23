import type { MetadataRoute } from "next";
import { siteConfig } from "@/shared/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "explore", "agents", "workflows", "prompts", "tools", "deals"];
  return pages.map((page) => ({ url: new URL(page, siteConfig.url).href, lastModified: new Date(), changeFrequency: page ? "daily" : "hourly", priority: page ? 0.8 : 1 }));
}
