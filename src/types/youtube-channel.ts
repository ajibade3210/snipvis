import { z } from "zod";

export const YoutubeChannelMetaSchema = z.object({
  channelName: z.string(),
  channelUrl: z.string(),
  avatarUrl: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  customUrl: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  startedDate: z.string().optional().nullable(),
  subscriberCount: z.string().optional().nullable(),
  rawSubscriberCount: z.number().optional().nullable(),
  hiddenSubscriberCount: z.boolean().optional().nullable(),
  totalViewCount: z.string().optional().nullable(),
  rawTotalViewCount: z.number().optional().nullable(),
  videoCount: z.number().optional().nullable(),
  lastUploadDate: z.string().optional().nullable(),
  uploadFrequency: z.string().optional().nullable(),
  avgViewCount: z.string().optional().nullable(),
  recentUploadDates: z.array(z.string()).optional(),
  mostPopularVideoTitle: z.string().optional().nullable(),
  mostPopularVideoUrl: z.string().optional().nullable(),
  mostPopularVideoThumb: z.string().optional().nullable(),
  mostPopularVideoViews: z.string().optional().nullable(),
  keywords: z.array(z.string()).optional().nullable(),
  topicCategories: z.array(z.string()).optional().nullable(),
});

export type YoutubeChannelMeta = z.infer<typeof YoutubeChannelMetaSchema>;
