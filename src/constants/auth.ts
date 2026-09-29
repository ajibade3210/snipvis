export const AUTH_ROUTES = {
  SIGN_IN: "/login",
  API_AUTH_PREFIX: "/api/auth",
  DEFAULT_LOGGED_IN: "/",
} as const;

export const SESSION_CONFIG = {
  MAX_AGE_SECONDS: 30 * 24 * 60 * 60,
  STRATEGY: "jwt" as const,
} as const;

export const SECONDS_PER_DAY = 24 * 60 * 60;

export const AUTH_QUERY_PARAMS = {
  CALLBACK_URL: "callbackUrl",
} as const;

export const AUTH_PROVIDERS = {
  CREDENTIALS: "credentials",
} as const;

export const AUTH_ERROR_CODES = {
  CREDENTIALS_SIGNIN: "CredentialsSignin",
} as const;

export const LOGIN_FIELDS = {
  EMAIL: { id: "login-email", name: "email" },
  PASSWORD: { id: "login-password", name: "password" },
} as const;

export const LOGIN_COPY = {
  PAGE_TITLE: "Sign in — Snipvis OS",
  PAGE_DESCRIPTION: "Private Creator Research Lab workspace.",
  TITLE: "Sign in",
  SUBTITLE:
    "This workspace is invite-only. Use the email and password your studio admin shared with you.",
  EMAIL_LABEL: "Email address",
  EMAIL_PLACEHOLDER: "name@studio.com",
  PASSWORD_LABEL: "Password",
  PASSWORD_PLACEHOLDER: "Enter your password",
  SHOW_PASSWORD: "Show password",
  HIDE_PASSWORD: "Hide password",
  SUBMIT: "Sign in to workspace",
  SUBMITTING: "Signing in…",
  REDIRECTING: "Opening workspace…",
  INVALID_CREDENTIALS:
    "That email and password combination didn't work. Check both and try again.",
  UNEXPECTED: "Something went wrong on our side. Try again in a moment.",
  SESSION_NOTE: (days: number) =>
    `You'll stay signed in for ${days} days on this device.`,
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
