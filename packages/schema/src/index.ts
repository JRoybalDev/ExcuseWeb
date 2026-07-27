import { z } from "zod";

export const LinkSchema = z.object({
  label: z.string().min(1).max(80),
  href: z.string().url(),
  kind: z.enum(["primary", "secondary", "social"]).default("secondary")
});

export const UploadSchema = z.object({
  id: z.string().uuid(),
  filename: z.string().min(1),
  url: z.string().min(1),
  thumbnailUrl: z.string().default(""),
  storageProvider: z.enum(["local", "cloudinary"]).or(z.string()).default("local"),
  storageKey: z.string().default(""),
  storageResourceType: z.enum(["image", "video", "raw"]).or(z.string()).default("raw"),
  contentType: z.string().min(1),
  size: z.number().int().nonnegative(),
  createdAt: z.string().datetime()
});

export const UploadListSchema = z.array(UploadSchema);

export const defaultSiteMetadata = {
  tabTitle: "",
  seoTitle: "",
  seoDescription: "",
  faviconUrl: "",
  ogImageUrl: "",
  frontendAsideMode: "static" as "scroll" | "static"
};

export const defaultSiteBranding = {
  backgroundColor: "#f7f7f2",
  lightBackgroundColor: "#f7f7f2",
  darkBackgroundColor: "#111418",
  lightSurfaceColor: "#ffffff",
  darkSurfaceColor: "#191f27",
  lightSurfaceMutedColor: "#f8fafc",
  darkSurfaceMutedColor: "#202833",
  lightSurfaceAccentColor: "#eef6f7",
  darkSurfaceAccentColor: "#16333a",
  lightBorderColor: "#deded2",
  darkBorderColor: "#2c3440",
  lightBorderStrongColor: "#c9c9bd",
  darkBorderStrongColor: "#435061",
  lightBorderAccentColor: "#c7dde0",
  darkBorderAccentColor: "#2b6871",
  lightSurfaceDangerColor: "#fff1f1",
  darkSurfaceDangerColor: "#3a2020",
  lightBorderDangerColor: "#f1c5c5",
  darkBorderDangerColor: "#6f3535",
  lightTextColor: "#18212f",
  darkTextColor: "#e8edf3",
  lightHeadingColor: "#101828",
  darkHeadingColor: "#f7fafc",
  lightMutedColor: "#536173",
  darkMutedColor: "#aab6c5",
  lightNavColor: "#445064",
  darkNavColor: "#c6d0dd",
  lightAccentColor: "#006d77",
  darkAccentColor: "#55c8d6",
  lightAccentStrongColor: "#005f69",
  darkAccentStrongColor: "#9de4ec",
  lightAccentTextColor: "#193926",
  darkAccentTextColor: "#d6fbef",
  lightButtonPrimaryColor: "#635bff",
  darkButtonPrimaryColor: "#7c73ff",
  lightButtonPrimaryTextColor: "#ffffff",
  darkButtonPrimaryTextColor: "#ffffff",
  lightButtonSecondaryColor: "#eef6f7",
  darkButtonSecondaryColor: "#202833",
  lightButtonSecondaryTextColor: "#005f69",
  darkButtonSecondaryTextColor: "#9de4ec",
  lightButtonSecondaryBorderColor: "#c7dde0",
  darkButtonSecondaryBorderColor: "#435061",
  lightDangerColor: "#b42318",
  darkDangerColor: "#ff9b8f",
  lightNavActiveColor: "#e7f0e8",
  darkNavActiveColor: "#18382f",
  lightTopbarColor: "#f7f7f2",
  darkTopbarColor: "#111418",
  surfaceColor: "#ffffff",
  textColor: "#18212f",
  headingColor: "#101828",
  accentColor: "#006d77"
};

export const SiteMetadataSchema = z.object({
  tabTitle: z.string().max(80).default(""),
  seoTitle: z.string().max(160).default(""),
  seoDescription: z.string().max(300).default(""),
  faviconUrl: z.string().url().or(z.literal("")).default(""),
  ogImageUrl: z.string().url().or(z.literal("")).default(""),
  frontendAsideMode: z.enum(["scroll", "static"]).default("static")
});

export const SiteBrandingSchema = z.object({
  backgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#f7f7f2"),
  lightBackgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#f7f7f2"),
  darkBackgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#111418"),
  lightSurfaceColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#ffffff"),
  darkSurfaceColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#191f27"),
  lightSurfaceMutedColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#f8fafc"),
  darkSurfaceMutedColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#202833"),
  lightSurfaceAccentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#eef6f7"),
  darkSurfaceAccentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#16333a"),
  lightBorderColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#deded2"),
  darkBorderColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#2c3440"),
  lightBorderStrongColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#c9c9bd"),
  darkBorderStrongColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#435061"),
  lightBorderAccentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#c7dde0"),
  darkBorderAccentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#2b6871"),
  lightSurfaceDangerColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#fff1f1"),
  darkSurfaceDangerColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#3a2020"),
  lightBorderDangerColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#f1c5c5"),
  darkBorderDangerColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#6f3535"),
  lightTextColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#18212f"),
  darkTextColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#e8edf3"),
  lightHeadingColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#101828"),
  darkHeadingColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#f7fafc"),
  lightMutedColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#536173"),
  darkMutedColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#aab6c5"),
  lightNavColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#445064"),
  darkNavColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#c6d0dd"),
  lightAccentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#006d77"),
  darkAccentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#55c8d6"),
  lightAccentStrongColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#005f69"),
  darkAccentStrongColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#9de4ec"),
  lightAccentTextColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#193926"),
  darkAccentTextColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#d6fbef"),
  lightButtonPrimaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#635bff"),
  darkButtonPrimaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#7c73ff"),
  lightButtonPrimaryTextColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#ffffff"),
  darkButtonPrimaryTextColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#ffffff"),
  lightButtonSecondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#eef6f7"),
  darkButtonSecondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#202833"),
  lightButtonSecondaryTextColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#005f69"),
  darkButtonSecondaryTextColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#9de4ec"),
  lightButtonSecondaryBorderColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#c7dde0"),
  darkButtonSecondaryBorderColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#435061"),
  lightDangerColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#b42318"),
  darkDangerColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#ff9b8f"),
  lightNavActiveColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#e7f0e8"),
  darkNavActiveColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#18382f"),
  lightTopbarColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#f7f7f2"),
  darkTopbarColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#111418"),
  surfaceColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#ffffff"),
  textColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#18212f"),
  headingColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#101828"),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#006d77")
});

export const SiteSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(160),
  description: z.string().max(1000).default(""),
  heroImageUrl: z.string().url().or(z.literal("")).default(""),
  metadata: SiteMetadataSchema.default(defaultSiteMetadata),
  branding: SiteBrandingSchema.default(defaultSiteBranding),
  links: z.array(LinkSchema).default([]),
  published: z.boolean().default(false),
  updatedAt: z.string().datetime()
});

export const SiteDraftSchema = SiteSchema.omit({
  id: true,
  updatedAt: true
}).extend({
  slug: SiteSchema.shape.slug,
  title: SiteSchema.shape.title
});

export const SiteListSchema = z.array(SiteSchema);

export const scheduleDayValues = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export const scheduleEntryTypeValues = ["video", "youtube_stream", "twitch_stream", "members_video", "members_stream"] as const;

export const scheduleDayLabels: Record<(typeof scheduleDayValues)[number], string> = {
  mon: "MON",
  tue: "TUE",
  wed: "WED",
  thu: "THU",
  fri: "FRI",
  sat: "SAT",
  sun: "SUN"
};

export const scheduleEntryTypeLabels: Record<(typeof scheduleEntryTypeValues)[number], string> = {
  video: "Video",
  youtube_stream: "YouTube Stream",
  twitch_stream: "Twitch Stream",
  members_video: "Members-Only Video",
  members_stream: "Members-Only Stream"
};

export const ScheduleEntrySchema = z.object({
  id: z.string().uuid(),
  dayOfWeek: z.enum(scheduleDayValues),
  time: z.string().max(40).default(""),
  type: z.enum(scheduleEntryTypeValues).default("video"),
  title: z.string().max(160).default(""),
  thumbnailUrl: z.string().max(2048).default(""),
  uploadId: z.string().uuid().nullable().default(null),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const ScheduleEntryDraftSchema = ScheduleEntrySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const ScheduleEntryListSchema = z.array(ScheduleEntrySchema);

export const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");

// ---- Build Requests ----
export const buildRequestEraTypeValues = ["jurassic-park", "jurassic-world", "din", "ingen", "biosyn", "dfw", "mixed"] as const;

export const buildRequestEraTypeLabels: Record<(typeof buildRequestEraTypeValues)[number], string> = {
  "jurassic-park": "Jurassic Park",
  "jurassic-world": "Jurassic World",
  din: "DIN",
  ingen: "InGen",
  biosyn: "Biosyn",
  dfw: "DFW",
  mixed: "Mixed"
};

export const buildRequestStatusValues = ["new", "reviewing", "approved", "built", "declined"] as const;

export const buildRequestStatusLabels: Record<(typeof buildRequestStatusValues)[number], string> = {
  new: "New",
  reviewing: "Reviewing",
  approved: "Approved",
  built: "Built",
  declined: "Declined"
};

export const BuildRequestSchema = z.object({
  id: z.string().uuid(),
  shoutoutName: z.string().max(80),
  buildIdea: z.string().max(2000),
  eraType: z.enum(buildRequestEraTypeValues),
  specificMap: z.string().max(160).default(""),
  specificAdditions: z.string().max(1000).default(""),
  imageUrl: z.string().max(2048).default(""),
  uploadId: z.string().uuid().nullable().default(null),
  status: z.enum(buildRequestStatusValues).default("new"),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const BuildRequestDraftSchema = z.object({
  shoutoutName: z.string().trim().min(1, "Shoutout name is required").max(80, "Keep it under 80 characters"),
  buildIdea: z.string().trim().min(10, "Tell us a bit more about the build").max(2000, "Keep it under 2000 characters"),
  eraType: z.enum(buildRequestEraTypeValues),
  specificMap: z.string().trim().max(160, "Keep it under 160 characters").default(""),
  specificAdditions: z.string().trim().max(1000, "Keep it under 1000 characters").default(""),
  uploadId: z.string().uuid().nullable().default(null)
});

export const BuildRequestStatusUpdateSchema = z.object({
  status: z.enum(buildRequestStatusValues)
});

export const BuildRequestListSchema = z.array(BuildRequestSchema);

// ---- Content Calendar ----
export const calendarSlotValues = ["saturday_main", "wednesday_surprise", "sunday_stream"] as const;

export const calendarSlotLabels: Record<(typeof calendarSlotValues)[number], string> = {
  saturday_main: "Saturday Main",
  wednesday_surprise: "Wednesday Surprise",
  sunday_stream: "Sunday Stream"
};

export const calendarPriorityValues = ["normal", "dlc_override", "series", "experiment"] as const;

export const calendarPriorityLabels: Record<(typeof calendarPriorityValues)[number], string> = {
  normal: "Normal",
  dlc_override: "DLC Override",
  series: "Series",
  experiment: "Experiment"
};

export const calendarStatusValues = ["idea", "scripted", "recorded", "edited", "scheduled", "published"] as const;

export const calendarStatusLabels: Record<(typeof calendarStatusValues)[number], string> = {
  idea: "Idea",
  scripted: "Scripted",
  recorded: "Recorded",
  edited: "Edited",
  scheduled: "Scheduled",
  published: "Published"
};

export const readyCalendarStatuses: readonly (typeof calendarStatusValues)[number][] = ["edited", "scheduled"];

export const CalendarEntrySchema = z.object({
  id: z.string().uuid(),
  uploadDate: isoDateSchema,
  slot: z.enum(calendarSlotValues).default("saturday_main"),
  title: z.string().max(160).default(""),
  priority: z.enum(calendarPriorityValues).default("normal"),
  status: z.enum(calendarStatusValues).default("idea"),
  packagingDone: z.boolean().default(false),
  expectedClipCount: z.number().int().min(0).default(0),
  notes: z.string().max(2000).default(""),
  titleCandidates: z.array(z.string().max(160)).max(5).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const CalendarEntryDraftSchema = CalendarEntrySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const CalendarEntryListSchema = z.array(CalendarEntrySchema);

export const CalendarAutoFillInputSchema = z.object({
  count: z.number().int().min(1).max(20),
  startAfter: isoDateSchema.optional()
});

export const CalendarAutoFillResultSchema = z.object({
  created: CalendarEntryListSchema,
  skipped: z.array(isoDateSchema)
});

export type CalendarSlot = (typeof calendarSlotValues)[number];
export type CalendarPriority = (typeof calendarPriorityValues)[number];
export type CalendarStatus = (typeof calendarStatusValues)[number];
export type CalendarEntry = z.infer<typeof CalendarEntrySchema>;
export type CalendarEntryDraft = z.infer<typeof CalendarEntryDraftSchema>;
export type CalendarEntryDraftInput = z.input<typeof CalendarEntryDraftSchema>;
export type CalendarAutoFillInput = z.infer<typeof CalendarAutoFillInputSchema>;
export type CalendarAutoFillResult = z.infer<typeof CalendarAutoFillResultSchema>;

export type CalendarStats = {
  finishedBacklog: number;
  videosPlanned: number;
  daysUntilNext: number | null;
  nextTitle: string | null;
  overdueCount: number;
  packagingNotDoneCount: number;
  wednesdayUnlocked: boolean;
};

function daysBetweenIsoDates(fromIso: string, toIso: string): number {
  const from = new Date(`${fromIso}T12:00:00`);
  const to = new Date(`${toIso}T12:00:00`);
  return Math.round((to.getTime() - from.getTime()) / 86400000);
}

// Ported from the source channel-planning tool's renderCalStats(): finished backlog is what
// unlocks the Wednesday surprise slot, and "packaging not done" only flags entries due soon.
export function computeCalendarStats(entries: CalendarEntry[], todayIso: string): CalendarStats {
  const notPublished = entries.filter((entry) => entry.status !== "published");
  const finishedBacklog = entries.filter((entry) => readyCalendarStatuses.includes(entry.status)).length;
  const upcoming = notPublished
    .filter((entry) => entry.uploadDate >= todayIso)
    .sort((a, b) => a.uploadDate.localeCompare(b.uploadDate))[0];
  const overdueCount = notPublished.filter((entry) => entry.uploadDate < todayIso).length;
  const packagingNotDoneCount = notPublished.filter((entry) => {
    if (entry.packagingDone || entry.uploadDate < todayIso) {
      return false;
    }
    return daysBetweenIsoDates(todayIso, entry.uploadDate) <= 7;
  }).length;

  return {
    finishedBacklog,
    videosPlanned: notPublished.length,
    daysUntilNext: upcoming ? daysBetweenIsoDates(todayIso, upcoming.uploadDate) : null,
    nextTitle: upcoming ? upcoming.title : null,
    overdueCount,
    packagingNotDoneCount,
    wednesdayUnlocked: finishedBacklog >= 2
  };
}

// ---- Shared checklist primitives (used by Weekly Rhythm and the per-video Production Checklist) ----
export type ChecklistItemDef = { key: string; label: string; note?: string };

export function calcChecklistProgress(checkedItems: Record<string, boolean>, items: { id: string }[]) {
  const total = items.length;
  const done = items.filter((item) => checkedItems[item.id]).length;
  return { done, total, percent: total === 0 ? 0 : Math.round((100 * done) / total) };
}

// ---- Dynamic checklist items (DB-backed) ----
// The item lists below (weeklyRhythmItems, sundayStreamChecklistItems, productionChecklistItems)
// are now SEED DEFAULTS only, inserted once into `checklist_items` on first server boot. After that,
// the database is the live source of truth — items can be added, edited, and deleted by the admin,
// grouped by `groupKey`. Day/phase structure itself (which groups exist) stays fixed in code.
export function weeklyRhythmGroupKey(day: (typeof weeklyRhythmDayValues)[number]): string {
  return `weekly_rhythm:${day}`;
}

export const sundayStreamGroupKey = "sunday_stream";

export function productionChecklistGroupKey(phase: (typeof productionChecklistPhaseValues)[number]): string {
  return `production:${phase}`;
}

export const ChecklistItemSchema = z.object({
  id: z.string().uuid(),
  groupKey: z.string().min(1).max(120),
  label: z.string().min(1).max(200),
  note: z.string().max(300).default(""),
  sortOrder: z.number().int().default(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const ChecklistItemDraftSchema = z.object({
  groupKey: z.string().min(1).max(120),
  label: z.string().min(1).max(200),
  note: z.string().max(300).default("")
});

export const ChecklistItemUpdateSchema = z.object({
  label: z.string().min(1).max(200),
  note: z.string().max(300).default("")
});

export const ChecklistItemListSchema = z.array(ChecklistItemSchema);

// ---- Weekly Rhythm Checklist (singleton, recurring — reset every Monday) ----
export const weeklyRhythmDayValues = ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday_friday"] as const;

export const weeklyRhythmDayLabels: Record<(typeof weeklyRhythmDayValues)[number], string> = {
  saturday: "Saturday",
  sunday: "Sunday",
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday_friday: "Thu–Fri"
};

export const weeklyRhythmDaySubtitles: Record<(typeof weeklyRhythmDayValues)[number], string> = {
  saturday: "Upload day",
  sunday: "Stream day, 9 AM–1 PM PT",
  monday: "Socials day",
  tuesday: "Review day — the 10 minutes that matter most",
  wednesday: "Optional surprise upload",
  thursday_friday: "Production days"
};

export const weeklyRhythmItems: Record<(typeof weeklyRhythmDayValues)[number], ChecklistItemDef[]> = {
  saturday: [
    { key: "saturday.video_live", label: "7:00 AM PT — video live, verify it plays" },
    { key: "saturday.pin_comment_discord_ping", label: "Pin comment + Discord announcement ping" },
    { key: "saturday.post_clip_1", label: "Post vertical clip #1 everywhere" },
    { key: "saturday.reply_comments", label: "Reply to the first 10–15 comments" }
  ],
  sunday: [
    { key: "sunday.run_stream_checklist", label: "Run the stream checklist (below)" },
    { key: "sunday.drop_discord_invite_hourly", label: "Drop the Discord invite in chat hourly" },
    { key: "sunday.clip_stream_highlights", label: "Clip 1–2 stream highlights after", note: "Free content that also promotes next Sunday" }
  ],
  monday: [
    { key: "monday.post_stream_clips", label: "Post stream-highlight clips", note: "Shorts + TikTok + Reels" },
    { key: "monday.log_clips", label: "Log all clips in the Shorts & Socials tab" },
    { key: "monday.discord_conversation_starter", label: "Post a Discord conversation starter", note: "One screenshot or question — keeps the server alive" }
  ],
  tuesday: [
    { key: "tuesday.open_retention_graph", label: "Open Saturday's retention graph, find the dip" },
    { key: "tuesday.check_ctr_swap_thumbnail", label: "Check CTR — swap thumbnail if under 4%" },
    { key: "tuesday.log_metrics", label: "Log CTR / retention / RPM in the tracker" },
    { key: "tuesday.write_one_fix", label: "Write the one fix for the next video" }
  ],
  wednesday: [
    { key: "wednesday.upload_if_backlog_2plus", label: "Upload only if the backlog is 2+", note: "Never at the cost of Saturday" },
    { key: "wednesday.post_clip_2_if_not_uploading", label: "If not uploading: post clip #2 instead" },
    { key: "wednesday.park_of_the_week_pick", label: "Park of the week pick from #park-showcase" }
  ],
  thursday_friday: [
    { key: "thursday_friday.record_or_edit", label: "Record and/or edit", note: "Batch by phase, not by video" },
    { key: "thursday_friday.schedule_saturday_video", label: "Schedule Saturday's video (hard deadline: Thursday)" },
    { key: "thursday_friday.confirm_backlog", label: "Confirm the backlog still holds 2+ finished videos" },
    { key: "thursday_friday.packaging_session", label: "Packaging session for next week's videos", note: "Titles + thumbnails before recording" }
  ]
};

export const allWeeklyRhythmItemKeys = Object.values(weeklyRhythmItems).flatMap((items) => items.map((item) => item.key));

export const sundayStreamChecklistItems: ChecklistItemDef[] = [
  { key: "sunday_stream.pre_stream_ready", label: "Pre-stream: title + thumbnail set, Discord ping sent 30 min before" },
  { key: "sunday_stream.super_chat_enabled", label: "Super Chat / Stickers enabled and tested" },
  { key: "sunday_stream.interactive_segment_per_hour", label: "One interactive segment planned per hour", note: "Naming dinos, viewer park tours, build requests" },
  { key: "sunday_stream.build_requests_discord_only", label: "Take build requests from Discord only", note: "Drives server joins" },
  { key: "sunday_stream.drop_discord_invite_hourly", label: "Drop the Discord invite in chat hourly" },
  { key: "sunday_stream.mention_memberships_once", label: "Mention memberships once, mid-stream", note: "Once — not repeatedly" },
  { key: "sunday_stream.note_clip_moments", label: "Note 2 clip-worthy moments as they happen" },
  { key: "sunday_stream.post_stream_clip_thank_supporters", label: "After: clip highlights, thank top supporters in Discord" },
  { key: "sunday_stream.twitch_vod_to_channel2", label: "Twitch VOD → channel 2" }
];

export const WeeklyRhythmStateSchema = z.object({
  id: z.string().uuid(),
  weekStartDate: isoDateSchema,
  checkedItems: z.record(z.string(), z.boolean()).default({}),
  sundayStreamChecked: z.record(z.string(), z.boolean()).default({}),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const WeeklyRhythmUpdateSchema = z.object({
  checkedItems: z.record(z.string(), z.boolean()).default({}),
  sundayStreamChecked: z.record(z.string(), z.boolean()).default({})
});

export const WeeklyRhythmResetSchema = z.object({
  weekStartDate: isoDateSchema
});

// ---- Production Checklist (fixed items, per Content Calendar entry) ----
export const productionChecklistPhaseValues = ["pre_production", "recording", "editing", "pre_upload", "publish_day", "post_upload"] as const;

export const productionChecklistPhaseLabels: Record<(typeof productionChecklistPhaseValues)[number], string> = {
  pre_production: "Pre-Production",
  recording: "Recording",
  editing: "Editing",
  pre_upload: "Pre-Upload",
  publish_day: "Publish Day",
  post_upload: "Post-Upload"
};

export const productionChecklistPhaseSubtitles: Record<(typeof productionChecklistPhaseValues)[number], string> = {
  pre_production: "Do this 1–2 weeks before the upload date",
  recording: "Batch two videos per session where possible",
  editing: "Ship at 90% polish — the next video is the better investment",
  pre_upload: "Target: done by Thursday for a Saturday upload",
  publish_day: "Saturday morning — 20 minutes of work",
  post_upload: "This is where the next video gets better"
};

export const productionChecklistItems: Record<(typeof productionChecklistPhaseValues)[number], ChecklistItemDef[]> = {
  pre_production: [
    { key: "pre_production.pick_story_concept", label: "Pick the ONE story concept", note: 'One build, one disaster, one ranking — never "and also…"' },
    { key: "pre_production.validate_topic", label: "Validate the topic", note: "Search it on YouTube. Old/low-view top results = gap or graveyard. Weak demand → change the angle." },
    { key: "pre_production.write_5_titles", label: "Write 5 titles, pick 1", note: "Impossible claim · stakes · spectacle number · rule-break · authority ranking" },
    { key: "pre_production.design_thumbnail_concept", label: "Design the thumbnail concept", note: "One subject · ≤3 words · high contrast · readable at phone size" },
    { key: "pre_production.run_match_check", label: "Run the match check", note: "Thumbnail = the situation, title = the stakes. One message, not two." },
    { key: "pre_production.write_hook_script", label: "Write the 90-second hook script", note: "Cold proof → stakes → plan → first payoff" },
    { key: "pre_production.decide_watch_next_handoff", label: "Decide the watch-next handoff", note: "Which video does this chain into? Sessions win Suggested placements." },
    { key: "pre_production.add_to_content_calendar", label: "Add the row to the Content Calendar", note: "Status: Idea → Scripted" },
    { key: "pre_production.plan_mid_roll_moment", label: "Plan the mid-roll moment", note: "A scene change past 4:00 — keep the video 8+ minutes" }
  ],
  recording: [
    { key: "recording.check_capture", label: "Check capture before the long take", note: "Audio levels, framerate, disk space, mic not on the wrong input" },
    { key: "recording.record_cold_open_first", label: "Record the cold open first", note: "Get the money shot while the park is camera-ready" },
    { key: "recording.record_hook_to_script", label: "Record the hook to script", note: 'Payoff first — no "hey guys, welcome back"' },
    { key: "recording.capture_broll", label: "Capture B-roll deliberately", note: "Cinematic dino close-ups, guest crowds, wide park shots — this is what fills pattern breaks" },
    { key: "recording.call_out_clip_moments", label: "Call out clip moments as they happen", note: 'Say "clip that" out loud — future-you editing verticals will thank you' },
    { key: "recording.record_watch_next_handoff", label: "Record the watch-next handoff", note: "Specific next video, not a generic outro" },
    { key: "recording.note_best_moment_timestamps", label: "Note timestamps of the 3 best moments", note: "Feeds Shorts/TikTok/Reels later" }
  ],
  editing: [
    { key: "editing.cut_intro_to_payoff", label: "Cut the intro to the payoff", note: "If the first 5 seconds aren't proof, delete until they are" },
    { key: "editing.pattern_break", label: "Pattern break every 30–60s", note: "Camera swap, time-lapse, cut-in, joke" },
    { key: "editing.time_lapse_repetitive", label: "Time-lapse everything repetitive", note: "Fences, paths, terraforming" },
    { key: "editing.verify_first_payoff_before_130", label: "Verify first payoff lands before 1:30", note: "Something real must happen in the first 90 seconds" },
    { key: "editing.confirm_runtime_8min", label: "Confirm runtime is 8+ minutes", note: "Required for mid-rolls — but never pad to reach it" },
    { key: "editing.mid_roll_at_scene_change", label: "Place the mid-roll at a scene change", note: "Never mid-sentence" },
    { key: "editing.sponsor_segment", label: "Sponsor segment at minute 2–4 (if any)", note: "After the first payoff, inside the story, 60s max" },
    { key: "editing.add_discord_mention", label: "Add the Discord mention", note: "One verbal line with a reason — a poll, a featured park" },
    { key: "editing.add_membership_mention", label: "Add the 10-second membership mention", note: "At a natural moment, not the outro" },
    { key: "editing.export_vertical_clips", label: "Export the 3 vertical clips", note: "9:16, cut before the resolution" }
  ],
  pre_upload: [
    { key: "pre_upload.upload_final_title", label: "Upload with the final title", note: "40–60 chars, keyword early" },
    { key: "pre_upload.set_custom_thumbnail", label: "Set the custom thumbnail", note: "Check it at phone size in the Studio preview" },
    { key: "pre_upload.write_description", label: "Write the description", note: "Hook + Discord invite in the top 3 lines + membership + streams + chapters + affiliates" },
    { key: "pre_upload.add_chapters", label: "Add chapters/timestamps" },
    { key: "pre_upload.verify_mid_rolls_on", label: "Verify mid-rolls are ON and placed", note: "Studio → Monetization → Ad breaks" },
    { key: "pre_upload.confirm_ad_formats", label: "Confirm all ad formats enabled", note: "Skippable, non-skippable, bumper" },
    { key: "pre_upload.set_end_screen", label: "Set the end screen", note: "Next video in the series + subscribe" },
    { key: "pre_upload.assign_playlist", label: "Assign the playlist", note: "Series playlists drive session time" },
    { key: "pre_upload.add_watch_next_cards", label: "Add cards to the watch-next video" },
    { key: "pre_upload.set_members_early_access", label: "Set members early access", note: "Early visibility for the member tier" },
    { key: "pre_upload.schedule_upload_time", label: "Schedule for SAT 7:00 AM PT", note: "Or WED 7:00 AM PT for a surprise upload" },
    { key: "pre_upload.update_calendar_scheduled", label: "Update Content Calendar → Scheduled" }
  ],
  publish_day: [
    { key: "publish_day.confirm_live_and_plays", label: "Confirm it went live and plays", note: "Check the thumbnail rendered, not a black frame" },
    { key: "publish_day.pin_comment", label: "Pin a comment", note: "A question that drives replies, or the Discord invite" },
    { key: "publish_day.post_discord_announcement", label: "Post the Discord #announcements ping", note: "One line on what goes wrong in the video" },
    { key: "publish_day.post_first_vertical_clip", label: "Post the first vertical clip", note: "Shorts + TikTok + Reels, native upload each" },
    { key: "publish_day.post_community_tab", label: "Post to Community tab", note: "Something that resolves in Discord" },
    { key: "publish_day.reply_first_comments", label: "Reply to the first 10–15 comments", note: "Early engagement compounds — this is not optional" },
    { key: "publish_day.log_video_log", label: "Log the video in the Video Log tab" }
  ],
  post_upload: [
    { key: "post_upload.check_ctr_24h", label: "Check CTR at 24h", note: "Below 4%? Swap the thumbnail — YouTube re-tests packaging" },
    { key: "post_upload.check_retention_48h", label: "Check the retention graph at 48h", note: "Find the biggest dip, name the cause" },
    { key: "post_upload.write_one_fix", label: "Write down the one fix for next video", note: "One specific change, not a vague resolution" },
    { key: "post_upload.post_clips_2_3", label: "Post clips 2 and 3 across the week", note: "Spread Monday/Wednesday for steady reach" },
    { key: "post_upload.feature_discord_pow", label: "Feature a Discord park of the week", note: "Your highest-value community ritual" },
    { key: "post_upload.log_7day_metrics", label: "Log 7-day views, CTR, avg % viewed, RPM", note: "Video Log tab" },
    { key: "post_upload.log_28day_final", label: "At 28 days: log final views + RPM", note: "Then compare formats and double down on winners" }
  ]
};

export const allProductionChecklistItemKeys = Object.values(productionChecklistItems).flatMap((items) => items.map((item) => item.key));

export const CalendarChecklistSchema = z.object({
  id: z.string().uuid(),
  calendarEntryId: z.string().uuid(),
  checkedItems: z.record(z.string(), z.boolean()).default({}),
  itemNotes: z.record(z.string(), z.string().max(500)).default({}),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const CalendarChecklistUpdateSchema = z.object({
  checkedItems: z.record(z.string(), z.boolean()).default({}),
  itemNotes: z.record(z.string(), z.string().max(500)).default({})
});

// ---- 14-Day Audit ----
export const auditDiagnosisStatusValues = ["ok", "warn", "fix"] as const;

export const AuditDiagnosisCardSchema = z.object({
  key: z.string(),
  label: z.string(),
  status: z.enum(auditDiagnosisStatusValues),
  message: z.string()
});

export const AuditDiagnosisSchema = z.object({
  cards: z.array(AuditDiagnosisCardSchema).default([]),
  crossMetric: z.array(AuditDiagnosisCardSchema).default([])
});

export const AuditRunSchema = z.object({
  id: z.string().uuid(),
  auditDate: isoDateSchema,
  ctrPercent: z.number().min(0).max(100),
  avgPercentViewed: z.number().min(0).max(100),
  viewsThisPeriod: z.number().int().min(0),
  viewsPriorPeriod: z.number().int().min(0),
  subsGainedThisPeriod: z.number().int(),
  subsGainedPriorPeriod: z.number().int(),
  shortsViewsThisPeriod: z.number().int().min(0).default(0),
  shortsViewsPriorPeriod: z.number().int().min(0).default(0),
  revenueThisPeriod: z.number().min(0).default(0),
  revenuePriorPeriod: z.number().min(0).default(0),
  notes: z.string().max(2000).default(""),
  diagnosis: AuditDiagnosisSchema.default({ cards: [], crossMetric: [] }),
  createdAt: z.string().datetime()
});

export const AuditRunDraftSchema = AuditRunSchema.omit({ id: true, createdAt: true });

export const AuditRunListSchema = z.array(AuditRunSchema);

export type AuditDiagnosisCard = z.infer<typeof AuditDiagnosisCardSchema>;
export type AuditDiagnosis = z.infer<typeof AuditDiagnosisSchema>;

export type AuditRunInput = {
  ctrPercent: number;
  avgPercentViewed: number;
  viewsThisPeriod: number;
  viewsPriorPeriod: number;
  subsGainedThisPeriod: number;
  subsGainedPriorPeriod: number;
  shortsViewsThisPeriod: number;
  shortsViewsPriorPeriod: number;
  revenueThisPeriod: number;
  revenuePriorPeriod: number;
};

// Ported verbatim (rule thresholds and copy) from the source channel-planning tool's runAudit().
export function diagnoseAudit(input: AuditRunInput): AuditDiagnosis {
  const {
    ctrPercent: ctr,
    avgPercentViewed: avg,
    viewsThisPeriod: v1,
    viewsPriorPeriod: v0,
    subsGainedThisPeriod: s1,
    subsGainedPriorPeriod: s0,
    shortsViewsThisPeriod: sh1,
    shortsViewsPriorPeriod: sh0,
    revenueThisPeriod: r1,
    revenuePriorPeriod: r0
  } = input;

  const cards: AuditDiagnosisCard[] = [];
  const crossMetric: AuditDiagnosisCard[] = [];

  if (ctr < 4) {
    cards.push({
      key: "ctr",
      label: "FIX — PACKAGING",
      status: "fix",
      message: `CTR ${ctr}% is below 4%. Rebuild titles/thumbnails with the matrix and repackage your 2 worst recent videos. See Packaging.`
    });
  } else if (ctr < 6) {
    cards.push({
      key: "ctr",
      label: "WATCH — CTR AVERAGE",
      status: "warn",
      message: `CTR ${ctr}% sits in the average band (4–6%). Tighten the matrix on every upload; aim for 6%+.`
    });
  } else {
    cards.push({ key: "ctr", label: "OK — CTR HEALTHY", status: "ok", message: `CTR ${ctr}% — strong. Keep the matrix discipline.` });
  }

  if (avg < 35) {
    cards.push({
      key: "retention",
      label: "FIX — HOOK/PACING",
      status: "fix",
      message: `Avg viewed ${avg}% is under 35%. Apply the 90-second SOP harder: cold-proof opening, earlier first payoff, tighter pattern breaks.`
    });
  } else {
    cards.push({
      key: "retention",
      label: "OK — RETENTION HEALTHY",
      status: "ok",
      message: `Avg viewed ${avg}% — above the 35% floor. Target 40–50%+.`
    });
  }

  const packagingAndRetentionHealthy = ctr >= 4 && avg >= 35;
  if (v1 < v0) {
    if (packagingAndRetentionHealthy) {
      crossMetric.push({
        key: "views",
        label: "FIX — TOPIC/DEMAND",
        status: "fix",
        message: `Packaging and retention are fine but views fell (${v1} vs ${v0}). Validate topics before recording and ride DLC/update spikes.`
      });
    } else {
      crossMetric.push({
        key: "views",
        label: "WATCH — VIEWS DOWN",
        status: "warn",
        message: `Views fell (${v1} vs ${v0}). Fix the flagged packaging/retention issue first — that is usually the cause.`
      });
    }
  } else {
    crossMetric.push({ key: "views", label: "OK — VIEWS GROWING", status: "ok", message: `${v1} vs ${v0} prior period.` });
  }

  if (s1 < s0) {
    cards.push({
      key: "subs",
      label: "WATCH — SUB GROWTH SLOWING",
      status: "warn",
      message: `+${s1} vs +${s0}. Check next-video handoffs and the channel page (banner, pinned video, unified thumbnails).`
    });
  } else {
    cards.push({ key: "subs", label: "OK — SUBS GROWING", status: "ok", message: `+${s1} vs +${s0} prior period.` });
  }

  if (sh1 > sh0 && s1 <= s0) {
    crossMetric.push({
      key: "bridge",
      label: "FIX — BRIDGE FAILURE",
      status: "fix",
      message: `Shorts views rose (${sh1} vs ${sh0}) but subs did not. Clips are too satisfying — cut before the resolution and strengthen the 35–50s bridge line.`
    });
  } else if (sh1 > sh0) {
    crossMetric.push({
      key: "bridge",
      label: "OK — BRIDGE WORKING",
      status: "ok",
      message: "Shorts growth is converting. Keep 2–3 clips per Saturday video."
    });
  }

  if (r1 < r0) {
    cards.push({
      key: "revenue",
      label: "FIX — MONETIZATION FRICTION",
      status: "fix",
      message: `Revenue fell ($${r1} vs $${r0}). Check mid-rolls on 8+ min videos, membership mentions, live tipping prompts, and the sponsor pipeline. Q1 seasonal dips are normal.`
    });
  } else {
    cards.push({ key: "revenue", label: "OK — REVENUE GROWING", status: "ok", message: `$${r1} vs $${r0} prior period.` });
  }

  return { cards, crossMetric };
}

// ---- Title Lab (pure, stateless scoring — no schema beyond CalendarEntrySchema.titleCandidates) ----
export const titleTensionWords = [
  "broke", "breaks", "broken", "impossible", "destroy", "destroyed", "ruined", "escape", "escaped", "worst", "best", "ranked", "ranking",
  "every", "never", "disaster", "why", "how i", "i built", "almost", "insane", "perfect", "extinct", "vs", "ultimate", "max", "failed",
  "mistake", "wrong", "secret", "hidden", "nobody", "everyone", "finally", "actually", "accidentally"
];

export const titleDescribeWords = [
  "ep.", "ep ", "episode", "part ", "pt.", "gameplay", "let's play", "lets play", "walkthrough", "playthrough", "update video", "vlog",
  "stream vod", "no commentary"
];

export const titleKeywords = [
  "jwe3", "jwe", "jurassic", "dino", "dinosaur", "rex", "raptor", "spino", "mosa", "park", "species", "dlc", "hybrid", "aviary", "lagoon",
  "carnivore", "herbivore", "indoraptor", "giganotosaurus", "pachy", "sauropod"
];

export type TitleScoreTag = "ok" | "warn" | "bad";
export type TitleScoreNote = { tag: TitleScoreTag; message: string };
export type TitleScoreResult = { title: string; score: number | null; notes: TitleScoreNote[] };

// Ported verbatim (thresholds and copy) from the source channel-planning tool's scoreTitle().
export function scoreTitle(rawTitle: string): TitleScoreResult {
  const title = rawTitle.trim();
  const notes: TitleScoreNote[] = [];

  if (!title) {
    return { title, score: null, notes: [] };
  }

  const low = title.toLowerCase();
  let score = 0;

  // length — 25 pts
  const length = title.length;
  if (length >= 40 && length <= 60) {
    score += 25;
    notes.push({ tag: "ok", message: `${length} chars — ideal` });
  } else if (length >= 30 && length < 40) {
    score += 17;
    notes.push({ tag: "warn", message: `${length} chars — room for more tension` });
  } else if (length > 60 && length <= 70) {
    score += 16;
    notes.push({ tag: "warn", message: `${length} chars — may truncate on mobile` });
  } else if (length < 30) {
    score += 6;
    notes.push({ tag: "bad", message: `${length} chars — too short, wasting the slot` });
  } else {
    score += 4;
    notes.push({ tag: "bad", message: `${length} chars — will be cut off in feeds` });
  }

  // keyword position — 20 pts
  const head = low.slice(0, 30);
  const keywordInHead = titleKeywords.find((keyword) => head.includes(keyword));
  const keywordAnywhere = titleKeywords.find((keyword) => low.includes(keyword));
  if (keywordInHead) {
    score += 20;
    notes.push({ tag: "ok", message: `"${keywordInHead}" early — good for search` });
  } else if (keywordAnywhere) {
    score += 9;
    notes.push({ tag: "warn", message: `keyword "${keywordAnywhere}" is late — move it earlier` });
  } else {
    notes.push({ tag: "bad", message: "no JWE3/species keyword — search traffic will miss this" });
  }

  // tension — 25 pts
  const tensionHits = titleTensionWords.filter((word) => low.includes(word));
  if (tensionHits.length >= 2) {
    score += 25;
    notes.push({ tag: "ok", message: `strong tension (${tensionHits.slice(0, 3).join(", ")})` });
  } else if (tensionHits.length === 1) {
    score += 16;
    notes.push({ tag: "warn", message: `some tension ("${tensionHits[0]}") — could push harder` });
  } else {
    notes.push({ tag: "bad", message: "no tension words — this describes instead of selling" });
  }

  // specificity — 15 pts (ignore digits that are part of a name like "JWE3" or "Ep4")
  const numericOnly = title.replace(/[A-Za-z]+\d+/g, "").replace(/\b(ep|episode|part|pt|day|week)\.?\s*\d+/gi, "");
  if (/\d/.test(numericOnly)) {
    const isBigNumber = /(\d[\d,.]{2,})|\$\s*\d|\d\s*%|\d+\s*(billion|million|thousand)|\b\d+k\b/i.test(numericOnly);
    score += isBigNumber ? 15 : 9;
    notes.push({
      tag: isBigNumber ? "ok" : "warn",
      message: isBigNumber ? "concrete number — credibility + awe" : "has a number, but not a striking one"
    });
  } else {
    notes.push({ tag: "warn", message: "no number — a concrete figure adds scale" });
  }

  // formatting — 15 pts
  let formatScore = 15;
  const letters = title.replace(/[^A-Za-z]/g, "");
  const caps = title.replace(/[^A-Z]/g, "").length;
  if (letters.length && caps / letters.length > 0.6) {
    formatScore -= 9;
    notes.push({ tag: "bad", message: "mostly ALL-CAPS — reads as shouting" });
  }
  if (/[!?]{2,}/.test(title)) {
    formatScore -= 5;
    notes.push({ tag: "bad", message: "repeated !! or ?? — clickbait signal" });
  }
  const emojiCount = (title.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu) ?? []).length;
  if (emojiCount > 1) {
    formatScore -= 4;
    notes.push({ tag: "warn", message: `${emojiCount} emoji — keep to at most one` });
  }
  score += Math.max(0, formatScore);

  // penalties
  const describeHit = titleDescribeWords.find((word) => low.includes(word));
  if (describeHit) {
    score -= 18;
    notes.push({ tag: "bad", message: `contains "${describeHit.trim()}" — episode labels tank browse CTR` });
  }

  return { title, score: Math.max(0, Math.min(100, Math.round(score))), notes };
}

export function scoreTitles(titles: string[]): TitleScoreResult[] {
  return titles.map((title) => scoreTitle(title));
}

export const ApiMetaSchema = z.object({
  requestId: z.string().optional()
});

export const ApiErrorSchema = z.object({
  success: z.literal(false).default(false),
  error: z.string(),
  code: z.string().optional(),
  details: z.unknown().optional(),
  meta: ApiMetaSchema.optional()
});

export const ApiSuccessSchema = z.object({
  success: z.literal(true),
  data: z.unknown(),
  meta: ApiMetaSchema.optional()
});

export const ApiResponseSchema = z.union([ApiSuccessSchema, ApiErrorSchema]);

export type ScheduleDay = (typeof scheduleDayValues)[number];
export type ScheduleEntryType = (typeof scheduleEntryTypeValues)[number];
export type ScheduleEntry = z.infer<typeof ScheduleEntrySchema>;
export type ScheduleEntryDraft = z.infer<typeof ScheduleEntryDraftSchema>;
export type ScheduleEntryDraftInput = z.input<typeof ScheduleEntryDraftSchema>;
export type BuildRequestEraType = (typeof buildRequestEraTypeValues)[number];
export type BuildRequestStatus = (typeof buildRequestStatusValues)[number];
export type BuildRequest = z.infer<typeof BuildRequestSchema>;
export type BuildRequestDraft = z.infer<typeof BuildRequestDraftSchema>;
export type BuildRequestDraftInput = z.input<typeof BuildRequestDraftSchema>;
export type BuildRequestStatusUpdate = z.infer<typeof BuildRequestStatusUpdateSchema>;
export type Link = z.infer<typeof LinkSchema>;
export type Upload = z.infer<typeof UploadSchema>;
export type UploadList = z.infer<typeof UploadListSchema>;
export type SiteMetadata = z.infer<typeof SiteMetadataSchema>;
export type SiteBranding = z.infer<typeof SiteBrandingSchema>;
export type Site = z.infer<typeof SiteSchema>;
export type SiteDraft = z.infer<typeof SiteDraftSchema>;
export type SiteDraftInput = z.input<typeof SiteDraftSchema>;
export type ApiMeta = z.infer<typeof ApiMetaSchema>;
export type ApiError = z.infer<typeof ApiErrorSchema>;
export type ApiSuccess = z.infer<typeof ApiSuccessSchema>;
export type ApiResponse = z.infer<typeof ApiResponseSchema>;
export type AuditRun = z.infer<typeof AuditRunSchema>;
export type AuditRunDraft = z.infer<typeof AuditRunDraftSchema>;
export type AuditRunDraftInput = z.input<typeof AuditRunDraftSchema>;
export type WeeklyRhythmDay = (typeof weeklyRhythmDayValues)[number];
export type WeeklyRhythmState = z.infer<typeof WeeklyRhythmStateSchema>;
export type WeeklyRhythmUpdate = z.infer<typeof WeeklyRhythmUpdateSchema>;
export type WeeklyRhythmUpdateInput = z.input<typeof WeeklyRhythmUpdateSchema>;
export type ProductionChecklistPhase = (typeof productionChecklistPhaseValues)[number];
export type CalendarChecklist = z.infer<typeof CalendarChecklistSchema>;
export type CalendarChecklistUpdate = z.infer<typeof CalendarChecklistUpdateSchema>;
export type CalendarChecklistUpdateInput = z.input<typeof CalendarChecklistUpdateSchema>;
export type ChecklistItem = z.infer<typeof ChecklistItemSchema>;
export type ChecklistItemDraft = z.infer<typeof ChecklistItemDraftSchema>;
export type ChecklistItemDraftInput = z.input<typeof ChecklistItemDraftSchema>;
export type ChecklistItemUpdate = z.infer<typeof ChecklistItemUpdateSchema>;
export type ChecklistItemUpdateInput = z.input<typeof ChecklistItemUpdateSchema>;
