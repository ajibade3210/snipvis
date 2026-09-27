import { API_ROUTES } from "@/lib/constants";
import type { YoutubeInfo } from "@/types";
import { z } from "zod";
import { api } from "./client";

export const YoutubeInfoSchema = z.object({
  title: z.string().optional(),
  channelName: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  sourceUrl: z.string().optional(),
  videoId: z.string().optional(),
});

export const youtubeService = {
  fetchInfo: (url: string) =>
    api<YoutubeInfo>(API_ROUTES.YOUTUBE, {
      method: "POST",
      body: JSON.stringify({ url }),
      schema: YoutubeInfoSchema,
    }),
};
