import { ScheduleEntryDraftSchema, scheduleDayValues, type ScheduleDay } from "@fullstack-template/schema";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { scheduleEntries, uploads } from "../../db/schema";
import { db } from "../db";
import { fail, ok } from "../http/response";
import { logger } from "../logger";
import { toScheduleEntry } from "../mappers";
import { requireAdminKey } from "../middleware/admin";
import { deleteStoredUpload } from "../storage/uploadStorage";
import type { AppVariables } from "../types";

export const scheduleRoute = new Hono<{ Variables: AppVariables }>();

function sortByDay<T extends { dayOfWeek: string }>(rows: T[]) {
  return [...rows].sort((a, b) => scheduleDayValues.indexOf(a.dayOfWeek as (typeof scheduleDayValues)[number]) - scheduleDayValues.indexOf(b.dayOfWeek as (typeof scheduleDayValues)[number]));
}

async function findByDay(dayOfWeek: ScheduleDay) {
  const [row] = await db.select().from(scheduleEntries).where(eq(scheduleEntries.dayOfWeek, dayOfWeek)).limit(1);
  return row;
}

async function deleteUploadById(uploadId: string) {
  const [upload] = await db.delete(uploads).where(eq(uploads.id, uploadId)).returning();

  if (!upload) {
    return;
  }

  await deleteStoredUpload(upload).catch((error) => {
    logger.warn("schedule.thumbnail_cleanup_failed", { error, uploadId });
  });
}

scheduleRoute.get("/", async (c) => {
  const rows = await db.select().from(scheduleEntries);
  return ok(c, sortByDay(rows.map(toScheduleEntry)));
});

scheduleRoute.post("/", requireAdminKey, async (c) => {
  const body = await c.req.json();
  const parsed = ScheduleEntryDraftSchema.safeParse(body);

  if (!parsed.success) {
    return fail(c, "Invalid schedule entry payload", 400, { code: "SCHEDULE_ENTRY_INVALID", details: parsed.error.flatten() });
  }

  const existing = await findByDay(parsed.data.dayOfWeek);
  if (existing) {
    return fail(c, "That day already has a scheduled entry. Edit or delete it first.", 409, { code: "SCHEDULE_DAY_TAKEN" });
  }

  const [row] = await db
    .insert(scheduleEntries)
    .values({ ...parsed.data, updatedAt: new Date() })
    .returning();

  if (!row) {
    return fail(c, "Schedule entry was not saved", 500, { code: "SCHEDULE_ENTRY_SAVE_FAILED" });
  }

  return ok(c, toScheduleEntry(row), 201);
});

scheduleRoute.put("/:id", requireAdminKey, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const parsed = ScheduleEntryDraftSchema.safeParse(body);

  if (!parsed.success) {
    return fail(c, "Invalid schedule entry payload", 400, { code: "SCHEDULE_ENTRY_INVALID", details: parsed.error.flatten() });
  }

  const existing = await findByDay(parsed.data.dayOfWeek);
  if (existing && existing.id !== id) {
    return fail(c, "That day already has a scheduled entry. Edit or delete it first.", 409, { code: "SCHEDULE_DAY_TAKEN" });
  }

  const [before] = await db.select().from(scheduleEntries).where(eq(scheduleEntries.id, id)).limit(1);

  if (!before) {
    return fail(c, "Schedule entry not found", 404, { code: "SCHEDULE_ENTRY_NOT_FOUND" });
  }

  const [row] = await db
    .update(scheduleEntries)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(scheduleEntries.id, id))
    .returning();

  if (!row) {
    return fail(c, "Schedule entry not found", 404, { code: "SCHEDULE_ENTRY_NOT_FOUND" });
  }

  if (before.uploadId && before.uploadId !== row.uploadId) {
    await deleteUploadById(before.uploadId);
  }

  return ok(c, toScheduleEntry(row));
});

scheduleRoute.delete("/:id", requireAdminKey, async (c) => {
  const id = c.req.param("id");
  const [deleted] = await db.delete(scheduleEntries).where(eq(scheduleEntries.id, id)).returning();

  if (!deleted) {
    return fail(c, "Schedule entry not found", 404, { code: "SCHEDULE_ENTRY_NOT_FOUND" });
  }

  if (deleted.uploadId) {
    await deleteUploadById(deleted.uploadId);
  }

  return ok(c, toScheduleEntry(deleted));
});
