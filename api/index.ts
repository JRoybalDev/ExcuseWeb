export default {
  async fetch(request: Request) {
    try {
      const mod = await import("../apps/server/src/index.ts");
      return await mod.default.fetch(request);
    } catch (error) {
      return Response.json(
        {
          diagnosticError: true,
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        },
        { status: 500 }
      );
    }
  }
};
