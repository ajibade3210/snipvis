import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { channelService } from "./channel.service";

describe("Channel Service", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("lists channels via GET /api/channels", async () => {
    const mockChannels = [
      {
        id: "c1",
        name: "MrBeast",
        link: "https://youtube.com/@mrbeast",
        createdAt: "2026-09-28T00:00:00.000Z",
        _count: { projects: 2 },
      },
    ];

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockChannels,
    } as Response);

    const channels = await channelService.list();
    expect(channels).toHaveLength(1);
    expect(channels[0]?.name).toBe("MrBeast");
    expect(channels[0]?._count?.projects).toBe(2);
  });

  it("creates channel via POST /api/channels", async () => {
    const mockCreated = {
      id: "c2",
      name: "TechCraft",
      link: "https://youtube.com/@techcraft",
      createdAt: "2026-09-28T00:00:00.000Z",
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockCreated,
    } as Response);

    const result = await channelService.create({
      name: "TechCraft",
      link: "https://youtube.com/@techcraft",
    });

    expect(result.id).toBe("c2");
    expect(result.name).toBe("TechCraft");
  });
});
