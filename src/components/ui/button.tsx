import * as React from "react";
export function Button({
  className = "",
  variant = "default",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "ghost" | "outline";
}) {
  const base =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-9 px-4 disabled:opacity-50";
  const v: any = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    ghost: "hover:bg-accent",
    outline: "border border-input bg-background",
  };
  return <button className={`${base} ${v[variant]} ${className}`} {...props} />;
}
