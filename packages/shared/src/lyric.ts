import { z } from "zod";
import { ProviderIdSchema } from "./provider";

export const LyricLineSchema = z.object({
  timeMs: z.number().nonnegative(),
  text: z.string(),
  translation: z.string().optional(),
  durationMs: z.number().nonnegative().optional(),
  charCount: z.number().int().positive().optional(),
  source: z.string().optional(),
  words: z.array(z.object({
    text: z.string().optional(),
    timeMs: z.number().nonnegative(),
    durationMs: z.number().nonnegative().optional(),
    c0: z.number().int().nonnegative(),
    c1: z.number().int().nonnegative()
  })).optional()
});

export const LyricPayloadSchema = z.object({
  provider: ProviderIdSchema,
  trackId: z.string().min(1),
  lines: z.array(LyricLineSchema),
  hasTranslation: z.boolean().default(false),
  isWordByWord: z.boolean().default(false)
});

export type LyricLine = z.infer<typeof LyricLineSchema>;
export type LyricPayload = z.infer<typeof LyricPayloadSchema>;
