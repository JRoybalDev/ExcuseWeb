CREATE TABLE "calendar_checklists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"calendar_entry_id" uuid NOT NULL,
	"checked_items" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"item_notes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "calendar_checklists_calendar_entry_id_unique" UNIQUE("calendar_entry_id")
);
--> statement-breakpoint
ALTER TABLE "calendar_checklists" ADD CONSTRAINT "calendar_checklists_calendar_entry_id_calendar_entries_id_fk" FOREIGN KEY ("calendar_entry_id") REFERENCES "public"."calendar_entries"("id") ON DELETE cascade ON UPDATE no action;