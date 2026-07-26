CREATE TABLE "audit_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"audit_date" date NOT NULL,
	"ctr_percent" double precision NOT NULL,
	"avg_percent_viewed" double precision NOT NULL,
	"views_this_period" integer NOT NULL,
	"views_prior_period" integer NOT NULL,
	"subs_gained_this_period" integer NOT NULL,
	"subs_gained_prior_period" integer NOT NULL,
	"shorts_views_this_period" integer DEFAULT 0 NOT NULL,
	"shorts_views_prior_period" integer DEFAULT 0 NOT NULL,
	"revenue_this_period" double precision DEFAULT 0 NOT NULL,
	"revenue_prior_period" double precision DEFAULT 0 NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"diagnosis" jsonb DEFAULT '{"cards":[],"crossMetric":[]}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
