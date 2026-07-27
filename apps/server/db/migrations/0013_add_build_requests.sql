CREATE TABLE "build_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shoutout_name" text NOT NULL,
	"build_idea" text NOT NULL,
	"era_type" text NOT NULL,
	"specific_map" text DEFAULT '' NOT NULL,
	"specific_additions" text DEFAULT '' NOT NULL,
	"image_url" text DEFAULT '' NOT NULL,
	"upload_id" uuid,
	"status" text DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "build_requests" ADD CONSTRAINT "build_requests_upload_id_uploads_id_fk" FOREIGN KEY ("upload_id") REFERENCES "public"."uploads"("id") ON DELETE set null ON UPDATE no action;