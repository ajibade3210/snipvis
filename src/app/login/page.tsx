import { BrandSignature } from "@/components/auth/brand-signature";
import { LoginForm, LoginFormSkeleton } from "@/components/auth/login-form";
import { ResearchStrip, ResearchWall } from "@/components/auth/research-wall";
import { authOptions } from "@/lib/auth";
import { AUTH_ROUTES, LOGIN_COPY } from "@/lib/constants";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: LOGIN_COPY.PAGE_TITLE,
  description: LOGIN_COPY.PAGE_DESCRIPTION,
};

const TITLE_ID = "login-title";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect(AUTH_ROUTES.DEFAULT_LOGGED_IN);
  }

  return (
    <div className="dark">
      <main className="min-h-dvh bg-background font-sans text-foreground selection:bg-primary selection:text-primary-foreground md:grid md:grid-cols-2 lg:grid-cols-[1.15fr_1fr]">
        <ResearchWall className="hidden md:flex" />

        <section
          aria-labelledby={TITLE_ID}
          className="flex min-h-dvh flex-col px-5 pb-6 pt-6 sm:px-10 sm:pt-10 md:px-10 md:py-12 lg:px-16"
        >
          <BrandSignature className="md:hidden" />

          <div className="mx-auto my-auto w-full max-w-[400px] py-10 md:py-0">
            <h1
              id={TITLE_ID}
              className="font-grotesk text-[32px] font-semibold leading-tight tracking-[-0.03em] text-foreground sm:text-4xl"
            >
              {LOGIN_COPY.TITLE}
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              {LOGIN_COPY.SUBTITLE}
            </p>

            <div className="mt-8">
              <Suspense fallback={<LoginFormSkeleton />}>
                <LoginForm />
              </Suspense>
            </div>
          </div>

          <ResearchStrip className="mx-auto w-full max-w-[400px] md:hidden [@media(max-height:700px)]:hidden" />
        </section>
      </main>
    </div>
  );
}
