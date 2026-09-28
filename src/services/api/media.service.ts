import { API_ROUTES } from "@/lib/constants";
import {
  BatchPresignedUrlsResponseSchema,
  DeleteMediaResponseSchema,
  MediaUploadResultSchema,
  PresignedUrlResponseSchema,
} from "@/lib/validations";
import type {
  DeleteMediaResponse,
  MediaUploadResult,
  UploadMediaOptions,
} from "@/types";
import { api } from "./client";

async function uploadDirectWithPresigned(
  file: File,
  options?: UploadMediaOptions,
): Promise<MediaUploadResult> {
  const presigned = await api(API_ROUTES.MEDIA, {
    method: "POST",
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type || "application/octet-stream",
      size: file.size,
      projectId: options?.projectId,
      userId: options?.userId,
      category: options?.category,
    }),
    schema: PresignedUrlResponseSchema,
  });

  const uploadRes = await fetch(presigned.uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": presigned.contentType,
    },
  });

  if (!uploadRes.ok) {
    throw new Error(
      `Direct R2 upload failed (${uploadRes.status}: ${uploadRes.statusText})`,
    );
  }

  return {
    key: presigned.key,
    publicUrl: presigned.publicUrl,
    filename: file.name,
    contentType: presigned.contentType,
    size: file.size,
  };
}

async function uploadViaServerFallback(
  file: File,
  options?: UploadMediaOptions,
): Promise<MediaUploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  if (options?.projectId) {
    formData.append("projectId", options.projectId);
  }
  if (options?.userId) {
    formData.append("userId", options.userId);
  }
  if (options?.category) {
    formData.append("category", options.category);
  }

  const response = await fetch(API_ROUTES.MEDIA_UPLOAD, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error ||
        `Server fallback upload failed with status ${response.status}`,
    );
  }

  const result = await response.json();
  return MediaUploadResultSchema.parse(result);
}

export const mediaService = {
  async uploadMediaFile(
    file: File,
    options?: UploadMediaOptions,
  ): Promise<MediaUploadResult> {
    try {
      return await uploadDirectWithPresigned(file, options);
    } catch (primaryError: unknown) {
      console.warn(
        `Direct upload failed for "${file.name}". Engaging automatic server fallback.`,
        primaryError instanceof Error
          ? primaryError.message
          : String(primaryError),
      );
      return await uploadViaServerFallback(file, options);
    }
  },

  async uploadMultipleMediaFiles(
    files: File[],
    options?: UploadMediaOptions,
  ): Promise<MediaUploadResult[]> {
    if (files.length === 0) {
      return [];
    }

    try {
      const presignedBatch = await api(API_ROUTES.MEDIA, {
        method: "POST",
        body: JSON.stringify({
          files: files.map((f) => ({
            filename: f.name,
            contentType: f.type || "application/octet-stream",
            size: f.size,
            projectId: options?.projectId,
            userId: options?.userId,
            category: options?.category,
          })),
        }),
        schema: BatchPresignedUrlsResponseSchema,
      });

      return await Promise.all(
        files.map(async (file, index) => {
          const presigned = presignedBatch.items[index];
          if (!presigned) {
            return uploadViaServerFallback(file, options);
          }

          try {
            const uploadRes = await fetch(presigned.uploadUrl, {
              method: "PUT",
              body: file,
              headers: {
                "Content-Type": presigned.contentType,
              },
            });

            if (!uploadRes.ok) {
              throw new Error(
                `Direct upload failed with status ${uploadRes.status}`,
              );
            }

            return {
              key: presigned.key,
              publicUrl: presigned.publicUrl,
              filename: file.name,
              contentType: presigned.contentType,
              size: file.size,
            };
          } catch (individualError: unknown) {
            console.warn(
              `Direct upload failed for file #${index + 1} (${file.name}). Falling back to server upload.`,
              individualError instanceof Error
                ? individualError.message
                : String(individualError),
            );
            return uploadViaServerFallback(file, options);
          }
        }),
      );
    } catch (batchPresignedError: unknown) {
      console.warn(
        "Batch presigned URL generation failed. Falling back to sequential/server uploads for batch.",
        batchPresignedError instanceof Error
          ? batchPresignedError.message
          : String(batchPresignedError),
      );

      return Promise.all(
        files.map((file) => uploadViaServerFallback(file, options)),
      );
    }
  },

  async deleteMediaFile(key: string): Promise<DeleteMediaResponse> {
    return api(`${API_ROUTES.MEDIA}?key=${encodeURIComponent(key)}`, {
      method: "DELETE",
      schema: DeleteMediaResponseSchema,
    });
  },
};
