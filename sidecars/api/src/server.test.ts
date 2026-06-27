import { expect, test } from "bun:test";
import { HealthResponseSchema } from "@mineradio/shared";

test("health response schema accepts the sidecar shape", () => {
  const parsed = HealthResponseSchema.parse({
    ok: true,
    appVersion: "0.0.0-dev",
    apiVersion: "0.1.0",
    schemaVersion: "0.1.0",
    providers: []
  });
  expect(parsed.ok).toBe(true);
});
