import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

let currentMockUser = { id: "user-alice", email: "alice@test.com" };

vi.mock("@/lib/session", () => ({
  requireUser: vi.fn().mockImplementation(async () => currentMockUser),
  getCurrentUser: vi.fn().mockImplementation(async () => currentMockUser),
}));

vi.mock("@/lib/cache", () => ({
  cacheStore: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(undefined),
    del: vi.fn().mockResolvedValue(undefined),
  },
  withCache: vi.fn().mockImplementation((_store, _key, _ttl, fn) => fn()),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    project: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockImplementation(({ data }) =>
        Promise.resolve({
          id: "new-proj-id",
          ...data,
          thumbnails: [],
          _count: { inspirations: 0, assets: 0 },
        }),
      ),
    },
    channel: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockImplementation(({ data }) =>
        Promise.resolve({
          id: "new-chan-id",
          ...data,
          _count: { projects: 0 },
        }),
      ),
    },
    inspiration: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockImplementation(({ data }) =>
        Promise.resolve({
          id: "new-insp-id",
          ...data,
          projectInspirations: [],
        }),
      ),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import { GET as getChannels } from "./channels/route";
import { GET as getInspirations } from "./inspirations/route";
import { POST as createProject, GET as getProjects } from "./projects/route";

describe("Tenant Isolation Across API Route Handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("filters GET /api/projects strictly by the authenticated userId", async () => {
    currentMockUser = { id: "user-alice", email: "alice@test.com" };
    await getProjects();

    expect(prisma.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-alice" },
      }),
    );

    currentMockUser = { id: "user-bob", email: "bob@test.com" };
    await getProjects();

    expect(prisma.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-bob" },
      }),
    );
  });

  it("assigns userId from session on POST /api/projects", async () => {
    currentMockUser = { id: "user-bob", email: "bob@test.com" };
    const req = new Request("http://localhost:3000/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Bob Outlier Study",
        description: "Bob's private research",
      }),
    });

    const res = await createProject(req as unknown as NextRequest);
    expect(res.status).toBe(201);
    expect(prisma.project.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: "Bob Outlier Study",
          user: { connect: { id: "user-bob" } },
        }),
      }),
    );
  });

  it("filters GET /api/channels strictly by the authenticated userId", async () => {
    currentMockUser = { id: "user-bob", email: "bob@test.com" };
    await getChannels();

    expect(prisma.channel.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-bob" },
      }),
    );
  });

  it("filters GET /api/inspirations strictly by the authenticated userId", async () => {
    currentMockUser = { id: "user-bob", email: "bob@test.com" };
    const req = new Request("http://localhost:3000/api/inspirations");
    await getInspirations(req as unknown as NextRequest);

    expect(prisma.inspiration.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-bob" },
      }),
    );
  });
});
