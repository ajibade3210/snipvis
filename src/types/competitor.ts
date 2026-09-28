import { z } from "zod";

export const CompetitorSchema = z.object({
  id: z.string(),
  channelName: z.string(),
  channelUrl: z.string(),
  avatarUrl: z.string().nullable(),
  description: z.string().nullable(),
  subscriberCountAtAdd: z.string().nullable(),
  currentSubscriberCount: z.string().nullable(),
  lastUploadDate: z.string().nullable(),
  mostPopularVideoUrl: z.string().nullable(),
  mostPopularVideoTitle: z.string().nullable(),
  mostPopularVideoThumb: z.string().nullable(),
  uploadFrequency: z.string().nullable(),
  personalNote: z.string().nullable(),
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
  lastUploadDate?: string;
  mostPopularVideoUrl?: string;
  mostPopularVideoTitle?: string;
  mostPopularVideoThumb?: string;
  uploadFrequency?: string;
  personalNote?: string;
};

export type UpdateCompetitorInput = Partial<
  Omit<CreateCompetitorInput, "channelUrl">
>;
