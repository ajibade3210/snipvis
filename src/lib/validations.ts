import { z } from "zod";

/* ========================================================================= */
/* 1. DOMAIN ENUMS                                                           */
/* ========================================================================= */

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
  description: z.string().max(500).optional().nullable(),
  channel: z.string().max(100).optional().nullable(),
  hook: z.string().max(5000).optional().nullable(),
  scriptLink: z.string().url().optional().or(z.literal("")).nullable(),
  script: z.string().optional().nullable(),
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

export const fetchYoutubeSchema = z.object({
  url: z
    .string()
    .url()
    .refine(
      (v) => v.includes("youtube.com") || v.includes("youtu.be"),
      "Must be YouTube URL",
    ),
});

/* ========================================================================= */
/* 3. RESPONSE & ENTITY DTO SCHEMAS                                          */
/* ========================================================================= */

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  channel: z.string().nullable().optional(),
  hook: z.string().nullable().optional(),
  scriptLink: z.string().nullable().optional(),
  script: z.string().nullable().optional(),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
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
