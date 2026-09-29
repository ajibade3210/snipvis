import type { ButtonSize, ButtonVariant } from "@/types";
import type * as React from "react";

const BASE_CLASSES =
  "inline-flex items-center justify-center transition-colors disabled:opacity-50";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  ghost: "hover:bg-accent",
  outline: "border border-input bg-background",
  tactile:
    "tactile-btn gap-2 bg-primary text-primary-foreground hover:bg-vermilion-light disabled:opacity-70",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  default: "h-9 px-4 rounded-md text-sm font-medium",
  lg: "h-12 px-6 rounded-xl text-[15px] font-semibold tracking-[-0.01em]",
};

export function Button({
  className = "",
  variant = "default",
  size = "default",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <button
      className={`${BASE_CLASSES} ${SIZE_CLASSES[size]} ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
}
