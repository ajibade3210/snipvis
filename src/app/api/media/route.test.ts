import * as storage from "@/lib/storage";
import type { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/session", () => ({
  requireUser: vi
    .fn()
    .mockResolvedValue({ id: "creator-01", email: "creator@test.com" }),
  getCurrentUser: vi
    .fn()
    .mockResolvedValue({ id: "creator-01", email: "creator@test.com" }),
}));

import { DELETE as deleteMediaRoute, POST as mediaRoute } from "./route";
import { POST as uploadRoute } from "./upload/route";

describe("Consolidated Media API Route Handlers", () => {
  it("rejects invalid presigned URL payloads with 400", async () => {
    const fakeReq = new Request("http://localhost:3000/api/media", {
      method: "POST",
      body: JSON.stringify({ filename: "", contentType: "image/png" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await mediaRoute(fakeReq as unknown as NextRequest);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("generates presigned PUT URL for single file payload", async () => {
    const fakeReq = new Request("http://localhost:3000/api/media", {
      method: "POST",
      body: JSON.stringify({
        filename: "hero-thumbnail.webp",
        contentType: "image/webp",
        size: 1024 * 500,
        projectId: "mrbeast-teardown",
        userId: "creator-01",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await mediaRoute(fakeReq as unknown as NextRequest);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.uploadUrl).toBeDefined();
    expect(data.publicUrl).toContain(".webp");
    expect(data.filename).toBe("hero-thumbnail.webp");
    expect(data.key).toContain("mrbeast-teardown/creator-01/images/");
  });

  it("generates batch presigned PUT URLs when files array is provided", async () => {
    const fakeReq = new Request("http://localhost:3000/api/media", {
      method: "POST",
      body: JSON.stringify({
        files: [
          {
            filename: "asset-1.png",
            contentType: "image/png",
            size: 1000,
          },
          {
            filename: "asset-2.mov",
            contentType: "video/quicktime",
            size: 2000,
          },
        ],
      }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await mediaRoute(fakeReq as unknown as NextRequest);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.items).toHaveLength(2);
    expect(data.items[0].key).toContain("images");
    expect(data.items[1].key).toContain("videos");
  });

  it("deletes media asset by key via query parameter", async () => {
    const deleteSpy = vi.spyOn(storage, "deleteObject").mockResolvedValueOnce({
      success: true,
      key: "general/creator-01/images/test-to-delete.png",
    });

    const fakeReq = new Request(
      "http://localhost:3000/api/media?key=general/creator-01/images/test-to-delete.png",
      {
        method: "DELETE",
      },
    );

    const res = await deleteMediaRoute(fakeReq as unknown as NextRequest);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.key).toBe("general/creator-01/images/test-to-delete.png");
    expect(deleteSpy).toHaveBeenCalledWith(
      "general/creator-01/images/test-to-delete.png",
    );
  });

  it("rejects multipart upload when no file is attached", async () => {
    const formData = new FormData();
    formData.append("projectId", "demo");

    const fakeReq = new Request("http://localhost:3000/api/media/upload", {
      method: "POST",
      body: formData,
    });

    const res = await uploadRoute(fakeReq as unknown as NextRequest);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("No valid file");
  });
});
