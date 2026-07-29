import {
  boolean, index, integer, jsonb, pgEnum, pgTable, primaryKey, text, timestamp,
  uniqueIndex, uuid,
} from "drizzle-orm/pg-core";

export const creationType = pgEnum("creation_type", ["agent", "workflow", "prompt", "tool", "article"]);
export const creationStatus = pgEnum("creation_status", ["draft", "published", "under_review", "archived"]);
export const accountStatus = pgEnum("account_status", ["pending", "active", "restricted", "suspended", "banned", "deleted"]);
export const platformRole = pgEnum("platform_role", ["member", "creator", "curator", "moderator", "admin", "super_admin"]);
export const creatorType = pgEnum("creator_type", ["individual", "team", "organization"]);
export const verificationStatus = pgEnum("verification_status", ["draft", "submitted", "under_review", "approved", "rejected", "revoked", "expired"]);
export const auditOutcome = pgEnum("audit_outcome", ["success", "denied", "failed"]);
export const commentStatus = pgEnum("comment_status", ["active", "hidden", "deleted"]);
export const collectionVisibility = pgEnum("collection_visibility", ["private", "unlisted", "public"]);
export const feedStatus = pgEnum("feed_status", ["active", "paused", "failing"]);
export const deliveryChannel = pgEnum("delivery_channel", ["rss", "webhook", "newsletter", "social"]);
export const deliveryStatus = pgEnum("delivery_status", ["pending", "succeeded", "failed"]);
export const translationStatus = pgEnum("translation_status", ["draft", "machine", "reviewed", "published"]);
export const translationJobStatus = pgEnum("translation_job_status", ["queued", "running", "succeeded", "failed"]);
export const badgeRarity = pgEnum("badge_rarity", ["common", "uncommon", "rare", "epic", "legendary", "mythic", "one_of_one"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  image: text("image"),
  handle: text("handle"),
  passwordHash: text("password_hash"),
  status: accountStatus("status").notNull().default("pending"),
  locale: text("locale").notNull().default("zh-CN"),
  timezone: text("timezone").notNull().default("Asia/Shanghai"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("users_email_unique").on(table.email),
  uniqueIndex("users_handle_unique").on(table.handle),
  index("users_status_idx").on(table.status),
]);

export const accounts = pgTable("accounts", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (table) => [primaryKey({ columns: [table.provider, table.providerAccountId] })]);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
}, (table) => [index("sessions_user_id_idx").on(table.userId)]);

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
}, (table) => [primaryKey({ columns: [table.identifier, table.token] })]);

export const authenticators = pgTable("authenticators", {
  credentialID: text("credential_id").notNull().unique(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  providerAccountId: text("provider_account_id").notNull(),
  credentialPublicKey: text("credential_public_key").notNull(),
  counter: integer("counter").notNull(),
  credentialDeviceType: text("credential_device_type").notNull(),
  credentialBackedUp: boolean("credential_backed_up").notNull(),
  transports: text("transports"),
}, (table) => [primaryKey({ columns: [table.userId, table.credentialID] })]);

export const userRoles = pgTable("user_roles", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: platformRole("role").notNull(),
  grantedBy: uuid("granted_by").references(() => users.id, { onDelete: "set null" }),
  grantedAt: timestamp("granted_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
}, (table) => [
  primaryKey({ columns: [table.userId, table.role] }),
  index("user_roles_role_idx").on(table.role),
]);

export const userProfiles = pgTable("user_profiles", {
  userId: uuid("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  bio: text("bio"),
  coverUrl: text("cover_url"),
  region: text("region"),
  websiteUrl: text("website_url"),
  socialLinks: jsonb("social_links").$type<Record<string, string>>().notNull().default({}),
  skills: jsonb("skills").$type<string[]>().notNull().default([]),
  preferredModels: jsonb("preferred_models").$type<string[]>().notNull().default([]),
  profileVisibility: text("profile_visibility").notNull().default("public"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const creatorProfiles = pgTable("creator_profiles", {
  userId: uuid("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  type: creatorType("type").notNull().default("individual"),
  displayTitle: text("display_title"),
  specialties: jsonb("specialties").$type<string[]>().notNull().default([]),
  acceptingCollaboration: boolean("accepting_collaboration").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const badges = pgTable("badges", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull(),
  rarity: badgeRarity("rarity").notNull().default("common"),
  artworkUrl: text("artwork_url"),
  thumbnailUrl: text("thumbnail_url"),
  visualConfig: jsonb("visual_config").$type<Record<string, unknown>>().notNull().default({}),
  maxSupply: integer("max_supply"),
  active: boolean("active").notNull().default(true),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex("badges_key_unique").on(table.key), index("badges_rarity_idx").on(table.rarity)]);

export const badgeTranslations = pgTable("badge_translations", {
  badgeId: uuid("badge_id").notNull().references(() => badges.id, { onDelete: "cascade" }),
  locale: text("locale").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  unlockHint: text("unlock_hint").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [primaryKey({ columns: [table.badgeId, table.locale] }), index("badge_translations_locale_idx").on(table.locale)]);

export const userBadges = pgTable("user_badges", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  badgeId: uuid("badge_id").notNull().references(() => badges.id, { onDelete: "cascade" }),
  serialNumber: integer("serial_number").notNull(),
  awardedBy: uuid("awarded_by").references(() => users.id, { onDelete: "set null" }),
  awardReason: text("award_reason"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  showcased: boolean("showcased").notNull().default(false),
  displayOrder: integer("display_order").notNull().default(0),
  awardedAt: timestamp("awarded_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("user_badges_user_badge_unique").on(table.userId, table.badgeId),
  uniqueIndex("user_badges_badge_serial_unique").on(table.badgeId, table.serialNumber),
  index("user_badges_user_showcase_idx").on(table.userId, table.showcased, table.displayOrder),
]);

export const badgeQuests = pgTable("badge_quests", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull(),
  eventType: text("event_type").notNull(),
  rules: jsonb("rules").$type<Record<string, unknown>>().notNull().default({}),
  rewardBadgeId: uuid("reward_badge_id").notNull().references(() => badges.id, { onDelete: "cascade" }),
  active: boolean("active").notNull().default(false),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex("badge_quests_key_unique").on(table.key), index("badge_quests_active_idx").on(table.active)]);

export const badgeQuestTranslations = pgTable("badge_quest_translations", {
  questId: uuid("quest_id").notNull().references(() => badgeQuests.id, { onDelete: "cascade" }),
  locale: text("locale").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
}, (table) => [primaryKey({ columns: [table.questId, table.locale] })]);

export const badgeQuestProgress = pgTable("badge_quest_progress", {
  questId: uuid("quest_id").notNull().references(() => badgeQuests.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  progress: jsonb("progress").$type<Record<string, number>>().notNull().default({}),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  claimedAt: timestamp("claimed_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [primaryKey({ columns: [table.questId, table.userId] }), index("badge_quest_progress_user_idx").on(table.userId)]);

export const verificationApplications = pgTable("verification_applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: verificationStatus("status").notNull().default("draft"),
  statement: text("statement").notNull().default(""),
  evidenceLinks: jsonb("evidence_links").$type<string[]>().notNull().default([]),
  reviewerId: uuid("reviewer_id").references(() => users.id, { onDelete: "set null" }),
  reviewNote: text("review_note"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("verification_applications_user_idx").on(table.userId),
  index("verification_applications_status_idx").on(table.status),
]);

export const creations = pgTable("creations", {
  id: uuid("id").primaryKey().defaultRandom(),
  authorId: uuid("author_id").notNull().references(() => users.id),
  type: creationType("type").notNull(),
  slug: text("slug").notNull(),
  status: creationStatus("status").notNull().default("draft"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull().default(""),
  sourceLocale: text("source_locale").notNull().default("zh-CN"),
  coverUrl: text("cover_url"),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  compatibleModels: jsonb("compatible_models").$type<string[]>().notNull().default([]),
  remixedFromId: uuid("remixed_from_id"),
  likes: integer("likes").notNull().default(0),
  views: integer("views").notNull().default(0),
  forks: integer("forks").notNull().default(0),
  favorites: integer("favorites").notNull().default(0),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("creations_slug_unique").on(table.slug),
  index("creations_author_idx").on(table.authorId),
  index("creations_status_idx").on(table.status),
  index("creations_type_idx").on(table.type),
]);

export const creationTranslations = pgTable("creation_translations", {
  creationId: uuid("creation_id").notNull().references(() => creations.id, { onDelete: "cascade" }),
  locale: text("locale").notNull(),
  localizedSlug: text("localized_slug").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull().default(""),
  status: translationStatus("status").notNull().default("draft"),
  translatedBy: uuid("translated_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.creationId, table.locale] }),
  uniqueIndex("creation_translations_locale_slug_unique").on(table.locale, table.localizedSlug),
  index("creation_translations_locale_status_idx").on(table.locale, table.status),
]);

export const favorites = pgTable("favorites", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  creationId: uuid("creation_id").notNull().references(() => creations.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [primaryKey({ columns: [table.userId, table.creationId] })]);

export const creationLikes = pgTable("creation_likes", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  creationId: uuid("creation_id").notNull().references(() => creations.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.userId, table.creationId] }),
  index("creation_likes_creation_idx").on(table.creationId),
]);

export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  creationId: uuid("creation_id").notNull().references(() => creations.id, { onDelete: "cascade" }),
  authorId: uuid("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  parentId: uuid("parent_id"),
  content: text("content").notNull(),
  status: commentStatus("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("comments_creation_idx").on(table.creationId, table.createdAt),
  index("comments_author_idx").on(table.authorId),
]);

export const follows = pgTable("follows", {
  followerId: uuid("follower_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  followingId: uuid("following_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.followerId, table.followingId] }),
  index("follows_following_idx").on(table.followingId),
]);

export const collections = pgTable("collections", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  visibility: collectionVisibility("visibility").notNull().default("private"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("collections_owner_slug_unique").on(table.ownerId, table.slug),
  index("collections_owner_idx").on(table.ownerId),
]);

export const collectionItems = pgTable("collection_items", {
  collectionId: uuid("collection_id").notNull().references(() => collections.id, { onDelete: "cascade" }),
  creationId: uuid("creation_id").notNull().references(() => creations.id, { onDelete: "cascade" }),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.collectionId, table.creationId] }),
  index("collection_items_creation_idx").on(table.creationId),
]);

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  recipientId: uuid("recipient_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  actorId: uuid("actor_id").references(() => users.id, { onDelete: "set null" }),
  type: text("type").notNull(),
  entityType: text("entity_type"),
  entityId: text("entity_id"),
  data: jsonb("data").$type<Record<string, unknown>>().notNull().default({}),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("notifications_recipient_idx").on(table.recipientId, table.createdAt),
]);

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorId: uuid("actor_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  resourceType: text("resource_type").notNull(),
  resourceId: text("resource_id"),
  outcome: auditOutcome("outcome").notNull().default("success"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("audit_logs_actor_idx").on(table.actorId),
  index("audit_logs_action_idx").on(table.action),
  index("audit_logs_created_at_idx").on(table.createdAt),
]);

export const featureFlags = pgTable("feature_flags", {
  key: text("key").primaryKey(),
  enabled: boolean("enabled").notNull().default(false),
  description: text("description"),
  rules: jsonb("rules").$type<Record<string, unknown>>().notNull().default({}),
  updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const platformSettings = pgTable("platform_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").$type<unknown>().notNull(),
  category: text("category").notNull(),
  isSensitive: boolean("is_sensitive").notNull().default(false),
  updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const feedSubscriptions = pgTable("feed_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  url: text("url").notNull(),
  title: text("title").notNull(),
  siteUrl: text("site_url"),
  status: feedStatus("status").notNull().default("active"),
  etag: text("etag"),
  lastModified: text("last_modified"),
  lastPolledAt: timestamp("last_polled_at", { withTimezone: true }),
  lastSuccessfulAt: timestamp("last_successful_at", { withTimezone: true }),
  failureCount: integer("failure_count").notNull().default(0),
  lastError: text("last_error"),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("feed_subscriptions_url_unique").on(table.url),
  index("feed_subscriptions_status_idx").on(table.status),
]);

export const syndicatedItems = pgTable("syndicated_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  sourceId: uuid("source_id").notNull().references(() => feedSubscriptions.id, { onDelete: "cascade" }),
  externalId: text("external_id").notNull(),
  canonicalUrl: text("canonical_url").notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull().default(""),
  content: text("content").notNull().default(""),
  sourceLocale: text("source_locale").notNull().default("und"),
  author: text("author"),
  imageUrl: text("image_url"),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull(),
  importedAt: timestamp("imported_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("syndicated_items_source_external_unique").on(table.sourceId, table.externalId),
  index("syndicated_items_source_idx").on(table.sourceId),
  index("syndicated_items_published_idx").on(table.publishedAt),
]);

export const syndicatedItemTranslations = pgTable("syndicated_item_translations", {
  itemId: uuid("item_id").notNull().references(() => syndicatedItems.id, { onDelete: "cascade" }),
  locale: text("locale").notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull().default(""),
  content: text("content").notNull().default(""),
  status: translationStatus("status").notNull().default("machine"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.itemId, table.locale] }),
  index("syndicated_item_translations_locale_idx").on(table.locale, table.status),
]);

export const translationJobs = pgTable("translation_jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  entityType: text("entity_type").notNull(),
  entityId: uuid("entity_id").notNull(),
  sourceLocale: text("source_locale").notNull(),
  targetLocale: text("target_locale").notNull(),
  status: translationJobStatus("status").notNull().default("queued"),
  provider: text("provider"),
  requestedBy: uuid("requested_by").references(() => users.id, { onDelete: "set null" }),
  error: text("error"),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("translation_jobs_entity_idx").on(table.entityType, table.entityId),
  index("translation_jobs_status_idx").on(table.status, table.createdAt),
]);

export const deliveryTargets = pgTable("delivery_targets", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  channel: deliveryChannel("channel").notNull(),
  endpoint: text("endpoint").notNull(),
  enabled: boolean("enabled").notNull().default(false),
  configuration: jsonb("configuration").$type<Record<string, unknown>>().notNull().default({}),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("delivery_targets_channel_idx").on(table.channel)]);

export const deliveryLogs = pgTable("delivery_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  targetId: uuid("target_id").notNull().references(() => deliveryTargets.id, { onDelete: "cascade" }),
  itemId: uuid("item_id").references(() => syndicatedItems.id, { onDelete: "set null" }),
  creationId: uuid("creation_id").references(() => creations.id, { onDelete: "set null" }),
  status: deliveryStatus("status").notNull().default("pending"),
  attempt: integer("attempt").notNull().default(1),
  responseCode: integer("response_code"),
  error: text("error"),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("delivery_logs_target_idx").on(table.targetId, table.createdAt),
  index("delivery_logs_status_idx").on(table.status),
]);
