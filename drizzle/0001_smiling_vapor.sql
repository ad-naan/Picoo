CREATE TYPE "public"."creation_status" AS ENUM('draft', 'published', 'under_review', 'archived');--> statement-breakpoint
ALTER TABLE "creations" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "creations" ADD COLUMN "status" "creation_status" DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "creations" ADD COLUMN "content" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "creations" ADD COLUMN "tags" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "creations" ADD COLUMN "compatible_models" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "creations" ADD COLUMN "published_at" timestamp with time zone;--> statement-breakpoint
CREATE UNIQUE INDEX "creations_slug_unique" ON "creations" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "creations_author_idx" ON "creations" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "creations_status_idx" ON "creations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "creations_type_idx" ON "creations" USING btree ("type");