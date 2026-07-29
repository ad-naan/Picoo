import type { CreationCardData } from "@/components/site/creation-card";
import type { Locale } from "@/i18n/config";

const shared = { authorHandle: "picoo", authorHref: "/explore", likes: "精选", comments: 0 } as const;

const starterCatalog: Record<Locale, CreationCardData[]> = {
  "zh-CN": [
    { ...shared, slug: "starter-research-agent", href: "/studio/creations/new?template=research-agent", type: "agent", title: "深度研究 Agent", description: "从问题拆解、资料检索到引用核验，生成结构化研究报告。" },
    { ...shared, slug: "starter-content-workflow", href: "/studio/creations/new?template=content-workflow", type: "workflow", title: "全平台内容工作流", description: "一个选题自动生成公众号、小红书、短视频三种内容版本。" },
    { ...shared, slug: "starter-product-photo", href: "/studio/creations/new?template=product-photo", type: "prompt", title: "商业产品摄影 Prompt", description: "用可复用的灯光、镜头和材质参数生成高级产品视觉。" },
    { ...shared, slug: "starter-rag-kit", href: "/studio/creations/new?template=rag-kit", type: "tool", title: "个人知识库 RAG Kit", description: "适合团队文档与个人资料库的轻量检索增强模板。" },
    { ...shared, slug: "starter-video-agent", href: "/studio/creations/new?template=video-agent", type: "agent", title: "长视频切片 Agent", description: "识别高光片段，自动生成标题、字幕和多平台比例。" },
    { ...shared, slug: "starter-n8n", href: "/studio/creations/new?template=n8n-daily", type: "workflow", title: "AI 日报自动发布", description: "聚合 RSS、提炼重点并定时推送到飞书和社交渠道。" },
    { ...shared, slug: "starter-ui-prompt", href: "/studio/creations/new?template=ui-prompt", type: "prompt", title: "企业级 UI 设计提示词", description: "从信息架构到视觉规范，生成可实施的产品界面方案。" },
    { ...shared, slug: "starter-agent-guide", href: "/studio/creations/new?template=agent-guide", type: "article", title: "Agent 从原型到上线", description: "梳理评测、权限、可观测性与成本控制的完整实践。" },
  ],
  en: [
    { ...shared, slug: "starter-research-agent", href: "/studio/creations/new?template=research-agent", type: "agent", title: "Deep Research Agent", description: "Break down questions, search sources, verify citations, and deliver structured reports." },
    { ...shared, slug: "starter-content-workflow", href: "/studio/creations/new?template=content-workflow", type: "workflow", title: "Omnichannel Content Workflow", description: "Turn one idea into newsletter, social post, and short-video versions." },
    { ...shared, slug: "starter-product-photo", href: "/studio/creations/new?template=product-photo", type: "prompt", title: "Commercial Product Photography", description: "Reusable lighting, lens, and material parameters for premium product visuals." },
    { ...shared, slug: "starter-rag-kit", href: "/studio/creations/new?template=rag-kit", type: "tool", title: "Personal Knowledge RAG Kit", description: "A lightweight retrieval template for team documents and personal libraries." },
    { ...shared, slug: "starter-video-agent", href: "/studio/creations/new?template=video-agent", type: "agent", title: "Long-form Video Clipper", description: "Find highlights and generate titles, captions, and social-ready aspect ratios." },
    { ...shared, slug: "starter-n8n", href: "/studio/creations/new?template=n8n-daily", type: "workflow", title: "AI Daily Publisher", description: "Aggregate RSS, summarize key updates, and deliver them to connected channels." },
    { ...shared, slug: "starter-ui-prompt", href: "/studio/creations/new?template=ui-prompt", type: "prompt", title: "Enterprise UI Design Prompt", description: "Generate implementable product interfaces from structure through visual system." },
    { ...shared, slug: "starter-agent-guide", href: "/studio/creations/new?template=agent-guide", type: "article", title: "Agent: Prototype to Production", description: "A practical guide to evaluation, permissions, observability, and cost control." },
  ],
};

export function getStarterCreations(locale: Locale) {
  return starterCatalog[locale];
}
