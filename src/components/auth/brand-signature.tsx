import { BRAND_ASSETS } from "@/lib/constants";
import Image from "next/image";

interface BrandSignatureProps {
  className?: string;
}

export function BrandSignature({ className = "" }: BrandSignatureProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1.5">
        <Image
          src={BRAND_ASSETS.LOGO}
          alt=""
          width={32}
          height={32}
          className="h-full w-full object-contain"
          priority
        />
      </div>
      <div className="leading-tight">
        <p className="text-[15px] font-bold tracking-[-0.01em] text-foreground">
          {BRAND_ASSETS.APP_NAME}{" "}
          <span className="font-grotesk text-primary">
            {BRAND_ASSETS.APP_SUFFIX}
          </span>
        </p>
        <p className="text-[13px] text-muted-foreground">
          {BRAND_ASSETS.TAGLINE}
        </p>
      </div>
    </div>
  );
}
