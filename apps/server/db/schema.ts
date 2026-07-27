import { boolean, date, doublePrecision, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import {
  defaultSiteBranding,
  defaultSiteMetadata,
  type AuditDiagnosis,
  type BuildRequestEraType,
  type BuildRequestStatus,
  type CalendarPriority,
  type CalendarSlot,
  type CalendarStatus,
  type ScheduleDay,
  type ScheduleEntryType,
  type SiteBranding
} from "@fullstack-template/schema";

export const sites = pgTable("sites", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  heroImageUrl: text("hero_image_url").notNull().default(""),
  metadata: jsonb("metadata")
    .$type<{ tabTitle: string; seoTitle: string; seoDescription: string; faviconUrl: string; ogImageUrl: string; frontendAsideMode: "scroll" | "static" }>()
    .notNull()
    .default(defaultSiteMetadata),
  branding: jsonb("branding")
    .$type<SiteBranding>()
    .notNull()
    .default(defaultSiteBranding),
  links: jsonb("links").$type<Array<{ label: string; href: string; kind: "primary" | "secondary" | "social" }>>().notNull().default([]),
  published: boolean("published").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const uploads = pgTable("uploads", {
  id: uuid("id").primaryKey().defaultRandom(),
  filename: text("filename").notNull(),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull().default(""),
  storageProvider: text("storage_provider").notNull().default("local"),
  storageKey: text("storage_key").notNull().default(""),
  storageResourceType: text("storage_resource_type").notNull().default("raw"),
  contentType: text("content_type").notNull(),
  size: integer("size").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const scheduleEntries = pgTable("schedule_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  dayOfWeek: text("day_of_week").$type<ScheduleDay>().notNull().unique(),
  time: text("time").notNull().default(""),
  type: text("type").$type<ScheduleEntryType>().notNull().default("video"),
  title: text("title").notNull().default(""),
  thumbnailUrl: text("thumbnail_url").notNull().default(""),
  uploadId: uuid("upload_id").references(() => uploads.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const calendarEntries = pgTable("calendar_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  uploadDate: date("upload_date", { mode: "string" }).notNull(),
  slot: text("slot").$type<CalendarSlot>().notNull().default("saturday_main"),
  title: text("title").notNull().default(""),
  priority: text("priority").$type<CalendarPriority>().notNull().default("normal"),
  status: text("status").$type<CalendarStatus>().notNull().default("idea"),
  packagingDone: boolean("packaging_done").notNull().default(false),
  expectedClipCount: integer("expected_clip_count").notNull().default(0),
  notes: text("notes").notNull().default(""),
  titleCandidates: jsonb("title_candidates").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const calendarChecklists = pgTable("calendar_checklists", {
  id: uuid("id").primaryKey().defaultRandom(),
  calendarEntryId: uuid("calendar_entry_id")
    .notNull()
    .unique()
    .references(() => calendarEntries.id, { onDelete: "cascade" }),
  checkedItems: jsonb("checked_items").$type<Record<string, boolean>>().notNull().default({}),
  itemNotes: jsonb("item_notes").$type<Record<string, string>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const checklistItems = pgTable("checklist_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  groupKey: text("group_key").notNull(),
  label: text("label").notNull(),
  note: text("note").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const weeklyRhythmState = pgTable("weekly_rhythm_state", {
  id: uuid("id").primaryKey().defaultRandom(),
  weekStartDate: date("week_start_date", { mode: "string" }).notNull(),
  checkedItems: jsonb("checked_items").$type<Record<string, boolean>>().notNull().default({}),
  sundayStreamChecked: jsonb("sunday_stream_checked").$type<Record<string, boolean>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const auditRuns = pgTable("audit_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  auditDate: date("audit_date", { mode: "string" }).notNull(),
  ctrPercent: doublePrecision("ctr_percent").notNull(),
  avgPercentViewed: doublePrecision("avg_percent_viewed").notNull(),
  viewsThisPeriod: integer("views_this_period").notNull(),
  viewsPriorPeriod: integer("views_prior_period").notNull(),
  subsGainedThisPeriod: integer("subs_gained_this_period").notNull(),
  subsGainedPriorPeriod: integer("subs_gained_prior_period").notNull(),
  shortsViewsThisPeriod: integer("shorts_views_this_period").notNull().default(0),
  shortsViewsPriorPeriod: integer("shorts_views_prior_period").notNull().default(0),
  revenueThisPeriod: doublePrecision("revenue_this_period").notNull().default(0),
  revenuePriorPeriod: doublePrecision("revenue_prior_period").notNull().default(0),
  notes: text("notes").notNull().default(""),
  diagnosis: jsonb("diagnosis").$type<AuditDiagnosis>().notNull().default({ cards: [], crossMetric: [] }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const buildRequests = pgTable("build_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  shoutoutName: text("shoutout_name").notNull(),
  buildIdea: text("build_idea").notNull(),
  eraType: text("era_type").$type<BuildRequestEraType>().notNull(),
  specificMap: text("specific_map").notNull().default(""),
  specificAdditions: text("specific_additions").notNull().default(""),
  imageUrl: text("image_url").notNull().default(""),
  uploadId: uuid("upload_id").references(() => uploads.id, { onDelete: "set null" }),
  status: text("status").$type<BuildRequestStatus>().notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: text("role").notNull().default("user"),
  banned: boolean("banned").notNull().default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull()
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  impersonatedBy: text("impersonated_by"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" })
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull()
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true })
});

export type SiteRow = typeof sites.$inferSelect;
export type NewSiteRow = typeof sites.$inferInsert;
export type UploadRow = typeof uploads.$inferSelect;
export type ScheduleEntryRow = typeof scheduleEntries.$inferSelect;
export type NewScheduleEntryRow = typeof scheduleEntries.$inferInsert;
export type AuditRunRow = typeof auditRuns.$inferSelect;
export type NewAuditRunRow = typeof auditRuns.$inferInsert;
export type WeeklyRhythmStateRow = typeof weeklyRhythmState.$inferSelect;
export type NewWeeklyRhythmStateRow = typeof weeklyRhythmState.$inferInsert;
export type CalendarEntryRow = typeof calendarEntries.$inferSelect;
export type NewCalendarEntryRow = typeof calendarEntries.$inferInsert;
export type CalendarChecklistRow = typeof calendarChecklists.$inferSelect;
export type NewCalendarChecklistRow = typeof calendarChecklists.$inferInsert;
export type ChecklistItemRow = typeof checklistItems.$inferSelect;
export type NewChecklistItemRow = typeof checklistItems.$inferInsert;
export type BuildRequestRow = typeof buildRequests.$inferSelect;
export type NewBuildRequestRow = typeof buildRequests.$inferInsert;
