import { siteConfig } from "@/shared/config/site";

export function GET() {
  const content = `# Picoo\n\n> ${siteConfig.description}\n\nPicoo is a creator-first catalog of reusable AI creations. Native creations include Agent, Workflow, Prompt, Tool, and Article. Remix relationships preserve provenance. Aggregated RSS entries identify and link to their original source.\n\n## Main sections\n- /explore: curated creations\n- /agents: reusable AI agents\n- /workflows: automation workflows\n- /prompts: prompt assets\n- /deals: verified AI resources and offers\n`;
  return new Response(content, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" } });
}
