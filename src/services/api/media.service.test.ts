import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mediaService } from "./media.service";

describe("Media Service", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("successfully uploads directly to presigned URL on first attempt", async () => {
    const mockFile = new File(["test-content"], "sample.png", {
      type: "image/png",
    });

    // Mock fetch: 1st call for presigned URL (internal api), 2nd call for direct PUT to R2
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          uploadUrl: "https://r2.example.com/upload-target",
          publicUrl: "https://cdn.example.com/images/sample.png",
          key: "general/creator/images/12345.png",
          filename: "sample.png",
          contentType: "image/png",
          expiresIn: 900,
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: "OK",
      } as Response);

    const result = await mediaService.uploadMediaFile(mockFile);

    expect(result.publicUrl).toBe("https://cdn.example.com/images/sample.png");
    expect(result.key).toBe("general/creator/images/12345.png");
  });

  it("automatically falls back to server multipart upload when direct presigned upload fails", async () => {
    const mockFile = new File(["test-content"], "sample.png", {
      type: "image/png",
    });

    // 1st call: presigned URL generation succeeds
    // 2nd call: direct PUT to R2 fails (e.g., CORS error / network drop)
    // 3rd call: server fallback upload succeeds
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          uploadUrl: "https://r2.example.com/upload-target",
          publicUrl: "https://cdn.example.com/images/sample.png",
          key: "general/creator/images/12345.png",
          filename: "sample.png",
          contentType: "image/png",
          expiresIn: 900,
        }),
      } as Response)
      .mockRejectedValueOnce(new TypeError("Failed to fetch (CORS block)"))
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({
          key: "general/creator/images/fallback-12345.png",
          publicUrl: "https://cdn.example.com/images/fallback-12345.png",
          filename: "sample.png",
          contentType: "image/png",
          size: 12,
        }),
      } as Response);

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = await mediaService.uploadMediaFile(mockFile);

    expect(result.key).toBe("general/creator/images/fallback-12345.png");
    expect(result.publicUrl).toBe(
      "https://cdn.example.com/images/fallback-12345.png",
    );
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Engaging automatic server fallback"),
      expect.stringContaining("CORS block"),
    );
  });
});
