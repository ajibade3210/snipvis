import { API_ROUTES } from "@/lib/constants";
import { YoutubeInfoSchema } from "@/lib/validations";
import type { YoutubeInfo } from "@/types";
import { YoutubeChannelMetaSchema } from "@/types/youtube-channel";
import type { YoutubeChannelMeta } from "@/types/youtube-channel";
import { api } from "./client";

export const youtubeService = {
  fetchInfo: (url: string) =>
    api<YoutubeInfo>(API_ROUTES.YOUTUBE, {
      method: "POST",
      body: { url },
      schema: YoutubeInfoSchema,
    }),

  fetchChannelInfo: (url: string) =>
    api<YoutubeChannelMeta>(API_ROUTES.YOUTUBE_CHANNEL, {
      method: "POST",
      body: { url },
      schema: YoutubeChannelMetaSchema,
    }),
};
