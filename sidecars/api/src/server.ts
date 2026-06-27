import { HealthResponseSchema } from "@mineradio/shared";

const port = Number(process.env.MINERADIO_SIDECAR_PORT || "0");
const hostname = "127.0.0.1";

const server = Bun.serve({
  hostname,
  port,
  fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/health") {
      const body = HealthResponseSchema.parse({
        ok: true,
        appVersion: process.env.MINERADIO_APP_VERSION || "0.0.0-dev",
        apiVersion: "0.1.0",
        schemaVersion: "0.1.0",
        providers: []
      });
      return Response.json(body);
    }
    return Response.json({ ok: false, error: { code: "NOT_FOUND", message: "Not found", retryable: false } }, { status: 404 });
  }
});

console.log(`[sidecar] listening on http://${server.hostname}:${server.port}`);
