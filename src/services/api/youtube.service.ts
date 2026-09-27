import { api } from "./client";
import { z } from "zod";

export const YoutubeInfoSchema = z.object({
  title: z.string().optional(),
  channelName: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  sourceUrl: z.string().optional(),
  videoId: z.string().optional(),
});

export type YoutubeInfo = z.infer<typeof YoutubeInfoSchema>;

export const youtubeService = {
  fetchInfo: (url: string) =>
    api<YoutubeInfo>("/api/youtube", {
      method: "POST",
      body: JSON.stringify({ url }),
      schema: YoutubeInfoSchema,
    }),
};
