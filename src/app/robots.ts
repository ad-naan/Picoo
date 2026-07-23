import type { MetadataRoute } from "next";
import { siteConfig } from "@/shared/config/site";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/studio/", "/api/"] }, sitemap: new URL("/sitemap.xml", siteConfig.url).href, host: siteConfig.url.href };
}
