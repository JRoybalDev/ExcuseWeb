import { SiteBrandingSchema, SiteMetadataSchema, type ScheduleEntry, type Site, type Upload } from "@fullstack-template/schema";
import type { ScheduleEntryRow, SiteRow, UploadRow } from "../db/schema.ts";

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
