import { randomBytes } from "node:crypto";
import path from "node:path";
import { MEDIA_CONFIG } from "@/lib/constants";
import { storageEnvSchema } from "@/lib/validations";
import type {
  DeleteMediaResponse,
  GeneratePresignedUploadOptions,
  MediaFolderCategory,
  MediaUploadResult,
  PresignedUrlResponse,
  StorageClientConfig,
  UploadBufferOptions,
} from "@/types";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let s3ClientInstance: S3Client | null = null;
let storageConfigInstance: StorageClientConfig | null = null;

export function getStorageConfig(): StorageClientConfig {
  if (storageConfigInstance) {
    return storageConfigInstance;
  }

  const parsed = storageEnvSchema.safeParse({
    CLOUDFLARE_R2_ACCESS_KEY: process.env.CLOUDFLARE_R2_ACCESS_KEY,
    CLOUDFLARE_R2_SECRET_KEY: process.env.CLOUDFLARE_R2_SECRET_KEY,
    CLOUDFLARE_R2_ACCOUNT_ID: process.env.CLOUDFLARE_R2_ACCOUNT_ID,
    CLOUDFLARE_R2_BUCKET_NAME: process.env.CLOUDFLARE_R2_BUCKET_NAME,
    CLOUDFLARE_R2_PUBLIC_URL: process.env.CLOUDFLARE_R2_PUBLIC_URL,
  });

  if (!parsed.success) {
    const errorDetails = parsed.error.issues
      .map((issue) => issue.message)
      .join(", ");
    throw new Error(
      `Cloudflare R2 configuration error: ${errorDetails}. Please verify your environment variables.`,
    );
  }

  storageConfigInstance = {
    accessKeyId: parsed.data.CLOUDFLARE_R2_ACCESS_KEY,
    secretAccessKey: parsed.data.CLOUDFLARE_R2_SECRET_KEY,
    accountId: parsed.data.CLOUDFLARE_R2_ACCOUNT_ID,
    bucketName: parsed.data.CLOUDFLARE_R2_BUCKET_NAME,
    publicUrl: parsed.data.CLOUDFLARE_R2_PUBLIC_URL.replace(/\/+$/, ""),
  };

  return storageConfigInstance;
}

export function getS3Client(): S3Client {
  if (s3ClientInstance) {
    return s3ClientInstance;
  }

  const config = getStorageConfig();

  s3ClientInstance = new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  return s3ClientInstance;
}

export function resolveCategory(contentType: string): MediaFolderCategory {
  const lower = contentType.toLowerCase();
  if (lower.startsWith("image/")) {
    return "images";
  }
  if (lower.startsWith("video/")) {
    return "videos";
  }
  if (lower.startsWith("audio/")) {
    return "audios";
  }
  if (
    lower === "application/pdf" ||
    lower.startsWith("text/") ||
    lower === "application/json"
  ) {
    return "documents";
  }
  return "others";
}

export function validateFileSize(contentType: string, size: number): void {
  const category = resolveCategory(contentType);

  let maxSize: number = MEDIA_CONFIG.DEFAULT_MAX_SIZE_BYTES;
  if (category === "images") {
    maxSize = MEDIA_CONFIG.MAX_IMAGE_SIZE_BYTES;
  } else if (category === "videos") {
    maxSize = MEDIA_CONFIG.MAX_VIDEO_SIZE_BYTES;
  } else if (category === "audios") {
    maxSize = MEDIA_CONFIG.MAX_AUDIO_SIZE_BYTES;
  } else if (category === "documents") {
    maxSize = MEDIA_CONFIG.MAX_DOCUMENT_SIZE_BYTES;
  }

  if (size > maxSize) {
    const sizeInMb = (size / (1024 * 1024)).toFixed(1);
    const maxInMb = (maxSize / (1024 * 1024)).toFixed(0);
    throw new Error(
      `File size (${sizeInMb}MB) exceeds the maximum allowed limit of ${maxInMb}MB for ${category}.`,
    );
  }
}

export function sanitizePathSegment(segment: string, fallback: string): string {
  const sanitized = segment
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return sanitized || fallback;
}

export function generateStorageKey(params: {
  filename: string;
  projectId?: string;
  userId?: string;
  category?: MediaFolderCategory;
  contentType: string;
}): string {
  const projectSegment = sanitizePathSegment(
    params.projectId || MEDIA_CONFIG.DEFAULT_PROJECT_ID,
    MEDIA_CONFIG.DEFAULT_PROJECT_ID,
  );
  const userSegment = sanitizePathSegment(
    params.userId || MEDIA_CONFIG.DEFAULT_USER_ID,
    MEDIA_CONFIG.DEFAULT_USER_ID,
  );
  const categorySegment =
    params.category || resolveCategory(params.contentType);

  const rawExt = path.extname(params.filename).toLowerCase();
  const safeExt = rawExt.replace(/[^a-z0-9.]/g, "") || "";
  const randomHash = randomBytes(16).toString("hex");

  return `${projectSegment}/${userSegment}/${categorySegment}/${randomHash}${safeExt}`;
}

export function getPublicUrl(key: string): string {
  const config = getStorageConfig();
  const normalizedKey = key.replace(/^\/+/, "");
  return `${config.publicUrl}/${normalizedKey}`;
}

export async function getPresignedUploadUrl(
  options: GeneratePresignedUploadOptions,
): Promise<PresignedUrlResponse> {
  validateFileSize(options.contentType, options.size);

  const config = getStorageConfig();
  const client = getS3Client();

  const key = generateStorageKey({
    filename: options.filename,
    contentType: options.contentType,
    projectId: options.projectId,
    userId: options.userId,
    category: options.category,
  });

  const command = new PutObjectCommand({
    Bucket: config.bucketName,
    Key: key,
    ContentType: options.contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, {
    expiresIn: MEDIA_CONFIG.PRESIGNED_EXPIRY_SECONDS,
  });

  const publicUrl = getPublicUrl(key);

  return {
    uploadUrl,
    publicUrl,
    key,
    filename: options.filename,
    contentType: options.contentType,
    expiresIn: MEDIA_CONFIG.PRESIGNED_EXPIRY_SECONDS,
  };
}

export async function uploadBuffer(
  options: UploadBufferOptions,
): Promise<MediaUploadResult> {
  validateFileSize(options.contentType, options.size);

  const config = getStorageConfig();
  const client = getS3Client();

  const key = generateStorageKey({
    filename: options.filename,
    contentType: options.contentType,
    projectId: options.projectId,
    userId: options.userId,
    category: options.category,
  });

  const command = new PutObjectCommand({
    Bucket: config.bucketName,
    Key: key,
    Body: options.buffer,
    ContentType: options.contentType,
  });

  await client.send(command);

  return {
    key,
    publicUrl: getPublicUrl(key),
    filename: options.filename,
    contentType: options.contentType,
    size: options.size,
  };
}

export async function deleteObject(key: string): Promise<DeleteMediaResponse> {
  const config = getStorageConfig();
  const client = getS3Client();

  const command = new DeleteObjectCommand({
    Bucket: config.bucketName,
    Key: key,
  });

  await client.send(command);

  return {
    success: true,
    key,
  };
}
