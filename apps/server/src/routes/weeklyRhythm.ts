import { WeeklyRhythmResetSchema, WeeklyRhythmUpdateSchema } from "@fullstack-template/schema";
import { desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { weeklyRhythmState } from "../../db/schema.ts";
import { db } from "../db.ts";
import { fail, ok } from "../http/response.ts";
import { toWeeklyRhythmState } from "../mappers.ts";
import { requireAdminKey } from "../middleware/admin.ts";
import type { AppVariables } from "../types.ts";

export const weeklyRhythmRoute = new Hono<{ Variables: AppVariables }>();
weeklyRhythmRoute.use("*", requireAdminKey);

function mostRecentSaturdayIso(): string {
  const now = new Date();
  const diff = (now.getDay() + 1) % 7; // days since the most recent Saturday (today counts as 0 if it IS Saturday)
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

// Singleton is enforced at the application level, not the DB: the most-recently-created
// row is treated as "the" state, and a fresh one is only ever created when none exists yet.
async function getOrCreateSingleton() {
  const [existing] = await db.select().from(weeklyRhythmState).orderBy(desc(weeklyRhythmState.createdAt)).limit(1);
  if (existing) {
    return existing;
  }

  const [created] = await db
    .insert(weeklyRhythmState)
    .values({ weekStartDate: mostRecentSaturdayIso(), checkedItems: {}, sundayStreamChecked: {} })
    .returning();

  if (!created) {
    throw new Error("Failed to initialize weekly rhythm state");
  }

  return created;
}

weeklyRhythmRoute.get("/", async (c) => {
  const row = await getOrCreateSingleton();
  return ok(c, toWeeklyRhythmState(row));
});

weeklyRhythmRoute.put("/", async (c) => {
  const body = await c.req.json();
  const parsed = WeeklyRhythmUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return fail(c, "Invalid weekly rhythm update", 400, { code: "WEEKLY_RHYTHM_INVALID", details: parsed.error.flatten() });
  }

  const current = await getOrCreateSingleton();
  const [row] = await db
    .update(weeklyRhythmState)
    .set({ checkedItems: parsed.data.checkedItems, sundayStreamChecked: parsed.data.sundayStreamChecked, updatedAt: new Date() })
    .where(eq(weeklyRhythmState.id, current.id))
    .returning();

  if (!row) {
    return fail(c, "Weekly rhythm state not found", 404, { code: "WEEKLY_RHYTHM_NOT_FOUND" });
  }

  return ok(c, toWeeklyRhythmState(row));
});

weeklyRhythmRoute.post("/reset", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = WeeklyRhythmResetSchema.safeParse({ weekStartDate: mostRecentSaturdayIso(), ...body });

  if (!parsed.success) {
    return fail(c, "Invalid weekly rhythm reset payload", 400, { code: "WEEKLY_RHYTHM_INVALID", details: parsed.error.flatten() });
  }

  const current = await getOrCreateSingleton();
  const [row] = await db
    .update(weeklyRhythmState)
    .set({ weekStartDate: parsed.data.weekStartDate, checkedItems: {}, sundayStreamChecked: {}, updatedAt: new Date() })
    .where(eq(weeklyRhythmState.id, current.id))
    .returning();

  if (!row) {
    return fail(c, "Weekly rhythm state not found", 404, { code: "WEEKLY_RHYTHM_NOT_FOUND" });
  }

  return ok(c, toWeeklyRhythmState(row));
});
