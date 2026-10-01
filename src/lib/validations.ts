import { channelSchema } from "@/types/channel";
import {
  aiHookBreakdownSchema,
  analyzeHookRequestSchema,
  analyzeHookResponseSchema,
  hookTypeEnum,
  riskFlagEnum,
  triggeredEmotionEnum,
} from "@/types/hook-analysis";
import { z } from "zod";

/* ========================================================================= */
/* 1. DOMAIN ENUMS                                                           */
/* ========================================================================= */

export const projectStatusEnum = z.enum(["ACTIVE", "DONE"]);

export const inspirationTypeEnum = z.enum(["THUMBNAIL", "TITLE", "HOOK"]);

export const assetTypeEnum = z.enum([
  "VIDEO",
  "AUDIO",
  "IMAGE",
  "FONT",
  "OTHER",
]);

export const assetSourceEnum = z.enum([
  "PEXELS",
  "PIXABAY",
  "MIXKIT",
  "YOUTUBE",
  "OTHER",
]);

/* ========================================================================= */
/* 2. REQUEST & MUTATION INPUT SCHEMAS                                       */
/* ========================================================================= */

export const createProjectSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  emoji: z.string().trim().max(10).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  channelId: z.string().optional().nullable(),
  channel: z.string().max(100).optional().nullable(),
  hook: z.string().max(5000).optional().nullable(),
  scriptLink: z.string().url().optional().or(z.literal("")).nullable(),
  script: z.string().optional().nullable(),
  status: projectStatusEnum.default("ACTIVE").optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export const createInspirationSchema = z.object({
  thumbnailUrl: z.string().url(),
  title: z.string().max(500).optional(),
  hook: z.string().max(5000).optional(),
  channelName: z.string().optional(),
  views: z.string().optional(),
  sourceUrl: z.string().url().optional(),
  type: inspirationTypeEnum.default("THUMBNAIL"),
  note: z.string().optional(),
  hook_type: hookTypeEnum.optional().nullable(),
  hookType: z.string().optional().nullable(),
  hook_formula: z.string().optional().nullable(),
  hookFormula: z.string().optional().nullable(),
  triggered_emotion: triggeredEmotionEnum.optional().nullable(),
  triggeredEmotion: z.string().optional().nullable(),
  strength_score: z.number().int().min(1).max(10).optional().nullable(),
  strengthScore: z.number().int().min(1).max(10).optional().nullable(),
  score_reason: z.string().optional().nullable(),
  scoreReason: z.string().optional().nullable(),
  improvements: z.array(z.string()).optional().nullable(),
  title_variants: z.array(z.string()).optional().nullable(),
  titleVariants: z.array(z.string()).optional().nullable(),
  recreation_ideas: z.array(z.string()).optional().nullable(),
  recreationIdeas: z.array(z.string()).optional().nullable(),
  risk_flags: z.array(riskFlagEnum).optional().nullable(),
  riskFlags: z.array(z.string()).optional().nullable(),
  projects: z
    .array(
      z.object({
        projectId: z.string().cuid(),
        note: z.string().optional(),
        favorite: z.boolean().optional(),
      }),
    )
    .default([]),
});

export const tagInspirationSchema = z.object({
  inspirationId: z.string().cuid(),
  projectId: z.string().cuid(),
  note: z.string().max(1000).optional(),
  favorite: z.boolean().optional(),
});

export const createAssetSchema = z.object({
  url: z.string().url(),
  type: assetTypeEnum.default("VIDEO"),
  source: assetSourceEnum.default("OTHER"),
  licenseText: z.string().optional(),
  note: z.string().optional(),
  projects: z
    .array(
      z.object({ projectId: z.string().cuid(), note: z.string().optional() }),
    )
    .min(1),
});

export const updateAssetSchema = z.object({
  url: z.string().url().optional(),
  type: assetTypeEnum.optional(),
  source: assetSourceEnum.optional(),
  licenseText: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
});

export const fetchYoutubeSchema = z.object({
  url: z
    .string()
    .url()
    .refine(
      (v) => v.includes("youtube.com") || v.includes("youtu.be"),
      "Must be YouTube URL",
    ),
});

export const createProjectThumbnailSchema = z.object({
  url: z.string().url("Must be a valid URL"),
  label: z.string().max(80).optional(),
});

export const updateProjectThumbnailSchema = z.object({
  isMain: z.boolean().optional(),
  label: z.string().max(80).optional(),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Enter your email address")
    .pipe(
      z.string().email("Enter a valid email address, like name@studio.com"),
    ),
  password: z.string().min(1, "Enter your password"),
});

export const createUserCliSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.string().email("Invalid email address")),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  name: z.string().max(100).optional(),
});

export const updateUserProfileSchema = z.object({
  name: z.string().max(100).nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  image: z.string().url().nullable().optional(),
});

/* ========================================================================= */
/* 3. RESPONSE & ENTITY DTO SCHEMAS                                          */
/* ========================================================================= */

export const ProjectThumbnailSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  url: z.string(),
  isMain: z.boolean(),
  label: z.string().nullable().optional(),
  createdAt: z.union([z.string(), z.date()]).optional(),
});

export const UserProfileSchema = z.object({
  id: z.string(),
  email: z.string().email().nullable().optional(),
  name: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
});

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  emoji: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  channelId: z.string().nullable().optional(),
  channel: z.union([z.string(), channelSchema]).nullable().optional(),
  hook: z.string().nullable().optional(),
  scriptLink: z.string().nullable().optional(),
  script: z.string().nullable().optional(),
  status: projectStatusEnum.optional(),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
  thumbnails: z.array(ProjectThumbnailSchema).optional(),
  _count: z.object({ inspirations: z.number(), assets: z.number() }).optional(),
});

export const InspirationSchema = z.object({
  id: z.string(),
  thumbnailUrl: z.string(),
  title: z.string().nullable().optional(),
  hook: z.string().nullable().optional(),
  channelName: z.string().nullable().optional(),
  views: z.string().nullable().optional(),
  sourceUrl: z.string().nullable().optional(),
  type: inspirationTypeEnum,
  note: z.string().nullable().optional(),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
  projectContext: z
    .object({
      projectId: z.string(),
      note: z.string().nullable().optional(),
      favorite: z.boolean().optional(),
    })
    .optional(),
});

export const AssetSchema = z.object({
  id: z.string(),
  url: z.string(),
  type: z.string(),
  source: z.string().optional(),
  licenseText: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  createdAt: z.union([z.string(), z.date()]).optional(),
  projectContext: z
    .object({
      projectId: z.string(),
      note: z.string().nullable().optional(),
    })
    .optional(),
});

export const YoutubeInfoSchema = z.object({
  title: z.string().optional(),
  channelName: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  sourceUrl: z.string().optional(),
  videoId: z.string().optional(),
});

/* ========================================================================= */
/* 4. MEDIA & STORAGE SCHEMAS                                                */
/* ========================================================================= */

export const mediaFolderCategoryEnum = z.enum([
  "images",
  "videos",
  "audios",
  "documents",
  "others",
  "thumbnails",
  "avatars",
]);

export const presignedUrlRequestSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string().min(1).max(100),
  size: z.number().int().positive(),
  projectId: z.string().optional(),
  userId: z.string().optional(),
  category: mediaFolderCategoryEnum.optional(),
});

export const batchPresignedUrlsRequestSchema = z.object({
  files: z.array(presignedUrlRequestSchema).min(1).max(20),
});

export const unifiedPresignedRequestSchema = z.union([
  batchPresignedUrlsRequestSchema,
  presignedUrlRequestSchema,
]);

export const deleteMediaRequestSchema = z.object({
  key: z.string().min(1).max(1024),
});

export const PresignedUrlResponseSchema = z.object({
  uploadUrl: z.string().url(),
  publicUrl: z.string().url(),
  key: z.string(),
  filename: z.string(),
  contentType: z.string(),
  expiresIn: z.number(),
});

export const BatchPresignedUrlsResponseSchema = z.object({
  items: z.array(PresignedUrlResponseSchema),
});

export const MediaUploadResultSchema = z.object({
  key: z.string(),
  publicUrl: z.string().url(),
  filename: z.string(),
  contentType: z.string(),
  size: z.number(),
});

export const BatchMediaUploadResultSchema = z.object({
  results: z.array(MediaUploadResultSchema),
});

export const DeleteMediaResponseSchema = z.object({
  success: z.boolean(),
  key: z.string(),
});

export const storageEnvSchema = z.object({
  CLOUDFLARE_R2_ACCESS_KEY: z
    .string()
    .min(1, "CLOUDFLARE_R2_ACCESS_KEY is required"),
  CLOUDFLARE_R2_SECRET_KEY: z
    .string()
    .min(1, "CLOUDFLARE_R2_SECRET_KEY is required"),
  CLOUDFLARE_R2_ACCOUNT_ID: z
    .string()
    .min(1, "CLOUDFLARE_R2_ACCOUNT_ID is required"),
  CLOUDFLARE_R2_BUCKET_NAME: z
    .string()
    .min(1, "CLOUDFLARE_R2_BUCKET_NAME is required"),
  CLOUDFLARE_R2_PUBLIC_URL: z
    .string()
    .url("CLOUDFLARE_R2_PUBLIC_URL must be a valid URL"),
});

/* ========================================================================= */
/* 7. AI HOOK BREAKDOWN SCHEMAS                                              */
/* ========================================================================= */

export {
  hookTypeEnum,
  triggeredEmotionEnum,
  riskFlagEnum,
  aiHookBreakdownSchema,
  analyzeHookRequestSchema,
  analyzeHookResponseSchema,
};

/* ========================================================================= */
/* 8. COMPETITOR SCHEMAS                                                      */
/* ========================================================================= */

export const createCompetitorSchema = z.object({
  channelName: z.string().min(1, "Channel name is required"),
  channelUrl: z.string().url("Must be a valid URL"),
  avatarUrl: z.string().url().optional().or(z.literal("")).nullable(),
  description: z.string().optional().nullable(),
  subscriberCountAtAdd: z.string().optional().nullable(),
  currentSubscriberCount: z.string().optional().nullable(),
  avgViewCount: z.string().optional().nullable(),
  lastUploadDate: z.string().optional().nullable(),
  mostPopularVideoUrl: z.string().url().optional().or(z.literal("")).nullable(),
  mostPopularVideoTitle: z.string().optional().nullable(),
  mostPopularVideoThumb: z
    .string()
    .url()
    .optional()
    .or(z.literal(""))
    .nullable(),
  uploadFrequency: z.string().optional().nullable(),
  startedDate: z.string().optional().nullable(),
  reproducible: z.boolean().default(false).optional(),
  personalNote: z.string().optional().nullable(),
  totalViewCount: z.string().optional().nullable(),
  videoCount: z.number().int().optional().nullable(),
  country: z.string().optional().nullable(),
  customUrl: z.string().optional().nullable(),
  hiddenSubscriberCount: z.boolean().optional(),
  keywords: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional().nullable(),
});

export const updateCompetitorSchema = createCompetitorSchema
  .omit({ channelUrl: true })
  .partial();

export const fetchYoutubeChannelSchema = z.object({
  url: z.string().min(1, "YouTube URL or handle is required"),
});

export const generateThumbnailPromptSchema = z.object({
  topic: z.string().min(2, "Topic must be at least 2 characters").max(200),
  hook: z.string().max(2000).optional(),
  channelName: z.string().max(100).optional(),
  style: z
    .enum([
      "cinematic",
      "hyper_realistic",
      "illustrative_3d",
      "minimalist_bold",
    ])
    .default("cinematic")
    .optional(),
});
