import { ChecklistItemDraftSchema, ChecklistItemUpdateSchema } from "@fullstack-template/schema";
import { asc, eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import { checklistItems } from "../../db/schema.ts";
import { db } from "../db.ts";
import { fail, ok } from "../http/response.ts";
import { toChecklistItem } from "../mappers.ts";
import { requireAdminKey } from "../middleware/admin.ts";
import type { AppVariables } from "../types.ts";

export const checklistItemsRoute = new Hono<{ Variables: AppVariables }>();
checklistItemsRoute.use("*", requireAdminKey);

checklistItemsRoute.get("/", async (c) => {
  const rows = await db
    .select()
    .from(checklistItems)
    .orderBy(asc(checklistItems.groupKey), asc(checklistItems.sortOrder), asc(checklistItems.createdAt));
  return ok(c, rows.map(toChecklistItem));
});

checklistItemsRoute.post("/", async (c) => {
  const body = await c.req.json();
  const parsed = ChecklistItemDraftSchema.safeParse(body);

  if (!parsed.success) {
    return fail(c, "Invalid checklist item payload", 400, { code: "CHECKLIST_ITEM_INVALID", details: parsed.error.flatten() });
  }

  const maxSortRows = await db
    .select({ maxSort: sql<number>`coalesce(max(${checklistItems.sortOrder}), -1)` })
    .from(checklistItems)
    .where(eq(checklistItems.groupKey, parsed.data.groupKey));

  const [row] = await db
    .insert(checklistItems)
    .values({ ...parsed.data, sortOrder: Number(maxSortRows[0]?.maxSort ?? -1) + 1 })
    .returning();

  if (!row) {
    return fail(c, "Checklist item was not saved", 500, { code: "CHECKLIST_ITEM_SAVE_FAILED" });
  }

  return ok(c, toChecklistItem(row), 201);
});

checklistItemsRoute.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const parsed = ChecklistItemUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return fail(c, "Invalid checklist item payload", 400, { code: "CHECKLIST_ITEM_INVALID", details: parsed.error.flatten() });
  }

  const [row] = await db
    .update(checklistItems)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(checklistItems.id, id))
    .returning();

  if (!row) {
    return fail(c, "Checklist item not found", 404, { code: "CHECKLIST_ITEM_NOT_FOUND" });
  }

  return ok(c, toChecklistItem(row));
});

checklistItemsRoute.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const [deleted] = await db.delete(checklistItems).where(eq(checklistItems.id, id)).returning();

  if (!deleted) {
    return fail(c, "Checklist item not found", 404, { code: "CHECKLIST_ITEM_NOT_FOUND" });
  }

  return ok(c, toChecklistItem(deleted));
});
