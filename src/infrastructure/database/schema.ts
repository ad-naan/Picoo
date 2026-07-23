import { integer, pgEnum, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const creationType = pgEnum("creation_type", ["agent", "workflow", "prompt", "tool", "article"]);
export const userRole = pgEnum("user_role", ["guest", "member", "creator", "curator", "moderator", "admin"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  handle: text("handle").notNull().unique(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  role: userRole("role").notNull().default("member"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const creations = pgTable("creations", {
  id: uuid("id").primaryKey().defaultRandom(),
  authorId: uuid("author_id").notNull().references(() => users.id),
  type: creationType("type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  coverUrl: text("cover_url"),
  remixedFromId: uuid("remixed_from_id"),
  likes: integer("likes").notNull().default(0),
  views: integer("views").notNull().default(0),
  forks: integer("forks").notNull().default(0),
  favorites: integer("favorites").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const favorites = pgTable("favorites", {
  userId: uuid("user_id").notNull().references(() => users.id),
  creationId: uuid("creation_id").notNull().references(() => creations.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [primaryKey({ columns: [table.userId, table.creationId] })]);
