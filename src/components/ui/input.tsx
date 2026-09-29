import { forwardRef } from "react";
import type * as React from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

const BASE_CLASSES =
  "h-12 w-full rounded-xl border bg-card px-4 text-base md:text-[15px] text-foreground placeholder:text-muted-foreground/60 transition-[border-color,box-shadow,background-color] duration-150 ease-studio focus:outline-none focus:ring-4 read-only:cursor-default disabled:cursor-not-allowed disabled:opacity-60";

const STATE_CLASSES = {
  valid:
    "border-border hover:border-muted-foreground/40 focus:border-primary/70 focus:bg-accent focus:ring-primary/15",
  invalid:
    "border-destructive/70 focus:border-destructive focus:bg-accent focus:ring-destructive/15",
} as const;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className = "", invalid = false, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={`${BASE_CLASSES} ${invalid ? STATE_CLASSES.invalid : STATE_CLASSES.valid} ${className}`}
      {...props}
    />
  );
});
