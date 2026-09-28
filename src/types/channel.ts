import { z } from "zod";

export const createChannelSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Channel name is required")
    .max(100, "Channel name must be 100 characters or less"),
  link: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal(""))
    .nullable(),
});

export const channelSchema = z.object({
  id: z.string(),
  name: z.string(),
  link: z.string().nullable().optional(),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
  _count: z.object({ projects: z.number() }).optional(),
  projects: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        slug: z.string().optional(),
        status: z.string().optional(),
      }),
    )
    .optional(),
});

export type CreateChannelInput = z.infer<typeof createChannelSchema>;
export type ChannelRecord = z.infer<typeof channelSchema>;
