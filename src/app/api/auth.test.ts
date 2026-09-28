import type { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { GET as getChannels } from "./channels/route";
import { GET as getInspirations } from "./inspirations/route";
import { POST as createProject, GET as getProjects } from "./projects/route";
import { GET as getSettings } from "./settings/route";

describe("API Authentication Guard", () => {
  it("returns 401 Unauthorized on GET /api/projects when unauthenticated", async () => {
    const res = await getProjects();
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toContain("Authentication required");
  });

  it("returns 401 Unauthorized on POST /api/projects when unauthenticated", async () => {
    const req = new Request("http://localhost:3000/api/projects", {
      method: "POST",
      body: JSON.stringify({ name: "Unauthorized Project" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await createProject(req as unknown as NextRequest);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toContain("Authentication required");
  });

  it("returns 401 Unauthorized on GET /api/channels when unauthenticated", async () => {
    const res = await getChannels();
    expect(res.status).toBe(401);
  });

  it("returns 401 Unauthorized on GET /api/inspirations when unauthenticated", async () => {
    const req = new Request("http://localhost:3000/api/inspirations");
    const res = await getInspirations(req as unknown as NextRequest);
    expect(res.status).toBe(401);
  });

  it("returns 401 Unauthorized on GET /api/settings when unauthenticated", async () => {
    const res = await getSettings();
    expect(res.status).toBe(401);
  });
});
