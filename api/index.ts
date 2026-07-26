export default {
  async fetch(_request: Request) {
    return Response.json({ ok: true, diagnostic: "minimal-handler" });
  }
};
