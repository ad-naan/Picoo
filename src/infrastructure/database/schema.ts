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

export const favorites = pgTable("favorites", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  creationId: uuid("creation_id").notNull().references(() => creations.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [primaryKey({ columns: [table.userId, table.creationId] })]);

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
