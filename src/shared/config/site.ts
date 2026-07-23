const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const siteConfig = {
  name: "Picoo",
  title: "Picoo - AI 创作者的灵感社区与资产市场",
  description: "发现、收藏、复用和 Remix 有趣的 Agent、Workflow、Prompt 与 AI 创作。",
  url: new URL(configuredUrl),
  locale: "zh_CN",
  keywords: ["AI 创作", "AI Agent", "Workflow", "Prompt", "Remix", "AI assets"],
} as const;
