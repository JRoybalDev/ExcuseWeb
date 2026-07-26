import { CalendarAutoFillInputSchema, CalendarChecklistUpdateSchema, CalendarEntryDraftSchema } from "@fullstack-template/schema";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { calendarChecklists, calendarEntries } from "../../db/schema.ts";
import { db } from "../db.ts";
import { fail, ok } from "../http/response.ts";
import { toCalendarChecklist, toCalendarEntry } from "../mappers.ts";
import { requireAdminKey } from "../middleware/admin.ts";
import type { AppVariables } from "../types.ts";

export const calendarRoute = new Hono<{ Variables: AppVariables }>();
calendarRoute.use("*", requireAdminKey);

function isoOf(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Always strictly in the future — never returns "today", matching the source tool's auto-fill helper.
function nextSaturdayIso(fromIso?: string): string {
  const base = fromIso ? new Date(`${fromIso}T12:00:00`) : new Date();
  const day = base.getDay();
  let add = (6 - day + 7) % 7;
  if (add === 0) {
    add = 7;
  }
  const d = new Date(base);
  d.setDate(d.getDate() + add);
  return isoOf(d);
}

calendarRoute.get("/", async (c) => {
  const rows = await db.select().from(calendarEntries);
  const entries = rows.map(toCalendarEntry).sort((a, b) => a.uploadDate.localeCompare(b.uploadDate));
  return ok(c, entries);
});

calendarRoute.post("/", async (c) => {
  const body = await c.req.json();
  const parsed = CalendarEntryDraftSchema.safeParse(body);

  if (!parsed.success) {
    return fail(c, "Invalid calendar entry payload", 400, { code: "CALENDAR_ENTRY_INVALID", details: parsed.error.flatten() });
  }

  const [row] = await db
    .insert(calendarEntries)
    .values({ ...parsed.data, updatedAt: new Date() })
    .returning();

  if (!row) {
    return fail(c, "Calendar entry was not saved", 500, { code: "CALENDAR_ENTRY_SAVE_FAILED" });
  }

  return ok(c, toCalendarEntry(row), 201);
});

calendarRoute.post("/auto-fill", async (c) => {
  const body = await c.req.json();
  const parsed = CalendarAutoFillInputSchema.safeParse(body);

  if (!parsed.success) {
    return fail(c, "Invalid auto-fill request", 400, { code: "CALENDAR_AUTO_FILL_INVALID", details: parsed.error.flatten() });
  }

  const { count, startAfter } = parsed.data;

  const existingRows = await db.select({ uploadDate: calendarEntries.uploadDate }).from(calendarEntries).where(eq(calendarEntries.slot, "saturday_main"));
  const existingDates = new Set(existingRows.map((row) => row.uploadDate));

  const created = [];
  const skipped: string[] = [];
  let cursor = nextSaturdayIso(startAfter);

  while (created.length < count) {
    if (existingDates.has(cursor)) {
      skipped.push(cursor);
    } else {
      const [row] = await db
        .insert(calendarEntries)
        .values({
          uploadDate: cursor,
          slot: "saturday_main",
          title: "",
          priority: "normal",
          status: "idea",
          packagingDone: false,
          expectedClipCount: 0,
          notes: "",
          titleCandidates: [],
          updatedAt: new Date()
        })
        .returning();

      if (row) {
        created.push(row);
        existingDates.add(cursor);
      }
    }
    cursor = nextSaturdayIso(cursor);
  }

  return ok(c, { created: created.map(toCalendarEntry), skipped });
});

calendarRoute.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const parsed = CalendarEntryDraftSchema.safeParse(body);

  if (!parsed.success) {
    return fail(c, "Invalid calendar entry payload", 400, { code: "CALENDAR_ENTRY_INVALID", details: parsed.error.flatten() });
  }

  const [row] = await db
    .update(calendarEntries)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(calendarEntries.id, id))
    .returning();

  if (!row) {
    return fail(c, "Calendar entry not found", 404, { code: "CALENDAR_ENTRY_NOT_FOUND" });
  }

  return ok(c, toCalendarEntry(row));
});

calendarRoute.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const [deleted] = await db.delete(calendarEntries).where(eq(calendarEntries.id, id)).returning();

  if (!deleted) {
    return fail(c, "Calendar entry not found", 404, { code: "CALENDAR_ENTRY_NOT_FOUND" });
  }

  return ok(c, toCalendarEntry(deleted));
});

calendarRoute.get("/:id/checklist", async (c) => {
  const id = c.req.param("id");
  const [existing] = await db.select().from(calendarChecklists).where(eq(calendarChecklists.calendarEntryId, id)).limit(1);

  if (existing) {
    return ok(c, toCalendarChecklist(existing));
  }

  const [entry] = await db.select().from(calendarEntries).where(eq(calendarEntries.id, id)).limit(1);
  if (!entry) {
    return fail(c, "Calendar entry not found", 404, { code: "CALENDAR_ENTRY_NOT_FOUND" });
  }

  const [created] = await db.insert(calendarChecklists).values({ calendarEntryId: id, checkedItems: {}, itemNotes: {} }).returning();
  if (!created) {
    return fail(c, "Checklist was not created", 500, { code: "CALENDAR_CHECKLIST_CREATE_FAILED" });
  }

  return ok(c, toCalendarChecklist(created));
});

calendarRoute.put("/:id/checklist", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const parsed = CalendarChecklistUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return fail(c, "Invalid checklist payload", 400, { code: "CALENDAR_CHECKLIST_INVALID", details: parsed.error.flatten() });
  }

  const [existing] = await db.select().from(calendarChecklists).where(eq(calendarChecklists.calendarEntryId, id)).limit(1);

  if (!existing) {
    const [entry] = await db.select().from(calendarEntries).where(eq(calendarEntries.id, id)).limit(1);
    if (!entry) {
      return fail(c, "Calendar entry not found", 404, { code: "CALENDAR_ENTRY_NOT_FOUND" });
    }

    const [created] = await db
      .insert(calendarChecklists)
      .values({ calendarEntryId: id, checkedItems: parsed.data.checkedItems, itemNotes: parsed.data.itemNotes })
      .returning();

    if (!created) {
      return fail(c, "Checklist was not created", 500, { code: "CALENDAR_CHECKLIST_CREATE_FAILED" });
    }

    return ok(c, toCalendarChecklist(created));
  }

  const [row] = await db
    .update(calendarChecklists)
    .set({ checkedItems: parsed.data.checkedItems, itemNotes: parsed.data.itemNotes, updatedAt: new Date() })
    .where(eq(calendarChecklists.id, existing.id))
    .returning();

  if (!row) {
    return fail(c, "Checklist not found", 404, { code: "CALENDAR_CHECKLIST_NOT_FOUND" });
  }

  return ok(c, toCalendarChecklist(row));
});
