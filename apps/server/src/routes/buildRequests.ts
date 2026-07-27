import { BuildRequestDraftSchema, BuildRequestStatusUpdateSchema } from "@fullstack-template/schema";
import { desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { buildRequests, uploads } from "../../db/schema.ts";
import { db } from "../db.ts";
import { env } from "../env.ts";
import { fail, ok } from "../http/response.ts";
import { logger } from "../logger.ts";
import { toBuildRequest, toUpload } from "../mappers.ts";
import { requireAdminKey } from "../middleware/admin.ts";
import { createRateLimit } from "../middleware/rateLimit.ts";
import { deleteStoredUpload, storeUpload } from "../storage/uploadStorage.ts";
import type { AppVariables } from "../types.ts";

export const buildRequestsRoute = new Hono<{ Variables: AppVariables }>();

const submitRateLimit = createRateLimit({ name: "build-requests", windowSeconds: env.buildRequestRateLimitWindow, max: env.buildRequestRateLimitMax });
const uploadRateLimit = createRateLimit({ name: "build-requests-upload", windowSeconds: env.buildRequestUploadRateLimitWindow, max: env.buildRequestUploadRateLimitMax });

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

async function deleteUploadById(uploadId: string) {
  const [upload] = await db.delete(uploads).where(eq(uploads.id, uploadId)).returning();

  if (!upload) {
    return;
  }

  await deleteStoredUpload(upload).catch((error) => {
    logger.warn("build_requests.image_cleanup_failed", { error, uploadId });
  });
}

buildRequestsRoute.get("/", requireAdminKey, async (c) => {
  const rows = await db.select().from(buildRequests).orderBy(desc(buildRequests.createdAt));
  return ok(c, rows.map(toBuildRequest));
});

buildRequestsRoute.post("/", submitRateLimit, async (c) => {
  const body = await c.req.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return fail(c, "Invalid build request payload", 400, { code: "BUILD_REQUEST_INVALID" });
  }

  // Honeypot: real visitors never fill this hidden field in.
  const honeypot = (body as Record<string, unknown>).company;
  if (typeof honeypot === "string" && honeypot.trim().length > 0) {
    return fail(c, "Invalid submission", 400, { code: "SPAM_DETECTED" });
  }

  const parsed = BuildRequestDraftSchema.safeParse(body);

  if (!parsed.success) {
    return fail(c, "Invalid build request payload", 400, { code: "BUILD_REQUEST_INVALID", details: parsed.error.flatten() });
  }

  let imageUrl = "";

  if (parsed.data.uploadId) {
    const [upload] = await db.select().from(uploads).where(eq(uploads.id, parsed.data.uploadId)).limit(1);

    if (!upload) {
      return fail(c, "Reference image not found. Upload it again.", 400, { code: "BUILD_REQUEST_UPLOAD_NOT_FOUND" });
    }

    imageUrl = upload.url;
  }

  const [row] = await db
    .insert(buildRequests)
    .values({
      shoutoutName: parsed.data.shoutoutName,
      buildIdea: parsed.data.buildIdea,
      eraType: parsed.data.eraType,
      specificMap: parsed.data.specificMap,
      specificAdditions: parsed.data.specificAdditions,
      imageUrl,
      uploadId: parsed.data.uploadId,
      status: "new",
      updatedAt: new Date()
    })
    .returning();

  if (!row) {
    return fail(c, "Build request was not saved", 500, { code: "BUILD_REQUEST_SAVE_FAILED" });
  }

  return ok(c, toBuildRequest(row), 201);
});

buildRequestsRoute.post("/upload", uploadRateLimit, async (c) => {
  const form = await c.req.formData().catch(() => null);
  const file = form?.get("file");

  if (!file || typeof file === "string" || file.size === 0) {
    return fail(c, "Expected an image file", 400, { code: "BUILD_REQUEST_UPLOAD_FILE_REQUIRED" });
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return fail(c, "Only JPEG, PNG, WEBP, or GIF images are allowed", 400, { code: "BUILD_REQUEST_UPLOAD_TYPE_INVALID" });
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return fail(c, "Image must be 8MB or smaller", 400, { code: "BUILD_REQUEST_UPLOAD_TOO_LARGE" });
  }

  const stored = await storeUpload(file, `${env.cloudinaryFolder}/request_images`);

  const [upload] = await db
    .insert(uploads)
    .values({
      filename: file.name,
      url: stored.url,
      thumbnailUrl: stored.thumbnailUrl,
      storageProvider: stored.storageProvider,
      storageKey: stored.storageKey,
      storageResourceType: stored.storageResourceType,
      contentType: file.type,
      size: file.size
    })
    .returning();

  if (!upload) {
    await deleteStoredUpload(stored);
    return fail(c, "Upload was not saved", 500, { code: "BUILD_REQUEST_UPLOAD_SAVE_FAILED" });
  }

  return ok(c, toUpload(upload), 201);
});

buildRequestsRoute.patch("/:id", requireAdminKey, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json().catch(() => null);
  const parsed = BuildRequestStatusUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return fail(c, "Invalid status payload", 400, { code: "BUILD_REQUEST_STATUS_INVALID", details: parsed.error.flatten() });
  }

  const [row] = await db.update(buildRequests).set({ status: parsed.data.status, updatedAt: new Date() }).where(eq(buildRequests.id, id)).returning();

  if (!row) {
    return fail(c, "Build request not found", 404, { code: "BUILD_REQUEST_NOT_FOUND" });
  }

  return ok(c, toBuildRequest(row));
});

buildRequestsRoute.delete("/:id", requireAdminKey, async (c) => {
  const id = c.req.param("id");
  const [deleted] = await db.delete(buildRequests).where(eq(buildRequests.id, id)).returning();

  if (!deleted) {
    return fail(c, "Build request not found", 404, { code: "BUILD_REQUEST_NOT_FOUND" });
  }

  if (deleted.uploadId) {
    await deleteUploadById(deleted.uploadId);
  }

  return ok(c, toBuildRequest(deleted));
});
