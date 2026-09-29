import { AUTH_ROUTES } from "@/constants/auth";

function isSafeRelativePath(path: string): boolean {
  return (
    path.startsWith("/") &&
    !path.startsWith("//") &&
    !path.startsWith("/\\") &&
    !path.startsWith(AUTH_ROUTES.SIGN_IN)
  );
}

export function resolveCallbackUrl(
  raw: string | null | undefined,
  origin?: string,
): string {
  if (!raw) {
    return AUTH_ROUTES.DEFAULT_LOGGED_IN;
  }

  if (isSafeRelativePath(raw)) {
    return raw;
  }

  if (origin) {
    try {
      const parsed = new URL(raw);
      const relative = `${parsed.pathname}${parsed.search}${parsed.hash}`;
      if (parsed.origin === origin && isSafeRelativePath(relative)) {
        return relative;
      }
    } catch {
      return AUTH_ROUTES.DEFAULT_LOGGED_IN;
    }
  }

  return AUTH_ROUTES.DEFAULT_LOGGED_IN;
}
