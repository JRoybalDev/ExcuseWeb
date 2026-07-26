import {
  AuditDiagnosisSchema,
  SiteBrandingSchema,
  SiteMetadataSchema,
  type AuditRun,
  type CalendarChecklist,
  type CalendarEntry,
  type ScheduleEntry,
  type Site,
  type Upload,
  type WeeklyRhythmState
} from "@fullstack-template/schema";
import type { AuditRunRow, CalendarChecklistRow, CalendarEntryRow, ScheduleEntryRow, SiteRow, UploadRow, WeeklyRhythmStateRow } from "../db/schema.ts";

export function toSite(row: SiteRow): Site {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    heroImageUrl: row.heroImageUrl,
    metadata: SiteMetadataSchema.parse(row.metadata),
    branding: SiteBrandingSchema.parse(row.branding),
    links: row.links,
    published: row.published,
    updatedAt: row.updatedAt.toISOString()
  };
}

export function toScheduleEntry(row: ScheduleEntryRow): ScheduleEntry {
  return {
    id: row.id,
    dayOfWeek: row.dayOfWeek,
    time: row.time,
    type: row.type,
    title: row.title,
    thumbnailUrl: row.thumbnailUrl,
    uploadId: row.uploadId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  };
}

export function toAuditRun(row: AuditRunRow): AuditRun {
  return {
    id: row.id,
    auditDate: row.auditDate,
    ctrPercent: row.ctrPercent,
    avgPercentViewed: row.avgPercentViewed,
    viewsThisPeriod: row.viewsThisPeriod,
    viewsPriorPeriod: row.viewsPriorPeriod,
    subsGainedThisPeriod: row.subsGainedThisPeriod,
    subsGainedPriorPeriod: row.subsGainedPriorPeriod,
    shortsViewsThisPeriod: row.shortsViewsThisPeriod,
    shortsViewsPriorPeriod: row.shortsViewsPriorPeriod,
    revenueThisPeriod: row.revenueThisPeriod,
    revenuePriorPeriod: row.revenuePriorPeriod,
    notes: row.notes,
    diagnosis: AuditDiagnosisSchema.parse(row.diagnosis),
    createdAt: row.createdAt.toISOString()
  };
}

export function toWeeklyRhythmState(row: WeeklyRhythmStateRow): WeeklyRhythmState {
  return {
    id: row.id,
    weekStartDate: row.weekStartDate,
    checkedItems: row.checkedItems,
    sundayStreamChecked: row.sundayStreamChecked,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  };
}

export function toCalendarEntry(row: CalendarEntryRow): CalendarEntry {
  return {
    id: row.id,
    uploadDate: row.uploadDate,
    slot: row.slot,
    title: row.title,
    priority: row.priority,
    status: row.status,
    packagingDone: row.packagingDone,
    expectedClipCount: row.expectedClipCount,
    notes: row.notes,
    titleCandidates: row.titleCandidates,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  };
}

export function toCalendarChecklist(row: CalendarChecklistRow): CalendarChecklist {
  return {
    id: row.id,
    calendarEntryId: row.calendarEntryId,
    checkedItems: row.checkedItems,
    itemNotes: row.itemNotes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  };
}

export function toUpload(row: UploadRow): Upload {
  return {
    id: row.id,
    filename: row.filename,
    url: row.url,
    thumbnailUrl: row.thumbnailUrl,
    storageProvider: row.storageProvider,
    storageKey: row.storageKey,
    storageResourceType: row.storageResourceType,
    contentType: row.contentType,
    size: row.size,
    createdAt: row.createdAt.toISOString()
  };
}
