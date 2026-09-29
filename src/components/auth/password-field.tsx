"use client";

import { Input, type InputProps } from "@/components/ui/input";
import { LOGIN_COPY } from "@/lib/constants";
import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useState } from "react";

type PasswordFieldProps = Omit<InputProps, "type">;

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  function PasswordField({ className = "", id, ...props }, ref) {
    const [isVisible, setIsVisible] = useState(false);
    const ToggleIcon = isVisible ? EyeOff : Eye;

    return (
      <div className="relative">
        <Input
          ref={ref}
          id={id}
          type={isVisible ? "text" : "password"}
          className={`pr-14 ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setIsVisible((current) => !current)}
          aria-label={
            isVisible ? LOGIN_COPY.HIDE_PASSWORD : LOGIN_COPY.SHOW_PASSWORD
          }
          aria-pressed={isVisible}
          aria-controls={id}
          className="absolute right-0.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-150 ease-studio hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ToggleIcon
            aria-hidden="true"
            strokeWidth={1.75}
            style={{ width: 18, height: 18 }}
          />
        </button>
      </div>
    );
  },
);
