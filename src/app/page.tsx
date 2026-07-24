import { queryFeaturedCards, queryTopCreators, type TopCreator } from "@/infrastructure/creation/creation-queries";
import type { CreationCardData } from "@/components/site/creation-card";
import { HomeView } from "./home-view";

// 数据库暂无发布作品时的占位内容，保证首页不空白。真实数据一旦出现即接管。
const SAMPLE_CREATIONS: CreationCardData[] = [
  { slug: "sample-xhs-workflow", title: "小红书爆款笔记生成工作流", description: "从选题、文案、配图到发布，一键生成爆款内容笔记！", type: "workflow", authorHandle: "luna", likes: "1.2k", comments: 342 },
  { slug: "sample-discord-agent", title: "Discord 智能社区助手", description: "自动欢迎新成员、答疑、管理，内置总结，让你的社区更活跃！", type: "agent", authorHandle: "jacky", likes: "2.1k", comments: 563 },
  { slug: "sample-kb-workflow", title: "AI 知识库自动整理工作流", description: "自动抓取、整理和归档各种资料，构建随身的专属知识库。", type: "workflow", authorHandle: "echo", likes: "987", comments: 201 },
  { slug: "sample-mj-prompts", title: "Midjourney 风格提示词合集", description: "50+ 精选提示词，帮你轻松生成惊艳的 AI 艺术作品。", type: "prompt", authorHandle: "mike", likes: "1.6k", comments: 412 },
];

const SAMPLE_CREATORS: TopCreator[] = [
  { handle: "luna", specialty: "创意插画", followers: "2.4k" }, { handle: "jacky", specialty: "Agent 构建", followers: "1.8k" },
  { handle: "echo", specialty: "自动化专家", followers: "1.6k" }, { handle: "mike", specialty: "AI 艺术", followers: "1.2k" },
  { handle: "zoe", specialty: "提示工程", followers: "987" },
];

// 首页展示实时策展数据，不做构建期静态化；DB 不可达时降级到占位内容。
export const dynamic = "force-dynamic";

// DB 未就绪或查询异常时不让首页崩溃，返回空数组以触发占位数据。
async function safely<T>(query: Promise<T[]>): Promise<T[]> {
  try {
    return await query;
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [featured, topCreators] = await Promise.all([
    safely(queryFeaturedCards(4)),
    safely(queryTopCreators(5)),
  ]);
  const creations = featured.length > 0 ? featured : SAMPLE_CREATIONS;
  const creators = topCreators.length > 0 ? topCreators : SAMPLE_CREATORS;
  return <HomeView creations={creations} creators={creators} />;
}
