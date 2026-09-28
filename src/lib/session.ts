import { UnauthorizedError } from "@/lib/api-error";
import { authOptions } from "@/lib/auth";
import type { AuthSessionUser } from "@/types/auth";
import { getServerSession } from "next-auth";

export async function getCurrentUser(): Promise<AuthSessionUser | null> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return null;
    }
    return {
      id: session.user.id,
      email: session.user.email ?? null,
      name: session.user.name ?? null,
      image: session.user.image ?? null,
    };
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<AuthSessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new UnauthorizedError(
      "Authentication required to access this resource",
    );
  }
  return user;
}
