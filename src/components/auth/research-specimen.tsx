import type {
  LoginShowcaseCropGuide,
  LoginShowcaseImage,
  LoginShowcaseOutlier,
} from "@/types/login-showcase";
import Image from "next/image";

interface ResearchSpecimenProps {
  image: LoginShowcaseImage;
  titleKicker: string;
  title: string;
  outlier: LoginShowcaseOutlier;
  cropGuide: LoginShowcaseCropGuide;
  sizes: string;
  className?: string;
}

const THIRD_LINES = ["left-1/3", "left-2/3"] as const;

export function ResearchSpecimen({
  image,
  titleKicker,
  title,
  outlier,
  cropGuide,
  sizes,
  className = "",
}: ResearchSpecimenProps) {
  return (
    <div
      className={`relative aspect-video overflow-hidden rounded-2xl bg-card [container-type:inline-size] ${className}`}
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={sizes}
        priority
        className="object-cover"
      />

      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-[45%] bg-gradient-to-r from-black/55 to-transparent"
      />

      <p
        aria-hidden="true"
        className="absolute left-[5%] top-[24%] font-grotesk font-bold uppercase leading-[0.9] tracking-[-0.03em] text-white"
      >
        <span className="block text-[4.2cqw]">{titleKicker}</span>
        <span className="block text-[8.4cqw] text-tangerine">{title}</span>
      </p>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {THIRD_LINES.map((position) => (
          <span
            key={position}
            className={`absolute inset-y-0 ${position} border-l border-dashed border-white/20`}
          />
        ))}
        <span className="absolute inset-x-0 top-1/3 border-t border-dashed border-white/20" />
        <span className="absolute inset-x-0 top-2/3 border-t border-dashed border-white/20" />

        <span className="absolute left-[35%] top-[8%] h-[58%] w-[28%] motion-safe:animate-annotation-in motion-safe:[animation-delay:350ms]">
          <span className="absolute left-0 top-0 h-3 w-3 border-l-2 border-t-2 border-tangerine" />
          <span className="absolute right-0 top-0 h-3 w-3 border-r-2 border-t-2 border-tangerine" />
          <span className="absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2 border-tangerine" />
          <span className="absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-tangerine" />
          <span className="absolute left-0 top-full mt-1.5 whitespace-nowrap rounded-md bg-black/55 px-1.5 py-0.5 text-[11px] font-semibold text-tangerine backdrop-blur-md">
            {cropGuide.label}
          </span>
        </span>
      </div>

      <span className="absolute left-3 top-3 rounded-md bg-black/55 px-2 py-1 text-xs font-semibold text-white backdrop-blur-md">
        {image.label}
      </span>

      <div className="absolute right-3 top-3 hidden items-baseline gap-1.5 rounded-lg bg-black/55 px-2.5 py-1.5 text-white backdrop-blur-md lg:flex motion-safe:animate-annotation-in motion-safe:[animation-delay:650ms]">
        <span className="font-grotesk text-base font-semibold tabular-nums tracking-[-0.02em]">
          {outlier.multiplier}
        </span>
        <span className="text-xs text-white/75">{outlier.context}</span>
      </div>
    </div>
  );
}
