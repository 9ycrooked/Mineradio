import { z } from "zod";

export const HealthResponseSchema = z.object({
  ok: z.literal(true),
  appVersion: z.string(),
  apiVersion: z.string(),
  schemaVersion: z.string(),
  providers: z.array(z.string())
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;
