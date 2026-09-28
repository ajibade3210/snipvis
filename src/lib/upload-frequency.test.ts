import { describe, expect, it } from "vitest";
import { computeUploadFrequency } from "./upload-frequency";

describe("computeUploadFrequency", () => {
  it("returns 'Not enough data' when fewer than 2 dates are provided", () => {
    expect(computeUploadFrequency([])).toBe("Not enough data");
    expect(computeUploadFrequency(["2026-09-28T10:00:00Z"])).toBe(
      "Not enough data",
    );
  });

  it("calculates 5 times daily for uploads spaced roughly 4.8 hours apart", () => {
    const base = new Date("2026-09-28T12:00:00Z").getTime();
    const dates = [
      new Date(base).toISOString(),
      new Date(base - 4.5 * 3600 * 1000).toISOString(),
      new Date(base - 9 * 3600 * 1000).toISOString(),
      new Date(base - 14 * 3600 * 1000).toISOString(),
    ];
    expect(computeUploadFrequency(dates)).toBe("5 times daily");
  });

  it("calculates twice daily for uploads ~12 hours apart", () => {
    const base = new Date("2026-09-28T12:00:00Z").getTime();
    const dates = [
      new Date(base).toISOString(),
      new Date(base - 12 * 3600 * 1000).toISOString(),
      new Date(base - 24 * 3600 * 1000).toISOString(),
    ];
    expect(computeUploadFrequency(dates)).toBe("twice daily");
  });

  it("calculates once daily for uploads ~24 hours apart", () => {
    const base = new Date("2026-09-28T12:00:00Z").getTime();
    const dates = [
      new Date(base).toISOString(),
      new Date(base - 24 * 3600 * 1000).toISOString(),
      new Date(base - 48 * 3600 * 1000).toISOString(),
    ];
    expect(computeUploadFrequency(dates)).toBe("once daily");
  });

  it("calculates twice weekly for uploads ~3.5 days apart", () => {
    const base = new Date("2026-09-28T12:00:00Z").getTime();
    const dates = [
      new Date(base).toISOString(),
      new Date(base - 3.5 * 24 * 3600 * 1000).toISOString(),
      new Date(base - 7 * 24 * 3600 * 1000).toISOString(),
    ];
    expect(computeUploadFrequency(dates)).toBe("twice weekly");
  });

  it("calculates once weekly for uploads 7 days apart", () => {
    const base = new Date("2026-09-28T12:00:00Z").getTime();
    const dates = [
      new Date(base).toISOString(),
      new Date(base - 7 * 24 * 3600 * 1000).toISOString(),
      new Date(base - 14 * 24 * 3600 * 1000).toISOString(),
    ];
    expect(computeUploadFrequency(dates)).toBe("once weekly");
  });

  it("calculates every 2 weeks for uploads ~14 days apart", () => {
    const base = new Date("2026-09-28T12:00:00Z").getTime();
    const dates = [
      new Date(base).toISOString(),
      new Date(base - 14 * 24 * 3600 * 1000).toISOString(),
      new Date(base - 28 * 24 * 3600 * 1000).toISOString(),
    ];
    expect(computeUploadFrequency(dates)).toBe("every 2 weeks");
  });
});
