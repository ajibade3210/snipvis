import { AlertCircle } from "lucide-react";
import type * as React from "react";

export function getFieldErrorId(id: string): string {
  return `${id}-error`;
}

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export function Field({
  id,
  label,
  error,
  children,
  className = "",
}: FieldProps) {
  const hasError = Boolean(error);

  return (
    <div className={`group ${className}`}>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-muted-foreground transition-colors duration-150 ease-studio group-focus-within:text-foreground"
      >
        {label}
      </label>
      {children}
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-200 ease-studio ${
          hasError ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <p
            id={getFieldErrorId(id)}
            className="flex items-center gap-1.5 pt-2 text-[13px] font-medium text-destructive"
          >
            {hasError && (
              <AlertCircle
                aria-hidden="true"
                className="shrink-0"
                style={{ width: 14, height: 14 }}
              />
            )}
            <span>{error}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
