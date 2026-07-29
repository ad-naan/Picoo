CREATE TYPE "public"."badge_rarity" AS ENUM('common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'one_of_one');--> statement-breakpoint
CREATE TABLE "badge_quest_progress" (
	"quest_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"progress" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"completed_at" timestamp with time zone,
	"claimed_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "badge_quest_progress_quest_id_user_id_pk" PRIMARY KEY("quest_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "badge_quest_translations" (
	"quest_id" uuid NOT NULL,
	"locale" text NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	CONSTRAINT "badge_quest_translations_quest_id_locale_pk" PRIMARY KEY("quest_id","locale")
);
--> statement-breakpoint
CREATE TABLE "badge_quests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"event_type" text NOT NULL,
	"rules" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"reward_badge_id" uuid NOT NULL,
	"active" boolean DEFAULT false NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "badge_translations" (
	"badge_id" uuid NOT NULL,
	"locale" text NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"unlock_hint" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "badge_translations_badge_id_locale_pk" PRIMARY KEY("badge_id","locale")
);
--> statement-breakpoint
CREATE TABLE "badges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"rarity" "badge_rarity" DEFAULT 'common' NOT NULL,
	"artwork_url" text,
	"thumbnail_url" text,
	"visual_config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"max_supply" integer,
	"active" boolean DEFAULT true NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_badges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"badge_id" uuid NOT NULL,
	"serial_number" integer NOT NULL,
	"awarded_by" uuid,
	"award_reason" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"showcased" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"awarded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "badge_quest_progress" ADD CONSTRAINT "badge_quest_progress_quest_id_badge_quests_id_fk" FOREIGN KEY ("quest_id") REFERENCES "public"."badge_quests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badge_quest_progress" ADD CONSTRAINT "badge_quest_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badge_quest_translations" ADD CONSTRAINT "badge_quest_translations_quest_id_badge_quests_id_fk" FOREIGN KEY ("quest_id") REFERENCES "public"."badge_quests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badge_quests" ADD CONSTRAINT "badge_quests_reward_badge_id_badges_id_fk" FOREIGN KEY ("reward_badge_id") REFERENCES "public"."badges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badge_quests" ADD CONSTRAINT "badge_quests_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badge_translations" ADD CONSTRAINT "badge_translations_badge_id_badges_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badges" ADD CONSTRAINT "badges_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badge_id_badges_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_awarded_by_users_id_fk" FOREIGN KEY ("awarded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "badge_quest_progress_user_idx" ON "badge_quest_progress" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "badge_quests_key_unique" ON "badge_quests" USING btree ("key");--> statement-breakpoint
CREATE INDEX "badge_quests_active_idx" ON "badge_quests" USING btree ("active");--> statement-breakpoint
CREATE INDEX "badge_translations_locale_idx" ON "badge_translations" USING btree ("locale");--> statement-breakpoint
CREATE UNIQUE INDEX "badges_key_unique" ON "badges" USING btree ("key");--> statement-breakpoint
CREATE INDEX "badges_rarity_idx" ON "badges" USING btree ("rarity");--> statement-breakpoint
CREATE UNIQUE INDEX "user_badges_user_badge_unique" ON "user_badges" USING btree ("user_id","badge_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_badges_badge_serial_unique" ON "user_badges" USING btree ("badge_id","serial_number");--> statement-breakpoint
CREATE INDEX "user_badges_user_showcase_idx" ON "user_badges" USING btree ("user_id","showcased","display_order");