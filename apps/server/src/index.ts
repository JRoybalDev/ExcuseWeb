import { Hono } from "hono";

const app = new Hono();

app.get("/health", (c) => c.json({ ok: true, diagnostic: "export-default-app" }));

export default app;
