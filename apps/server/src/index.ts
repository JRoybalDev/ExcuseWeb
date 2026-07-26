import { Hono } from "hono";

const app = new Hono();

app.get("/health", (c) => c.json({ ok: true, diagnostic: "bare-hono-only" }));

export default {
  port: 3001,
  fetch: app.fetch
};
