import type { Metadata } from "next";
import "./globals.css";
import "./locale.css";
import "./layout-fixes.css";
import "./component-fixes.css";
import { AppProviders } from "@/components/providers/app-providers";
import { siteConfig } from "@/shared/config/site";
import { getRequestLocale } from "@/i18n/server";
import { localeMetadata } from "@/i18n/catalog";

export const metadata: Metadata = {
  metadataBase: siteConfig.url,
  title: { default: siteConfig.title, template: "%s | Picoo" },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  alternates: { canonical: "/", languages: { "zh-CN": "/", en: "/?lang=en" } },
  openGraph: { type: "website", siteName: siteConfig.name, title: siteConfig.title, description: siteConfig.description, url: "/", locale: siteConfig.locale },
  twitter: { card: "summary_large_image", title: siteConfig.title, description: siteConfig.description },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getRequestLocale();
  const localeInfo = localeMetadata[locale];
  const structuredData = {
    "@context": "https://schema.org", "@type": "WebSite", name: siteConfig.name, url: siteConfig.url.href,
    description: siteConfig.description,
    potentialAction: { "@type": "SearchAction", target: `${siteConfig.url.href}search?q={search_term_string}`, "query-input": "required name=search_term_string" },
  };
  return (
    <html lang={localeInfo.htmlLang} dir={localeInfo.direction}>
      <body><AppProviders locale={locale}>{children}</AppProviders><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} /></body>
    </html>
  );
}
