import { AlertCircle } from "lucide-react";

interface AuthErrorBannerProps {
  message: string;
}

export function AuthErrorBanner({ message }: AuthErrorBannerProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium leading-relaxed text-destructive motion-safe:animate-annotation-in"
    >
      <AlertCircle
        aria-hidden="true"
        className="mt-0.5 shrink-0"
        strokeWidth={2}
        style={{ width: 16, height: 16 }}
      />
      <span>{message}</span>
    </div>
  );
}
