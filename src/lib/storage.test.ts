import { describe, expect, it } from "vitest";
import { MEDIA_CONFIG } from "./constants";
import {
  generateStorageKey,
  resolveCategory,
  sanitizePathSegment,
  validateFileSize,
} from "./storage";

describe("Storage Utilities", () => {
  it("resolves category correctly based on MIME type", () => {
    expect(resolveCategory("image/png")).toBe("images");
    expect(resolveCategory("IMAGE/JPEG")).toBe("images");
    expect(resolveCategory("video/mp4")).toBe("videos");
    expect(resolveCategory("audio/mpeg")).toBe("audios");
    expect(resolveCategory("application/pdf")).toBe("documents");
    expect(resolveCategory("text/plain")).toBe("documents");
    expect(resolveCategory("application/octet-stream")).toBe("others");
  });

  it("sanitizes path segments safely", () => {
    expect(sanitizePathSegment("My Project 2026!", "fallback")).toBe(
      "my-project-2026",
    );
    expect(sanitizePathSegment("   ---   ", "fallback")).toBe("fallback");
    expect(sanitizePathSegment("user_123@domain", "fallback")).toBe(
      "user_123-domain",
    );
  });

  it("generates structured storage key preserving original extension and random hash", () => {
    const key = generateStorageKey({
      filename: "test-recording.mov",
      contentType: "video/quicktime",
      projectId: "mrbeast-teardown",
      userId: "creator-99",
    });

    expect(key).toMatch(
      /^mrbeast-teardown\/creator-99\/videos\/[a-f0-9]{32}\.mov$/,
    );
  });

  it("validates file sizes within permissible limits", () => {
    // 5MB image should pass
    expect(() => validateFileSize("image/png", 5 * 1024 * 1024)).not.toThrow();

    // 15MB image exceeds 10MB limit and should throw
    expect(() => validateFileSize("image/png", 15 * 1024 * 1024)).toThrow(
      /exceeds the maximum allowed limit of 10MB/,
    );

    // 40MB video should pass
    expect(() => validateFileSize("video/mp4", 40 * 1024 * 1024)).not.toThrow();

    // 60MB video exceeds 50MB limit and should throw
    expect(() => validateFileSize("video/mp4", 60 * 1024 * 1024)).toThrow(
      /exceeds the maximum allowed limit of 50MB/,
    );
  });
});
