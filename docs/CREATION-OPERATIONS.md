# Creation Operations

Creation 是 Picoo 的核心对象。本文档描述作品的发布流程、状态机、权限与公开路由约定。

## 发布状态机

```
draft ──publish──▶ published ──archive──▶ archived
  ▲                    │
  └────(编辑不改状态)────┘
```

- `draft`：新建后的默认状态，仅作者在 Studio 可见。
- `published`：对所有人公开，出现在 `/explore`、作者主页与首页精选。
- `under_review`：预留状态，供后续人工审核流程使用（当前发布不经过此态）。
- `archived`：已下架，公开页不可见；可重新编辑但不能直接从 `archived` 一步发布（须经领域校验）。

领域不变式由 `Creation.publish()` / `Creation.archive()` 强制：重复发布、发布归档作品都会抛错。

## Slug 规则

- 发布 URL 为 `/creation/[slug]`，`slug` 全局唯一。
- 由 `slugify(title, shortSuffix(id))` 生成：标题转 kebab-case + UUID 前 8 位十六进制后缀，避免重名冲突。
- 保留非 ASCII 字符（中文标题直接保留），仅清洗空白与符号。

## 权限矩阵

| 操作 | 权限 | 附加校验 |
| --- | --- | --- |
| 创建/发布 Creation | `creation:publish` | —— |
| 编辑/下架/删除 | `creation:update:own` | `authorId === user.id`（越权抛 `FORBIDDEN`） |
| 浏览公开作品 | 无（含 guest） | 仅 `status = published` |

`creation:publish` 仅授予 `creator` / `admin` / `super_admin`。**普通 `member` 必须先通过 `/studio/verification` 认证获得 `creator` 角色**才能发布——访问 `/studio/creations` 会被守卫导向 `/forbidden`。

## 公开路由

| 路由 | 说明 |
| --- | --- |
| `/explore` | 已发布作品列表，支持 `?type=&tag=&sort=trending\|latest` |
| `/creation/[slug]` | 作品详情，含 `generateMetadata` SEO 与浏览量自增 |
| `/creator/[handle]` | 创作者主页，展示其已发布作品与认证徽章 |

## Studio 管理路由

| 路由 | 说明 |
| --- | --- |
| `/studio/creations` | 作品列表（全部状态），行内发布/下架/删除 |
| `/studio/creations/new` | 新建（保存为草稿） |
| `/studio/creations/[id]/edit` | 编辑与发布管理，含归属校验 |

## 审计

所有写操作在成功路径写审计日志：`creation.create` / `creation.update` / `creation.publish` / `creation.archive` / `creation.delete`，`resourceType = creation`，`resourceId = creation.id`。

## SEO

- 详情页与创作者页实现 `generateMetadata`（title / description / OpenGraph）。
- 浏览量在详情页服务端渲染时通过 `incrementView` 自增。

## 数据迁移注意

`0001` 迁移为 `creations` 增加了 `slug NOT NULL`（无默认值）。若表中已存在历史数据，需在应用迁移前 backfill `slug`（可用 `id` 前缀临时填充），否则迁移会失败。全新环境不受影响。

## 渲染与容错

- 首页 `/` 展示实时策展数据，声明 `export const dynamic = "force-dynamic"`，不在构建期静态化（否则 `next build` 会在预渲染时连库失败）。
- 首页查询用 `safely()` 包裹：DB 不可达或异常时返回空数组，降级到占位内容而非 500，保证首屏可用。
- `/explore` 依赖 `searchParams`、`/creation/[slug]` 与 `/creator/[handle]` 为动态段且无 `generateStaticParams`，均按需服务端渲染，不受构建期取数影响。
