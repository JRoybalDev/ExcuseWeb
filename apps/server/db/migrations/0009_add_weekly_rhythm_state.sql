CREATE TABLE "weekly_rhythm_state" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"week_start_date" date NOT NULL,
	"checked_items" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"sunday_stream_checked" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
