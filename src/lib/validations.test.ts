import { describe, expect, it } from "vitest";
import { createUserCliSchema, loginSchema } from "./validations";

describe("Auth Validation Schemas", () => {
  describe("loginSchema", () => {
    it("validates and normalizes valid credentials", () => {
      const result = loginSchema.safeParse({
        email: " DEMO@ChoiceGrid.APP ",
        password: "SecretPassword123",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("demo@choicegrid.app");
        expect(result.data.password).toBe("SecretPassword123");
      }
    });

    it("rejects invalid email formats", () => {
      const result = loginSchema.safeParse({
        email: "not-an-email",
        password: "Password123",
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty password", () => {
      const result = loginSchema.safeParse({
        email: "demo@choicegrid.app",
        password: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("createUserCliSchema", () => {
    it("validates valid CLI user inputs", () => {
      const result = createUserCliSchema.safeParse({
        email: "newuser@choicegrid.app",
        password: "SecurePassword2026!",
        name: "Creator Joe",
      });
      expect(result.success).toBe(true);
    });

    it("enforces minimum password length of 8 chars", () => {
      const result = createUserCliSchema.safeParse({
        email: "newuser@choicegrid.app",
        password: "short",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("8 characters");
      }
    });
  });
});
