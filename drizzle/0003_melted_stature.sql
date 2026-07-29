CREATE TYPE "public"."delivery_channel" AS ENUM('rss', 'webhook', 'newsletter', 'social');--> statement-breakpoint
CREATE TYPE "public"."delivery_status" AS ENUM('pending', 'succeeded', 'failed');--> statement-breakpoint
CREATE TYPE "public"."feed_status" AS ENUM('active', 'paused', 'failing');--> statement-breakpoint
CREATE TYPE "public"."translation_job_status" AS ENUM('queued', 'running', 'succeeded', 'failed');--> statement-breakpoint
CREATE TYPE "public"."translation_status" AS ENUM('draft', 'machine', 'reviewed', 'published');--> statement-breakpoint
CREATE TABLE "creation_translations" (
	"creation_id" uuid NOT NULL,
	"locale" text NOT NULL,
	"localized_slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"status" "translation_status" DEFAULT 'draft' NOT NULL,
	"translated_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "creation_translations_creation_id_locale_pk" PRIMARY KEY("creation_id","locale")
);
--> statement-breakpoint
CREATE TABLE "delivery_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"target_id" uuid NOT NULL,
	"item_id" uuid,
	"creation_id" uuid,
	"status" "delivery_status" DEFAULT 'pending' NOT NULL,
	"attempt" integer DEFAULT 1 NOT NULL,
	"response_code" integer,
	"error" text,
	"delivered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "delivery_targets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"channel" "delivery_channel" NOT NULL,
	"endpoint" text NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"configuration" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feed_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"title" text NOT NULL,
	"site_url" text,
	"status" "feed_status" DEFAULT 'active' NOT NULL,
	"etag" text,
	"last_modified" text,
	"last_polled_at" timestamp with time zone,
	"last_successful_at" timestamp with time zone,
	"failure_count" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "syndicated_item_translations" (
	"item_id" uuid NOT NULL,
	"locale" text NOT NULL,
	"title" text NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"status" "translation_status" DEFAULT 'machine' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "syndicated_item_translations_item_id_locale_pk" PRIMARY KEY("item_id","locale")
);
--> statement-breakpoint
CREATE TABLE "syndicated_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_id" uuid NOT NULL,
	"external_id" text NOT NULL,
	"canonical_url" text NOT NULL,
	"title" text NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"source_locale" text DEFAULT 'und' NOT NULL,
	"author" text,
	"image_url" text,
	"published_at" timestamp with time zone NOT NULL,
	"imported_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "translation_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"source_locale" text NOT NULL,
	"target_locale" text NOT NULL,
	"status" "translation_job_status" DEFAULT 'queued' NOT NULL,
	"provider" text,
	"requested_by" uuid,
	"error" text,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "creations" ADD COLUMN "source_locale" text DEFAULT 'zh-CN' NOT NULL;--> statement-breakpoint
ALTER TABLE "creation_translations" ADD CONSTRAINT "creation_translations_creation_id_creations_id_fk" FOREIGN KEY ("creation_id") REFERENCES "public"."creations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creation_translations" ADD CONSTRAINT "creation_translations_translated_by_users_id_fk" FOREIGN KEY ("translated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_logs" ADD CONSTRAINT "delivery_logs_target_id_delivery_targets_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."delivery_targets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_logs" ADD CONSTRAINT "delivery_logs_item_id_syndicated_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."syndicated_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_logs" ADD CONSTRAINT "delivery_logs_creation_id_creations_id_fk" FOREIGN KEY ("creation_id") REFERENCES "public"."creations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_targets" ADD CONSTRAINT "delivery_targets_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feed_subscriptions" ADD CONSTRAINT "feed_subscriptions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "syndicated_item_translations" ADD CONSTRAINT "syndicated_item_translations_item_id_syndicated_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."syndicated_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "syndicated_items" ADD CONSTRAINT "syndicated_items_source_id_feed_subscriptions_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."feed_subscriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "translation_jobs" ADD CONSTRAINT "translation_jobs_requested_by_users_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "creation_translations_locale_slug_unique" ON "creation_translations" USING btree ("locale","localized_slug");--> statement-breakpoint
CREATE INDEX "creation_translations_locale_status_idx" ON "creation_translations" USING btree ("locale","status");--> statement-breakpoint
CREATE INDEX "delivery_logs_target_idx" ON "delivery_logs" USING btree ("target_id","created_at");--> statement-breakpoint
CREATE INDEX "delivery_logs_status_idx" ON "delivery_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "delivery_targets_channel_idx" ON "delivery_targets" USING btree ("channel");--> statement-breakpoint
CREATE UNIQUE INDEX "feed_subscriptions_url_unique" ON "feed_subscriptions" USING btree ("url");--> statement-breakpoint
CREATE INDEX "feed_subscriptions_status_idx" ON "feed_subscriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "syndicated_item_translations_locale_idx" ON "syndicated_item_translations" USING btree ("locale","status");--> statement-breakpoint
CREATE UNIQUE INDEX "syndicated_items_source_external_unique" ON "syndicated_items" USING btree ("source_id","external_id");--> statement-breakpoint
CREATE INDEX "syndicated_items_source_idx" ON "syndicated_items" USING btree ("source_id");--> statement-breakpoint
CREATE INDEX "syndicated_items_published_idx" ON "syndicated_items" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "translation_jobs_entity_idx" ON "translation_jobs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "translation_jobs_status_idx" ON "translation_jobs" USING btree ("status","created_at");