import { cors } from "hono/cors";
import { Hono } from "hono";
import { env } from "./env.ts";
import { fail, ok } from "./http/response.ts";
import { logger } from "./logger.ts";
import { requestContext } from "./middleware/requestContext.ts";
import { securityHeaders } from "./middleware/securityHeaders.ts";
import type { AppVariables } from "./types.ts";

const app = new Hono<{ Variables: AppVariables }>();

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
    diagnostic: "minimal-index-no-auth-no-db-no-routes"
  })
);

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
