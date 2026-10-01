import { z } from "zod";

export const CompetitorSchema = z.object({
  id: z.string(),
  channelName: z.string(),
  channelUrl: z.string(),
  avatarUrl: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  subscriberCountAtAdd: z.string().nullable().optional(),
  currentSubscriberCount: z.string().nullable().optional(),
  avgViewCount: z.string().nullable().optional(),
  lastUploadDate: z.string().nullable().optional(),
  mostPopularVideoUrl: z.string().nullable().optional(),
  mostPopularVideoTitle: z.string().nullable().optional(),
  mostPopularVideoThumb: z.string().nullable().optional(),
  uploadFrequency: z.string().nullable().optional(),
  startedDate: z.string().nullable().optional(),
  reproducible: z.boolean(),
  personalNote: z.string().nullable().optional(),
  totalViewCount: z.string().nullable().optional(),
  videoCount: z.number().nullable().optional(),
  country: z.string().nullable().optional(),
  customUrl: z.string().nullable().optional(),
  hiddenSubscriberCount: z.boolean().optional(),
  keywords: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
  userId: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CompetitorRecord = z.infer<typeof CompetitorSchema>;

export type CreateCompetitorInput = {
  channelName: string;
  channelUrl: string;
  avatarUrl?: string;
  description?: string;
  subscriberCountAtAdd?: string;
  currentSubscriberCount?: string;
  avgViewCount?: string;
  lastUploadDate?: string;
  mostPopularVideoUrl?: string;
  mostPopularVideoTitle?: string;
  mostPopularVideoThumb?: string;
  uploadFrequency?: string;
  startedDate?: string;
  reproducible?: boolean;
  personalNote?: string;
  totalViewCount?: string;
  videoCount?: number;
  country?: string;
  customUrl?: string;
  hiddenSubscriberCount?: boolean;
  keywords?: string[];
  metadata?: Record<string, unknown>;
};

export type UpdateCompetitorInput = Partial<
  Omit<CreateCompetitorInput, "channelUrl">
>;
