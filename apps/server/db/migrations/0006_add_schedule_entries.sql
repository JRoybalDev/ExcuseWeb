CREATE TABLE "schedule_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"day_of_week" text NOT NULL,
	"time" text DEFAULT '' NOT NULL,
	"type" text DEFAULT 'video' NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"thumbnail_url" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "schedule_entries_day_of_week_unique" UNIQUE("day_of_week")
);
