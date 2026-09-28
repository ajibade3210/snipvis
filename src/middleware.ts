import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api/auth (NextAuth API endpoints)
     * - login (Login page)
     * - _next/static (Static bundles)
     * - _next/image (Image optimization)
     * - favicon.ico, logo.png (Brand assets)
     */
    "/((?!api/auth|login|_next/static|_next/image|favicon.ico|logo.png).*)",
  ],
};
