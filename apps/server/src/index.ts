import { serveStatic } from "hono/bun";
import { cors } from "hono/cors";
import { Hono } from "hono";
import { auth, authInitError } from "./auth.ts";
import { seedBootstrapAdmin } from "./bootstrapAdmin.ts";
import { env } from "./env.ts";
import { fail, ok } from "./http/response.ts";
import { logger } from "./logger.ts";
import { requestContext } from "./middleware/requestContext.ts";
import { securityHeaders } from "./middleware/securityHeaders.ts";
import { openApiHtml, openApiSpec } from "./openapi.ts";
import { adminRoute } from "./routes/admin.ts";
import { auditRoute } from "./routes/audit.ts";
import { calendarRoute } from "./routes/calendar.ts";
import { checklistItemsRoute } from "./routes/checklistItems.ts";
import { scheduleRoute } from "./routes/schedule.ts";
import { sitesRoute } from "./routes/sites.ts";
import { uploadsRoute } from "./routes/uploads.ts";
import { weeklyRhythmRoute } from "./routes/weeklyRhythm.ts";
import { youtubeRoute } from "./routes/youtube.ts";
import { createRateLimit } from "./middleware/rateLimit.ts";
import { seedDefaultChecklistItems } from "./seedChecklistItems.ts";
import type { AppVariables } from "./types.ts";

const app = new Hono<{ Variables: AppVariables }>();
const adminRateLimit = createRateLimit({ name: "admin", windowSeconds: env.adminRateLimitWindow, max: env.adminRateLimitMax });
const uploadRateLimit = createRateLimit({ name: "uploads", windowSeconds: env.uploadRateLimitWindow, max: env.uploadRateLimitMax });

void seedBootstrapAdmin().catch((error) => {
  logger.error("bootstrap_admin.failed", {
    error
  });
});

void seedDefaultChecklistItems().catch((error) => {
  logger.error("checklist_items.seed_failed", {
    error
  });
});

app.use("*", requestContext);
app.use("*", securityHeaders);

app.use(
  "*",
  cors({
    origin: env.corsOrigins,
    allowHeaders: ["Content-Type", "X-Admin-Key"],
    allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
    credentials: true
  })
);

app.get("/health", (c) =>
  ok(c, {
    ok: true,
    service: "fullstack-template-api",
    authInitError
  })
);

app.get("/openapi.json", (c) => c.json(openApiSpec));

app.get("/docs", (c) => c.html(openApiHtml()));

app.get("/", (c) =>
  ok(c, {
    ok: true,
    service: "fullstack-template-api",
    routes: {
      health: "/health",
      publicSites: "/api/sites",
      adminSession: "/api/admin/session",
      adminSites: "/api/admin/sites",
      uploads: "/api/uploads",
      openapi: "/openapi.json",
      docs: "/docs"
    }
  })
);

app.get("/api/auth/config", (c) =>
  ok(c, {
    authMode: env.authMode,
    signupMode: env.betterAuthSignupMode
  })
);

app.on(["GET", "POST"], "/api/auth/*", (c) => (auth ? auth.handler(c.req.raw) : fail(c, "Auth is not configured on the server", 503, { code: "AUTH_UNAVAILABLE" })));
app.route("/api/sites", sitesRoute);
app.route("/api/schedule", scheduleRoute);
app.route("/api/youtube", youtubeRoute);
app.route("/api/audit", auditRoute);
app.route("/api/weekly-rhythm", weeklyRhythmRoute);
app.route("/api/calendar", calendarRoute);
app.route("/api/checklist-items", checklistItemsRoute);
app.use("/api/admin/*", adminRateLimit);
app.route("/api/admin", adminRoute);
app.use("/api/uploads/*", uploadRateLimit);
app.route("/api/uploads", uploadsRoute);
app.use("/uploads/*", serveStatic({ root: "./" }));

app.notFound((c) => fail(c, "Route not found", 404, { code: "ROUTE_NOT_FOUND" }));

app.onError((error, c) => {
  logger.error("http.unhandled_error", {
    requestId: c.get("requestId"),
    error
  });

  return fail(c, "Internal server error", 500, { code: "INTERNAL_SERVER_ERROR" });
});

export default {
  port: env.port,
  fetch: app.fetch
};

logger.info("api.started", {
  url: `http://localhost:${env.port}`
});
