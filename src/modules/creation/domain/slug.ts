// Slug 生成：标题转 kebab-case，附加短随机后缀防重。
// 保留中文等非 ASCII 字符（转拼音超出本阶段范围），仅做安全清洗。
const MAX_BASE_LENGTH = 60;

export function slugify(title: string, suffix: string): string {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_BASE_LENGTH);
  const cleanBase = base || "creation";
  return `${cleanBase}-${suffix}`;
}

// 从 UUID 或随机源派生一个短后缀（取前 8 位十六进制）。
export function shortSuffix(seed: string): string {
  return seed.replace(/-/g, "").slice(0, 8);
}
