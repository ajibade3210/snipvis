import { LoginForm } from "@/components/login-form";
import { APP_LOGIN_FEATURES, BRAND_ASSETS } from "@/constants/brand";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const metadata = {
  title: "Sign in — Snipvis OS",
  description: "Private Creator Research Lab workspace.",
};

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#110E0C] text-[#FAF8F5] flex items-center justify-center p-4 sm:p-6 md:p-10 font-sans selection:bg-[#FF5338] selection:text-white">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-3xl overflow-hidden border border-[#2E2823] shadow-2xl bg-[#171412]">
        {/* Left Side: Brand Story & Studio Capabilities */}
        <div className="p-8 sm:p-10 md:p-12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#2E2823] bg-gradient-to-br from-[#1E1A17] via-[#171412] to-[#110E0C]">
          <div className="space-y-8">
            {/* Logo & Product Badge */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white border border-white/20 flex items-center justify-center p-1.5 shadow-md shrink-0">
                <Image
                  src={BRAND_ASSETS.LOGO}
                  alt={BRAND_ASSETS.APP_NAME}
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-tight text-white block">
                  {BRAND_ASSETS.APP_NAME}{" "}
                  <span className="text-[#FF5338] font-grotesk">
                    {BRAND_ASSETS.APP_SUFFIX}
                  </span>
                </span>
                <span className="text-[11px] font-medium text-[#8C8379] block">
                  {BRAND_ASSETS.TAGLINE}
                </span>
              </div>
            </div>

            {/* Headline */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Find the packaging <br className="hidden sm:inline" />
                worth shipping.
              </h1>
              <p className="text-xs text-[#A89F95] leading-relaxed">
                Deconstruct viral retention hooks, curate top-performing
                thumbnails, and build structured production briefs in one
                workspace.
              </p>
            </div>

            {/* Feature Bullets */}
            <div className="space-y-3.5 pt-2">
              {APP_LOGIN_FEATURES.map((feature) => (
                <div key={feature.title} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#2A241F] border border-[#3C3530] flex items-center justify-center text-xs shrink-0 mt-0.5">
                    {feature.icon}
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-white">
                      {feature.title}
                    </h2>
                    <p className="text-[11px] text-[#8C8379] leading-snug">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invitation Badge */}
          <div className="pt-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#221C18] border border-[#3C3530] text-[10px] font-bold text-[#A89F95]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Private workspace · access by invitation</span>
            </div>
          </div>
        </div>

        {/* Right Side: Sign In Card */}
        <div className="p-8 sm:p-10 md:p-12 flex flex-col justify-center bg-[#171412]">
          <div className="max-w-sm w-full mx-auto space-y-6">
            <div className="space-y-1.5">
              <h2 className="text-xl font-extrabold tracking-tight text-white">
                Sign in
              </h2>
              <p className="text-xs text-[#8C8379]">
                Enter your creator credentials to access your studio workspace.
              </p>
            </div>

            <Suspense
              fallback={
                <div className="h-48 flex items-center justify-center text-xs text-[#8C8379]">
                  Loading form...
                </div>
              }
            >
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
