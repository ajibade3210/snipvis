import { AUTH_ROUTES } from "@/constants/auth";
import { describe, expect, it } from "vitest";
import { resolveCallbackUrl } from "./auth-redirect";

const ORIGIN = "https://studio.snipvis.app";

describe("resolveCallbackUrl", () => {
  it("falls back to the default route when no callback is provided", () => {
    expect(resolveCallbackUrl(null)).toBe(AUTH_ROUTES.DEFAULT_LOGGED_IN);
    expect(resolveCallbackUrl(undefined)).toBe(AUTH_ROUTES.DEFAULT_LOGGED_IN);
    expect(resolveCallbackUrl("")).toBe(AUTH_ROUTES.DEFAULT_LOGGED_IN);
  });

  it("keeps safe relative paths including query strings", () => {
    expect(resolveCallbackUrl("/?view=projects&project=abc")).toBe(
      "/?view=projects&project=abc",
    );
  });

  it("rejects protocol-relative and backslash open redirects", () => {
    expect(resolveCallbackUrl("//evil.com")).toBe(
      AUTH_ROUTES.DEFAULT_LOGGED_IN,
    );
    expect(resolveCallbackUrl("/\\evil.com")).toBe(
      AUTH_ROUTES.DEFAULT_LOGGED_IN,
    );
  });

  it("prevents redirect loops back to the sign-in page", () => {
    expect(resolveCallbackUrl(`${AUTH_ROUTES.SIGN_IN}?x=1`)).toBe(
      AUTH_ROUTES.DEFAULT_LOGGED_IN,
    );
  });

  it("accepts same-origin absolute URLs by converting them to relative paths", () => {
    expect(resolveCallbackUrl(`${ORIGIN}/?view=settings`, ORIGIN)).toBe(
      "/?view=settings",
    );
  });

  it("rejects cross-origin and malformed absolute URLs", () => {
    expect(resolveCallbackUrl("https://evil.com/steal", ORIGIN)).toBe(
      AUTH_ROUTES.DEFAULT_LOGGED_IN,
    );
    expect(resolveCallbackUrl("not a url", ORIGIN)).toBe(
      AUTH_ROUTES.DEFAULT_LOGGED_IN,
    );
    expect(resolveCallbackUrl("https://evil.com/steal")).toBe(
      AUTH_ROUTES.DEFAULT_LOGGED_IN,
    );
  });
});
