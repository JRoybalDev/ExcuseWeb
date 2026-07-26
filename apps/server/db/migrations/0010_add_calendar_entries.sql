CREATE TABLE "calendar_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"upload_date" date NOT NULL,
	"slot" text DEFAULT 'saturday_main' NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"priority" text DEFAULT 'normal' NOT NULL,
	"status" text DEFAULT 'idea' NOT NULL,
	"packaging_done" boolean DEFAULT false NOT NULL,
	"expected_clip_count" integer DEFAULT 0 NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"title_candidates" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
