import { AuditRunDraftSchema } from "@fullstack-template/schema";
import { desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { auditRuns } from "../../db/schema.ts";
import { db } from "../db.ts";
import { fail, ok } from "../http/response.ts";
import { toAuditRun } from "../mappers.ts";
import { requireAdminKey } from "../middleware/admin.ts";
import type { AppVariables } from "../types.ts";

export const auditRoute = new Hono<{ Variables: AppVariables }>();
auditRoute.use("*", requireAdminKey);

// Audit runs are immutable historical records — create + delete only, no update.
// The diagnosis is computed client-side and stored as-is so past runs stay stable
// even if the diagnosis rules are tuned later.

auditRoute.get("/", async (c) => {
  const rows = await db.select().from(auditRuns).orderBy(desc(auditRuns.auditDate), desc(auditRuns.createdAt));
  return ok(c, rows.map(toAuditRun));
});

auditRoute.post("/", async (c) => {
  const body = await c.req.json();
  const parsed = AuditRunDraftSchema.safeParse(body);

  if (!parsed.success) {
    return fail(c, "Invalid audit run payload", 400, { code: "AUDIT_RUN_INVALID", details: parsed.error.flatten() });
  }

  const [row] = await db.insert(auditRuns).values(parsed.data).returning();

  if (!row) {
    return fail(c, "Audit run was not saved", 500, { code: "AUDIT_RUN_SAVE_FAILED" });
  }

  return ok(c, toAuditRun(row), 201);
});

auditRoute.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const [deleted] = await db.delete(auditRuns).where(eq(auditRuns.id, id)).returning();

  if (!deleted) {
    return fail(c, "Audit run not found", 404, { code: "AUDIT_RUN_NOT_FOUND" });
  }

  return ok(c, toAuditRun(deleted));
});
