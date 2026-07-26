import { z } from "zod";

const Schema = z.object({ ok: z.boolean() });

export default {
  async fetch(_request: Request) {
    const data = Schema.parse({ ok: true });
    return Response.json({ ...data, diagnostic: "zod-only-no-hono" });
  }
};
