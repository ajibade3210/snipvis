import type {
  AssetSchema,
  BatchMediaUploadResultSchema,
  BatchPresignedUrlsResponseSchema,
  DeleteMediaResponseSchema,
  InspirationSchema,
  MediaUploadResultSchema,
  PresignedUrlResponseSchema,
  ProjectSchema,
  ProjectThumbnailSchema,
  UserProfileSchema,
  YoutubeInfoSchema,
  aiHookBreakdownSchema,
  analyzeHookRequestSchema,
  analyzeHookResponseSchema,
  assetSourceEnum,
  assetTypeEnum,
  batchPresignedUrlsRequestSchema,
  createAssetSchema,
  createInspirationSchema,
  createProjectSchema,
  createProjectThumbnailSchema,
  deleteMediaRequestSchema,
  fetchYoutubeSchema,
  inspirationTypeEnum,
  mediaFolderCategoryEnum,
  presignedUrlRequestSchema,
  projectStatusEnum,
  storageEnvSchema,
  tagInspirationSchema,
  unifiedPresignedRequestSchema,
  updateAssetSchema,
  updateProjectSchema,
  updateProjectThumbnailSchema,
  updateUserProfileSchema,
} from "@/lib/validations";
import type { z } from "zod";

import type { ChannelRecord } from "./channel";
import type { HookType, RiskFlag, TriggeredEmotion } from "./hook-analysis";

export type ProjectStatus = z.infer<typeof projectStatusEnum>;
export type InspirationType = z.infer<typeof inspirationTypeEnum>;
export type AssetType = z.infer<typeof assetTypeEnum>;
export type AssetSource = z.infer<typeof assetSourceEnum>;
export type MediaFolderCategory = z.infer<typeof mediaFolderCategoryEnum>;

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateProjectThumbnailInput = z.infer<
  typeof createProjectThumbnailSchema
>;
export type UpdateProjectThumbnailInput = z.infer<
  typeof updateProjectThumbnailSchema
>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type CreateInspirationInput = z.infer<typeof createInspirationSchema>;
export type TagInspirationInput = z.infer<typeof tagInspirationSchema>;
export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;
export type FetchYoutubeInput = z.infer<typeof fetchYoutubeSchema>;

export type PresignedUrlRequest = z.infer<typeof presignedUrlRequestSchema>;
export type BatchPresignedUrlsRequest = z.infer<
  typeof batchPresignedUrlsRequestSchema
>;
export type UnifiedPresignedRequest = z.infer<
  typeof unifiedPresignedRequestSchema
>;
export type DeleteMediaRequest = z.infer<typeof deleteMediaRequestSchema>;

export type ProjectResponse = z.infer<typeof ProjectSchema>;
export type ProjectThumbnailResponse = z.infer<typeof ProjectThumbnailSchema>;
export type UserProfileResponse = z.infer<typeof UserProfileSchema>;
export type InspirationResponse = z.infer<typeof InspirationSchema>;
export type AssetResponse = z.infer<typeof AssetSchema>;
export type YoutubeInfoResponse = z.infer<typeof YoutubeInfoSchema>;

export type PresignedUrlResponse = z.infer<typeof PresignedUrlResponseSchema>;
export type BatchPresignedUrlsResponse = z.infer<
  typeof BatchPresignedUrlsResponseSchema
>;
export type MediaUploadResult = z.infer<typeof MediaUploadResultSchema>;
export type BatchMediaUploadResult = z.infer<
  typeof BatchMediaUploadResultSchema
>;
export type DeleteMediaResponse = z.infer<typeof DeleteMediaResponseSchema>;
export type StorageEnvConfig = z.infer<typeof storageEnvSchema>;

export type NavView =
  | "global"
  | "projects"
  | "channels"
  | "active-projects"
  | "competitor-spy"
  | "settings";

export type Theme = "light" | "dark";

export type ApiProvider = "deepseek" | "openrouter";

export type ButtonVariant = "default" | "ghost" | "outline" | "tactile";

export type ButtonSize = "default" | "lg";

export interface ProjectThumbnailRecord {
  id: string;
  projectId: string;
  url: string;
  isMain: boolean;
  label?: string | null;
  createdAt?: string | Date;
}

export interface UserProfileRecord {
  id: string;
  name?: string | null;
  avatarUrl?: string | null;
  updatedAt?: string | Date;
}

export interface ProjectRecord {
  id: string;
  name: string;
  slug: string;
  emoji?: string | null;
  description?: string | null;
  channelId?: string | null;
  channel?: ChannelRecord | string | null;
  hook?: string | null;
  scriptLink?: string | null;
  script?: string | null;
  status?: ProjectStatus;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  thumbnails?: ProjectThumbnailRecord[];
  _count?: {
    inspirations: number;
    assets: number;
  };
}

export interface InspirationRecord {
  id: string;
  thumbnailUrl: string;
  title?: string | null;
  hook?: string | null;
  channelName?: string | null;
  views?: string | null;
  sourceUrl?: string | null;
  type: InspirationType;
  note?: string | null;
  hook_type?: HookType | null;
  hookType?: string | null;
  hook_formula?: string | null;
  hookFormula?: string | null;
  triggered_emotion?: TriggeredEmotion | null;
  triggeredEmotion?: string | null;
  strength_score?: number | null;
  strengthScore?: number | null;
  score_reason?: string | null;
  scoreReason?: string | null;
  improvements?: string[] | null;
  title_variants?: string[] | null;
  titleVariants?: string[] | null;
  recreation_ideas?: string[] | null;
  recreationIdeas?: string[] | null;
  risk_flags?: RiskFlag[] | null;
  riskFlags?: string[] | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  projectContext?: {
    projectId: string;
    note?: string | null;
    favorite?: boolean;
  };
}

export interface FormattedInspiration extends InspirationRecord {
  categoryTag: string;
  categoryColor: string;
  ctrBadge: string;
  ctrColor: string;
  duration: string;
  insightLeft: string;
  insightRight: string;
  insightRightColor: string;
  projectName: string;
  projectDot: string;
}

export interface AssetRecord {
  id: string;
  url: string;
  type: string;
  source?: string;
  licenseText?: string | null;
  note?: string | null;
  createdAt?: string | Date;
  projectContext?: {
    projectId: string;
    note?: string | null;
  };
}

export interface OutlierItem {
  id: string;
  channel: string;
  title: string;
  thumbnailUrl: string;
  multiplier: string;
  views: string;
  ctrScore: string;
  strategy: string;
  hook: string;
  sourceUrl: string;
}

export interface YoutubeInfo {
  title?: string;
  channelName?: string;
  thumbnailUrl?: string;
  sourceUrl?: string;
  videoId?: string;
}

export interface CacheStore {
  get<T>(k: string): Promise<T | null>;
  set<T>(k: string, v: T, ttl: number): Promise<void>;
  del(k: string): Promise<void>;
}

export interface RedisLikeClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, mode: "EX", ttl: number): Promise<unknown>;
  del(key: string): Promise<number | unknown>;
}

export interface StorageClientConfig {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl: string;
}

export interface GeneratePresignedUploadOptions {
  filename: string;
  contentType: string;
  size: number;
  projectId?: string;
  userId?: string;
  category?: MediaFolderCategory;
}

export interface UploadBufferOptions {
  buffer: Buffer;
  filename: string;
  contentType: string;
  size: number;
  projectId?: string;
  userId?: string;
  category?: MediaFolderCategory;
}

export interface UploadMediaOptions {
  projectId?: string;
  userId?: string;
  category?: MediaFolderCategory;
}
