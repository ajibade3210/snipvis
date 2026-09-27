import { API_ROUTES } from "@/lib/constants";
import { YoutubeInfoSchema } from "@/lib/validations";
import type { YoutubeInfo } from "@/types";
import { api } from "./client";

export const youtubeService = {
  fetchInfo: (url: string) =>
    api<YoutubeInfo>(API_ROUTES.YOUTUBE, {
      method: "POST",
      body: JSON.stringify({ url }),
      schema: YoutubeInfoSchema,
    }),
};
