"use client";

import { AuthErrorBanner } from "@/components/auth/auth-error-banner";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { Field, getFieldErrorId } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RESET_PASSWORD_COPY } from "@/constants/auth";
import { useLoginForm } from "@/hooks/use-login-form";
import {
  AUTH_QUERY_PARAMS,
  LOGIN_COPY,
  LOGIN_FIELDS,
  SECONDS_PER_DAY,
  SESSION_CONFIG,
} from "@/lib/constants";
import { ArrowRight, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

const SESSION_DAYS = Math.round(
  SESSION_CONFIG.MAX_AGE_SECONDS / SECONDS_PER_DAY,
);

const ICON_SIZE = { width: 18, height: 18 } as const;

const SKELETON_FIELDS = [LOGIN_FIELDS.EMAIL.id, LOGIN_FIELDS.PASSWORD.id];

export function LoginForm() {
  const [mode, setMode] = useState<"login" | "forgot_password">("login");
  const searchParams = useSearchParams();
  const {
    values,
    fieldErrors,
    formError,
    status,
    setValue,
    validateField,
    handleSubmit,
  } = useLoginForm(searchParams.get(AUTH_QUERY_PARAMS.CALLBACK_URL));

  const isBusy = status !== "idle";
  const { EMAIL, PASSWORD } = LOGIN_FIELDS;

  if (mode === "forgot_password") {
    return (
      <ForgotPasswordForm
        initialEmail={values.email}
        onBackToLogin={() => setMode("login")}
        onSuccess={(updatedEmail) => {
          setValue(EMAIL.name, updatedEmail);
          setMode("login");
        }}
      />
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      aria-busy={isBusy}
      className="flex flex-col gap-5"
    >
      {formError && <AuthErrorBanner message={formError} />}

      <Field
        id={EMAIL.id}
        label={LOGIN_COPY.EMAIL_LABEL}
        error={fieldErrors.email}
      >
        <Input
          id={EMAIL.id}
          name={EMAIL.name}
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          required
          placeholder={LOGIN_COPY.EMAIL_PLACEHOLDER}
          value={values.email}
          onChange={(event) => setValue(EMAIL.name, event.target.value)}
          onBlur={() => validateField(EMAIL.name)}
          readOnly={isBusy}
          invalid={Boolean(fieldErrors.email)}
          aria-describedby={
            fieldErrors.email ? getFieldErrorId(EMAIL.id) : undefined
          }
        />
      </Field>

      <Field
        id={PASSWORD.id}
        label={LOGIN_COPY.PASSWORD_LABEL}
        action={
          <button
            type="button"
            onClick={() => setMode("forgot_password")}
            className="text-xs font-medium text-primary hover:underline cursor-pointer"
          >
            {RESET_PASSWORD_COPY.FORGOT_LINK}
          </button>
        }
        error={fieldErrors.password}
      >
        <PasswordField
          id={PASSWORD.id}
          name={PASSWORD.name}
          autoComplete="current-password"
          required
          placeholder={LOGIN_COPY.PASSWORD_PLACEHOLDER}
          value={values.password}
          onChange={(event) => setValue(PASSWORD.name, event.target.value)}
          onBlur={() => validateField(PASSWORD.name)}
          readOnly={isBusy}
          invalid={Boolean(fieldErrors.password)}
          aria-describedby={
            fieldErrors.password ? getFieldErrorId(PASSWORD.id) : undefined
          }
        />
      </Field>

      <Button
        type="submit"
        variant="tactile"
        size="lg"
        disabled={isBusy}
        className="group mt-2 w-full"
      >
        {isBusy ? (
          <>
            <Loader2
              aria-hidden="true"
              className="animate-spin"
              style={ICON_SIZE}
            />
            <span>
              {status === "redirecting"
                ? LOGIN_COPY.REDIRECTING
                : LOGIN_COPY.SUBMITTING}
            </span>
          </>
        ) : (
          <>
            <span>{LOGIN_COPY.SUBMIT}</span>
            <ArrowRight
              aria-hidden="true"
              strokeWidth={2.25}
              className="transition-transform duration-150 ease-studio [@media(hover:hover)]:group-hover:translate-x-0.5"
              style={ICON_SIZE}
            />
          </>
        )}
      </Button>

      <p className="text-center text-[13px] text-muted-foreground">
        {LOGIN_COPY.SESSION_NOTE(SESSION_DAYS)}
      </p>
    </form>
  );
}

export function LoginFormSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-5">
      {SKELETON_FIELDS.map((key) => (
        <div key={key}>
          <div className="mb-2 h-4 w-24 rounded bg-card" />
          <div className="h-12 rounded-xl bg-card" />
        </div>
      ))}
      <div className="mt-2 h-12 rounded-xl bg-primary/30" />
    </div>
  );
}
