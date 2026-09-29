import { AUTH_ROUTES } from "@/constants/auth";
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: AUTH_ROUTES.SIGN_IN,
  },
});

export const config = {
  matcher: [
    "/((?!api/auth|login|images/login|_next/static|_next/image|favicon.ico|logo.png).*)",
  ],
};
