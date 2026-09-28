import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("Password Utilities", () => {
  it("hashes password and verifies successfully", async () => {
    const plain = "@SnipVis2026";
    const hash = await hashPassword(plain);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(plain);
    expect(hash.startsWith("$2")).toBe(true);

    const isMatch = await verifyPassword(plain, hash);
    expect(isMatch).toBe(true);
  });

  it("rejects incorrect password", async () => {
    const plain = "@SnipVis2026";
    const hash = await hashPassword(plain);

    const isMatch = await verifyPassword("WrongPassword123", hash);
    expect(isMatch).toBe(false);
  });
});
