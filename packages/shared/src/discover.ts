import { z } from "zod";
import { PlaylistSummarySchema } from "./playlist";
import { PodcastRadioSchema } from "./podcast";
import { ProviderIdSchema } from "./provider";
import { TrackSchema } from "./track";

export const DiscoverHomeUserSchema = z.object({
  provider: ProviderIdSchema,
  userId: z.string().optional().default(""),
  nickname: z.string().optional().default(""),
  avatarUrl: z.string().optional().default("")
});

export const DiscoverHomeResponseSchema = z.object({
  loggedIn: z.boolean(),
  user: DiscoverHomeUserSchema.nullable().default(null),
  dailySongs: z.array(TrackSchema).default([]),
  playlists: z.array(PlaylistSummarySchema).default([]),
  podcasts: z.array(PodcastRadioSchema).default([]),
  mode: z.enum(["starter", "member"]).default("starter"),
  updatedAt: z.number().int().nonnegative()
});

export type DiscoverHomeUser = z.infer<typeof DiscoverHomeUserSchema>;
export type DiscoverHomeResponse = z.infer<typeof DiscoverHomeResponseSchema>;
