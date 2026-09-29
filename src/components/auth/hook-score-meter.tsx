import type { LoginShowcaseHook } from "@/types/login-showcase";

interface HookScoreMeterProps {
  hook: LoginShowcaseHook;
  className?: string;
}

export function HookScoreMeter({ hook, className = "" }: HookScoreMeterProps) {
  const segments = Array.from({ length: hook.max }, (_, index) => index);

  return (
    <figure
      className={`rounded-2xl bg-background/75 p-4 backdrop-blur-xl backdrop-saturate-150 sm:p-5 ${className}`}
    >
      <div className="flex items-baseline justify-between gap-4">
        <figcaption className="text-[13px] font-semibold text-foreground">
          {hook.label}
          <span className="ml-2 hidden font-normal text-muted-foreground xl:inline">
            {hook.window}
          </span>
        </figcaption>
        <p className="font-grotesk text-lg font-semibold tabular-nums tracking-[-0.02em] text-tangerine">
          {hook.score}
          <span className="text-sm text-muted-foreground">/{hook.max}</span>
        </p>
      </div>

      <div
        role="img"
        aria-label={`${hook.label}: ${hook.score} out of ${hook.max}`}
        className="mt-3 flex origin-left gap-1 motion-safe:animate-meter-fill motion-safe:[animation-delay:500ms]"
      >
        {segments.map((index) => (
          <span
            key={index}
            className={`h-1.5 flex-1 rounded-full ${
              index < hook.score ? "bg-tangerine" : "bg-foreground/10"
            }`}
          />
        ))}
      </div>

      <p className="mt-3 text-sm leading-snug text-foreground/85">
        {hook.note}
      </p>
    </figure>
  );
}
