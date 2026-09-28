import { API_ROUTES } from "@/lib/constants";
import { channelSchema } from "@/types/channel";
import type { ChannelRecord, CreateChannelInput } from "@/types/channel";
import { z } from "zod";
import { api } from "./client";

export const channelService = {
  list: (): Promise<ChannelRecord[]> =>
    api(API_ROUTES.CHANNELS, {
      method: "GET",
      schema: z.array(channelSchema),
    }),
  create: (data: CreateChannelInput): Promise<ChannelRecord> =>
    api(API_ROUTES.CHANNELS, {
      method: "POST",
      body: JSON.stringify(data),
      schema: channelSchema,
    }),
};
