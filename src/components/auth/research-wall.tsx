import { BrandSignature } from "@/components/auth/brand-signature";
import { HookScoreMeter } from "@/components/auth/hook-score-meter";
import { ResearchSpecimen } from "@/components/auth/research-specimen";
import { LOGIN_SHOWCASE } from "@/lib/constants";
import Image from "next/image";

interface ResearchWallProps {
  className?: string;
}

export function ResearchWall({ className = "" }: ResearchWallProps) {
  const { primary, alternate, hook, outlier, cropGuide } = LOGIN_SHOWCASE;

  return (
    <aside
      aria-label={LOGIN_SHOWCASE.disclaimer}
      className={`relative flex-col justify-between gap-10 overflow-hidden bg-studio-deep px-10 py-10 lg:px-14 lg:py-12 xl:px-20 ${className}`}
    >
      <BrandSignature />

      <div className="flex flex-col gap-10">
        <div className="max-w-xl">
          <p className="font-grotesk text-[36px] font-semibold leading-[1.04] tracking-[-0.035em] text-foreground lg:text-5xl xl:text-[56px]">
            {LOGIN_SHOWCASE.headlineLead}
            <br />
            <span className="text-muted-foreground">
              {LOGIN_SHOWCASE.headlineTail}
            </span>
          </p>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
            {LOGIN_SHOWCASE.summary}
          </p>
        </div>

        <div className="relative max-w-[560px] motion-safe:animate-specimen-settle lg:pb-14">
          <ResearchSpecimen
            image={primary}
            titleKicker={LOGIN_SHOWCASE.thumbnailTitleKicker}
            title={LOGIN_SHOWCASE.thumbnailTitle}
            outlier={outlier}
            cropGuide={cropGuide}
            sizes="(min-width: 1280px) 520px, (min-width: 1024px) 44vw, 45vw"
            className="w-full lg:w-[84%]"
          />

          <div className="absolute right-0 top-[34%] hidden w-[30%] overflow-hidden rounded-2xl bg-card ring-[6px] ring-studio-deep lg:block motion-safe:animate-annotation-in motion-safe:[animation-delay:450ms]">
            <div className="relative aspect-[4/5]">
              <Image
                src={alternate.src}
                alt={alternate.alt}
                fill
                sizes="180px"
                className="object-cover"
              />
            </div>
            <span className="absolute bottom-2 left-2 rounded-md bg-black/55 px-2 py-1 text-xs font-semibold text-white backdrop-blur-md">
              {alternate.label}
            </span>
          </div>

          <HookScoreMeter
            hook={hook}
            className="relative -mt-8 ml-4 w-[88%] lg:absolute lg:bottom-0 lg:left-4 lg:mt-0 lg:ml-0 lg:w-[56%] motion-safe:animate-annotation-in motion-safe:[animation-delay:300ms]"
          />
        </div>
      </div>
    </aside>
  );
}

interface ResearchStripProps {
  className?: string;
}

export function ResearchStrip({ className = "" }: ResearchStripProps) {
  const { primary, hook } = LOGIN_SHOWCASE;
  const segments = Array.from({ length: hook.max }, (_, index) => index);

  return (
    <aside
      aria-label={LOGIN_SHOWCASE.disclaimer}
      className={`flex items-center gap-4 rounded-2xl bg-studio-deep p-3 ${className}`}
    >
      <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-lg bg-card">
        <Image
          src={primary.src}
          alt={primary.alt}
          fill
          sizes="112px"
          className="object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-[13px] font-semibold text-foreground">
            {hook.label}
          </p>
          <p className="font-grotesk text-sm font-semibold tabular-nums text-tangerine">
            {hook.score}/{hook.max}
          </p>
        </div>
        <div aria-hidden="true" className="mt-1.5 flex gap-0.5">
          {segments.map((index) => (
            <span
              key={index}
              className={`h-1 flex-1 rounded-full ${
                index < hook.score ? "bg-tangerine" : "bg-foreground/10"
              }`}
            />
          ))}
        </div>
        <p className="mt-1.5 truncate text-[13px] text-muted-foreground">
          {hook.note}
        </p>
      </div>
    </aside>
  );
}
