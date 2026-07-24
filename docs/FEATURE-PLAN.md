# Picoo 功能与领域规划

版本：0.1  
目标：把 Picoo 从传统技术论坛演进为“AI 创作者灵感社区 + AI 资产市场”，同时保留可迁移的用户关系、历史内容和社区信誉。

## 1. 设计原则

1. 核心对象是 `Creation`，不是论坛 `Post`。讨论是 Creation 的附属互动。
2. 用户角色、账号状态、创作者身份和认证徽章分开建模。
3. 原生内容、RSS 聚合内容和商业资源必须保留明确来源及 canonical。
4. 管理后台通过权限和审计日志驱动，不在页面中硬编码管理员判断。
5. 所有界面文案使用稳定消息键；增加语言不在组件中增加语言条件分支。
6. SEO/GEO、事件追踪、审核和安全能力从第一版保留扩展位。

## 2. DDD 限界上下文

| 上下文 | 核心职责 | 主要聚合/实体 |
| --- | --- | --- |
| Identity & Access | 登录、会话、授权、账号安全 | UserAccount, Session, RoleAssignment, ApiToken |
| Creator | 创作者资料、认证、能力标签、数据面板 | CreatorProfile, VerificationApplication |
| Creation | Agent、Workflow、Prompt、Tool、Article | Creation, CreationVersion, RemixRelation |
| Social | 关注、点赞、评论、通知 | Follow, Reaction, CommentThread, Notification |
| Library | 收藏夹、使用记录、浏览历史 | Collection, CollectionItem, UsageRecord |
| Syndication | RSS 输入、外部内容、向外分发 | FeedSubscription, SyndicatedItem, DeliveryTarget |
| Discovery | 搜索、榜单、推荐、首页策展 | SearchDocument, RankingSnapshot, FeaturedSlot |
| Moderation | 举报、审核、处罚、申诉 | Report, ModerationCase, Enforcement, Appeal |
| Platform | 功能开关、站点设置、集成、任务状态 | FeatureFlag, PlatformSetting, Integration, JobRun |
| Commerce（后期） | 定价、订单、授权、结算 | Product, Price, Order, License, Payout |

上下文之间通过应用服务和领域事件协作，禁止页面组件直接跨表编排业务。

## 3. 身份、角色与认证模型

### 3.1 平台角色

角色表示“被授予的系统权限”，支持一个用户拥有多个角色：

- `member`：基础社区用户。
- `creator`：可以发布和维护 Creation。
- `curator`：可以维护专题、榜单和首页推荐候选。
- `moderator`：可以处理举报、内容和评论。
- `admin`：可以管理用户、内容、配置和运营模块。
- `super_admin`：可以管理管理员授权、敏感集成和安全配置。

`guest` 不是持久化角色，而是未登录访问上下文。

### 3.2 账号状态

- `pending`：邮箱或手机号未验证。
- `active`：正常使用。
- `restricted`：部分能力受限，例如禁止评论或发布。
- `suspended`：临时封禁，保留登录申诉能力。
- `banned`：永久封禁。
- `deleted`：完成匿名化后的逻辑删除状态。

### 3.3 创作者类型

- `individual`：个人创作者。
- `team`：创作团队。
- `organization`：公司、开源组织或品牌。

### 3.4 认证状态与徽章

认证不是角色。`VerificationApplication` 使用以下状态：

- `draft` → `submitted` → `under_review` → `approved/rejected`
- 已认证后可进入 `revoked` 或 `expired`

徽章独立配置，例如：

- 已验证创作者
- 官方组织
- 开源维护者
- 优质教程作者
- Picoo 精选

一个创作者可拥有多个带有效期的徽章。所有审批、撤销和备注进入审计日志。

## 4. 权限模型

采用 RBAC + 资源所有权检查：

| 能力 | Member | Creator | Curator | Moderator | Admin | Super Admin |
| --- | --- | --- | --- | --- | --- | --- |
| 浏览/收藏/点赞 | 是 | 是 | 是 | 是 | 是 | 是 |
| 评论/关注 | 是 | 是 | 是 | 是 | 是 | 是 |
| 发布 Creation | 申请开放 | 是 | 是 | 是 | 是 | 是 |
| 修改自己的 Creation | 否 | 是 | 是 | 是 | 是 | 是 |
| Remix | 是 | 是 | 是 | 是 | 是 | 是 |
| 首页策展 | 否 | 否 | 是 | 否 | 是 | 是 |
| 内容审核 | 否 | 否 | 否 | 是 | 是 | 是 |
| 用户与认证管理 | 否 | 否 | 否 | 否 | 是 | 是 |
| 管理员授权 | 否 | 否 | 否 | 否 | 否 | 是 |
| 敏感配置/密钥引用 | 否 | 否 | 否 | 否 | 只读 | 是 |

权限使用 `resource:action` 命名，例如 `creation:publish`、`verification:review`、`platform:configure`。禁止仅用 `role === admin` 控制页面和 API。

## 5. 登录与账号安全

第一阶段建议采用 Auth.js：

- 邮箱 + 密码登录，密码使用 Argon2id。
- 邮箱验证、重置密码、登录失败限流。
- GitHub 和 Google OAuth。
- PostgreSQL 持久化用户、账号和会话；Redis 保存限流、短期验证码和撤销缓存。
- 管理员强制启用 TOTP MFA；普通用户可选。
- 登录设备列表、撤销其他会话、安全事件通知。
- CSRF、SameSite Cookie、可信代理和回调地址白名单。

后期增加 Passkey、企业 SSO、账号合并和组织成员邀请。

## 6. 个人中心

路由建议：`/settings/*`，面向账号所有者。

### 6.1 概览

- 头像、昵称、Handle、简介完成度。
- 收藏、关注、Remix、发布数量。
- 最近浏览、最近使用和草稿。
- 安全提醒、认证进度和待办事项。

### 6.2 资料设置

- 头像、封面、昵称、唯一 Handle、简介、地区、时区、语言。
- 技能标签、常用模型、Framework、社交链接。
- 公开资料预览和 SEO slug。

### 6.3 账号与安全

- 邮箱、密码、OAuth 绑定、MFA、设备与会话。
- 数据导出、账号停用和删除申请。
- API Token 管理：名称、scope、到期时间、最后使用时间。

### 6.4 通知与隐私

- 站内、邮件、Webhook 通知偏好。
- 点赞、评论、关注、Remix、系统公告分别配置。
- 公开收藏、关注列表、在线状态和推荐个性化开关。

### 6.5 内容与订阅

- 我的收藏夹、浏览历史、使用记录。
- 外部 RSS 订阅、抓取状态和失败提示。
- 向外发布渠道：个人 RSS、Webhook、Newsletter、社交平台连接。

## 7. Creator Studio

路由建议：`/studio/*`，面向 Creator。

- Dashboard：浏览、收藏、使用、Remix、转化趋势。
- Creations：已发布、草稿、审核中、已下架。
- Versions：版本说明、文件、兼容模型、回滚。
- Remix Graph：来源、下游 Remix 和贡献关系。
- Analytics：来源渠道、搜索词、收藏夹进入、Try/Download 使用。
- Audience：关注者增长和受众兴趣，不泄露个人敏感信息。
- Verification：认证申请、资料补交、审批记录。
- Distribution：RSS 输出、Webhook、Newsletter 和社交分发。
- Team（第二阶段）：成员、角色、共同维护和组织主页。
- Monetization（第三阶段）：商品、授权、订单和结算。

## 8. 管理后台

路由建议：`/admin/*`，所有页面和 Server Action 进行权限复核。

### 8.1 Dashboard

- DAU/WAU、注册转化、发布、收藏、Remix、使用次数。
- 举报积压、RSS 抓取失败、任务队列、搜索健康度。
- 指标异常提示和运营事件时间线。

### 8.2 用户管理

- 搜索、筛选、用户详情、角色分配、账号状态。
- 限制、封禁、恢复、会话撤销、数据导出请求。
- 风险事件、登录历史和管理员操作记录。

### 8.3 创作者与认证

- 认证申请队列、资料核验、补充材料、审批和撤销。
- Creator/团队/组织资料管理。
- 徽章、推荐权重、创作者等级和权益配置。

### 8.4 内容与审核

- Creation、评论、资源和举报统一工作台。
- 审核原因码、批量操作、申诉和处罚梯度。
- 敏感词、链接域名、文件类型和安全扫描策略。

### 8.5 发现与运营

- 首页栏目、Banner、精选位、专题和榜单。
- 标签、分类、模型、Framework、工具和兼容性词典。
- 活动、挑战赛、福利资源和过期提醒。

### 8.6 RSS 与分发

- 外部 Feed 来源、抓取频率、ETag、失败重试和可信级别。
- 去重、来源归属、内容映射和人工审核策略。
- 对外 RSS、Webhook、Newsletter、社交平台连接器。
- 投递记录、签名、退避重试和死信队列。

### 8.7 高级平台配置

- 功能开关：注册、发布、Remix、评论、Marketplace、AI 推荐。
- 配额与限流：按角色、接口、IP 和 Token 设置。
- 上传配置：文件类型、大小、存储桶和 CDN 域名。
- SEO/GEO：站点信息、默认 metadata、结构化数据、索引策略、llms.txt。
- 邮件、通知模板和多语言版本。
- OAuth、对象存储、搜索、邮件和 AI Provider 集成状态。
- 后台任务、队列、定时器和缓存失效。
- 审计日志、配置版本、差异对比和回滚。

敏感密钥只保存 Secret Manager 引用或加密值，列表页永不返回完整密钥。

## 9. 数据模型演进

第一阶段新增：

- `accounts`, `sessions`, `verification_tokens`
- `user_profiles`, `user_roles`, `permissions`, `role_permissions`
- `security_events`, `audit_logs`
- `creator_profiles`, `verification_applications`, `creator_badges`
- `platform_settings`, `feature_flags`
- `feed_subscriptions`, `syndicated_items`, `delivery_targets`, `delivery_attempts`

现有 `users.role` 单枚举在迁移后废弃，改为 `user_roles` 多对多关系。所有表使用 UUID、UTC 时间和必要的唯一索引。

`creations` 表在 `0001` 迁移中扩展了发布所需字段：`slug`（唯一，公开 URL）、`status`（`draft/published/under_review/archived`）、`content`、`tags`、`compatible_models`、`published_at`，并新增 slug 唯一索引与 author/status/type 索引。详见 `CREATION-OPERATIONS.md`。

## 10. 页面与路由结构

```text
/(public)
  /explore
  /creation/[slug]
  /creator/[handle]
  /collections/[slug]
  /deals

/(auth)
  /sign-in
  /sign-up
  /verify-email
  /forgot-password

/(account)/settings
  /profile
  /security
  /notifications
  /privacy
  /connections
  /subscriptions

/(creator)/studio
  /creations
  /analytics
  /remixes
  /verification
  /distribution

/(admin)/admin
  /users
  /creators
  /verifications
  /moderation
  /discovery
  /syndication
  /settings
  /audit
```

路由分组仅组织代码，不改变公开 URL。每个区域使用独立 Layout、导航和权限守卫。

## 11. 实施阶段

### Phase A：身份与权限基础

- Auth.js、账号表、会话、邮箱验证。
- 多角色 RBAC、资源所有权检查、审计日志。
- 登录/注册/找回密码和基础设置页。
- 管理员路由守卫及最小用户列表。

验收：未授权访问 API 和页面均被拒绝；角色变化可立即撤销权限；管理员操作可追溯。

### Phase B：个人中心与 Creator Studio

- 资料、安全、通知、隐私和连接设置。
- Creator Profile、作品管理、基础 Analytics。
- 认证申请与管理员审批闭环。

验收：用户可完成账号生命周期；创作者可提交认证；管理员可审批、驳回和撤销。

> 进度：Creation 发布/管理闭环已落地——`/studio/creations` 作品管理（草稿/发布/下架/删除）、公开 `/explore`、`/creation/[slug]`、`/creator/[handle]`，首页接入真实数据。发布状态机与权限见 `CREATION-OPERATIONS.md`。资料/安全设置与基础 Analytics 仍在推进。

### Phase C：管理员高级模块

- 内容审核、首页运营、标签词典。
- RSS 来源、抓取任务、分发渠道和投递日志。
- 功能开关、限流、集成状态和配置审计。

验收：关键运营能力无需改代码；配置可回滚；外部抓取和分发失败可定位。

### Phase D：增长与商业化

- 推荐、在线 Demo、团队空间。
- Marketplace、订单、授权和结算。
- 组织认证、企业 SSO 和高级分析。

## 12. 第一批建议实施范围

建议下一批只做以下纵向闭环：

1. 身份领域和数据库迁移。
2. Auth.js 邮箱密码 + GitHub OAuth。
3. `member/creator/admin/super_admin` 初始权限集。
4. `/settings/profile` 与 `/settings/security`。
5. `/studio/verification` 认证申请。
6. `/admin/users` 与 `/admin/verifications`。
7. 审计日志和 Redis 限流。

这批完成后，用户注册、申请成为创作者、提交认证、管理员审批、权限生效形成完整闭环，再扩展内容审核和平台配置。

## 13. 待确认决策

实施身份系统前需要确认：

1. 首发登录方式是否采用“邮箱密码 + GitHub”，Google 放到第二批。
2. 普通 Member 是否可以直接发布，还是必须先申请成为 Creator。
3. 认证材料是否需要真实姓名/证件；若需要，必须单独设计敏感数据存储与保留策略。
4. 管理后台第一批是否只对 `super_admin` 开放授权入口。
5. 是否需要迁移传统论坛账号和历史信誉；若需要，应先定义旧数据映射规则。
