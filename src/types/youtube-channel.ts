import { z } from "zod";

export const YoutubeChannelMetaSchema = z.object({
  channelName: z.string(),
  channelUrl: z.string(),
  avatarUrl: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  subscriberCount: z.string().optional().nullable(),
  lastUploadDate: z.string().optional().nullable(),
  uploadFrequency: z.string().optional().nullable(),
  mostPopularVideoTitle: z.string().optional().nullable(),
  mostPopularVideoUrl: z.string().optional().nullable(),
  mostPopularVideoThumb: z.string().optional().nullable(),
  recentUploadDates: z.array(z.string()).optional(),
});

export type YoutubeChannelMeta = z.infer<typeof YoutubeChannelMetaSchema>;
