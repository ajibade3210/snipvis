export const AUTH_ROUTES = {
  SIGN_IN: "/login",
  API_AUTH_PREFIX: "/api/auth",
  DEFAULT_LOGGED_IN: "/",
} as const;

export const SESSION_CONFIG = {
  MAX_AGE_SECONDS: 30 * 24 * 60 * 60, // 30 days
  STRATEGY: "jwt" as const,
} as const;

export const SEED_USERS = {
  DEMO_EMAIL: "demo@choicegrid.app",
  DEMO_DEFAULT_PASSWORD: "@Snipvis",
  EMPTY_EMAIL: "holaszyd1@gmail.com",
  EMPTY_DEFAULT_PASSWORD: "SnipVisUser2026!",
} as const;

export const PASSWORD_CONFIG = {
  SALT_ROUNDS: 12,
} as const;
