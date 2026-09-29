import { resolveCallbackUrl } from "@/lib/auth-redirect";
import {
  AUTH_ERROR_CODES,
  AUTH_PROVIDERS,
  LOGIN_COPY,
  LOGIN_FIELDS,
} from "@/lib/constants";
import { loginSchema } from "@/lib/validations";
import type {
  LoginField,
  LoginFieldErrors,
  LoginFormStatus,
  LoginInput,
} from "@/types/auth";
import { signIn } from "next-auth/react";
import { useCallback, useState } from "react";
import type { ZodError } from "zod";

const INITIAL_VALUES: LoginInput = { email: "", password: "" };

const FIELD_ORDER: readonly LoginField[] = [
  LOGIN_FIELDS.EMAIL.name,
  LOGIN_FIELDS.PASSWORD.name,
];

function toFieldErrors(error: ZodError<LoginInput>): LoginFieldErrors {
  const { fieldErrors } = error.flatten();
  return {
    email: fieldErrors.email?.[0],
    password: fieldErrors.password?.[0],
  };
}

function getFieldError(
  values: LoginInput,
  field: LoginField,
): string | undefined {
  const result = loginSchema.safeParse(values);
  return result.success ? undefined : toFieldErrors(result.error)[field];
}

function focusField(form: HTMLFormElement, field: LoginField): void {
  const control = form.elements.namedItem(field);
  if (control instanceof HTMLInputElement) {
    control.focus();
  }
}

export function useLoginForm(rawCallbackUrl: string | null) {
  const [values, setValues] = useState<LoginInput>(INITIAL_VALUES);
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [status, setStatus] = useState<LoginFormStatus>("idle");

  const setValue = useCallback(
    (field: LoginField, value: string) => {
      const next = { ...values, [field]: value };
      setValues(next);
      if (fieldErrors[field]) {
        setFieldErrors((errors) => ({
          ...errors,
          [field]: getFieldError(next, field),
        }));
      }
      setFormError(null);
    },
    [values, fieldErrors],
  );

  const validateField = useCallback(
    (field: LoginField) => {
      if (!values[field] && !fieldErrors[field]) {
        return;
      }
      setFieldErrors((errors) => ({
        ...errors,
        [field]: getFieldError(values, field),
      }));
    },
    [values, fieldErrors],
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (status !== "idle") {
        return;
      }

      const form = event.currentTarget;
      setFormError(null);

      const parsed = loginSchema.safeParse(values);
      if (!parsed.success) {
        const errors = toFieldErrors(parsed.error);
        setFieldErrors(errors);
        const firstInvalid = FIELD_ORDER.find((field) => errors[field]);
        if (firstInvalid) {
          focusField(form, firstInvalid);
        }
        return;
      }

      setFieldErrors({});
      setStatus("submitting");

      try {
        const response = await signIn(AUTH_PROVIDERS.CREDENTIALS, {
          redirect: false,
          ...parsed.data,
        });

        if (!response?.ok || response.error) {
          setFormError(
            response?.error === AUTH_ERROR_CODES.CREDENTIALS_SIGNIN
              ? LOGIN_COPY.INVALID_CREDENTIALS
              : LOGIN_COPY.UNEXPECTED,
          );
          setStatus("idle");
          focusField(form, LOGIN_FIELDS.PASSWORD.name);
          return;
        }

        setStatus("redirecting");
        window.location.assign(
          resolveCallbackUrl(rawCallbackUrl, window.location.origin),
        );
      } catch {
        setFormError(LOGIN_COPY.UNEXPECTED);
        setStatus("idle");
      }
    },
    [rawCallbackUrl, status, values],
  );

  return {
    values,
    fieldErrors,
    formError,
    status,
    setValue,
    validateField,
    handleSubmit,
  };
}
