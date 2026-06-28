import { z } from "zod";
import { ProviderIdSchema } from "./provider";

export const ProviderSessionCookieAckSchema = z
  .object({
    provider: ProviderIdSchema,
    stored: z.boolean(),
  })
  .strict();

export type ProviderSessionCookieAck = z.infer<typeof ProviderSessionCookieAckSchema>;

export const ProviderLoginStatusSchema = z
  .object({
    provider: ProviderIdSchema,
    loggedIn: z.boolean(),
    nickname: z.string().optional(),
    avatarUrl: z.string().optional(),
    userId: z.string().optional(),
  })
  .strict();

export type ProviderLoginStatus = z.infer<typeof ProviderLoginStatusSchema>;

export const ProviderLogoutAckSchema = z
  .object({
    provider: ProviderIdSchema,
    loggedOut: z.boolean(),
  })
  .strict();

export type ProviderLogoutAck = z.infer<typeof ProviderLogoutAckSchema>;
