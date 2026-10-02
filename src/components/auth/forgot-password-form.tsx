"use client";

import { AuthErrorBanner } from "@/components/auth/auth-error-banner";
import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RESET_PASSWORD_COPY } from "@/constants/auth";
import {
  useForgotPassword,
  useResetPassword,
} from "@/hooks/use-password-reset";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";

interface ForgotPasswordFormProps {
  initialEmail?: string;
  onBackToLogin: () => void;
  onSuccess: (email: string) => void;
}

type ResetStep = "request_otp" | "verify_otp" | "success";

const ICON_SIZE = { width: 16, height: 16 } as const;

export function ForgotPasswordForm({
  initialEmail = "",
  onBackToLogin,
  onSuccess,
}: ForgotPasswordFormProps) {
  const [step, setStep] = useState<ResetStep>("request_otp");
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const forgotMutation = useForgotPassword();
  const resetMutation = useResetPassword();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      await forgotMutation.mutateAsync({ email: trimmed });
      setStep("verify_otp");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to generate reset code",
      );
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedOtp = otp.trim();
    if (!trimmedOtp || trimmedOtp.length !== 6) {
      setError("Please enter the 6-digit code from the terminal");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }

    try {
      await resetMutation.mutateAsync({
        email: email.trim(),
        otp: trimmedOtp,
        newPassword,
      });
      setStep("success");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    }
  };

  if (step === "success") {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-4 animate-in fade-in duration-200">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-foreground">
            Password Reset Complete
          </h2>
          <p className="text-xs text-muted-foreground">
            {RESET_PASSWORD_COPY.SUCCESS}
          </p>
        </div>
        <Button
          type="button"
          variant="tactile"
          size="lg"
          onClick={() => onSuccess(email)}
          className="mt-2 w-full"
        >
          <span>{RESET_PASSWORD_COPY.BACK_TO_LOGIN}</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  if (step === "verify_otp") {
    return (
      <form
        noValidate
        onSubmit={handleResetPassword}
        className="flex flex-col gap-4 animate-in fade-in duration-200"
      >
        <div className="flex items-center justify-between pb-1">
          <button
            type="button"
            onClick={() => setStep("request_otp")}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft style={ICON_SIZE} />
            <span>Change email</span>
          </button>
          <span className="text-[11px] font-mono text-muted-foreground">
            {email}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#FFEBE7]/60 dark:bg-[#FF5338]/10 border border-[#FF5338]/20 text-[12px] text-[#B51D07] dark:text-[#FF8A00] leading-relaxed">
          <strong>Terminal OTP:</strong> {RESET_PASSWORD_COPY.OTP_SENT}
        </div>

        {error && <AuthErrorBanner message={error} />}

        <Field id="reset-otp" label="6-Digit Reset Code">
          <Input
            id="reset-otp"
            name="otp"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            required
            className="tracking-widest font-mono text-center text-base"
          />
        </Field>

        <Field id="reset-new-password" label="New Password">
          <PasswordField
            id="reset-new-password"
            name="newPassword"
            autoComplete="new-password"
            placeholder="Minimum 8 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </Field>

        <Button
          type="submit"
          variant="tactile"
          size="lg"
          disabled={resetMutation.isPending}
          className="mt-2 w-full"
        >
          {resetMutation.isPending ? (
            <>
              <Loader2 className="animate-spin" style={ICON_SIZE} />
              <span>{RESET_PASSWORD_COPY.VERIFYING}</span>
            </>
          ) : (
            <>
              <span>{RESET_PASSWORD_COPY.VERIFY_SUBMIT}</span>
              <ArrowRight style={ICON_SIZE} />
            </>
          )}
        </Button>

        <button
          type="button"
          onClick={onBackToLogin}
          className="mt-1 text-center text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          {RESET_PASSWORD_COPY.BACK_TO_LOGIN}
        </button>
      </form>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleRequestOtp}
      className="flex flex-col gap-4 animate-in fade-in duration-200"
    >
      <div className="space-y-1 pb-1">
        <h2 className="text-sm font-semibold text-foreground">
          Reset your password
        </h2>
        <p className="text-xs text-muted-foreground">
          Enter your studio email. A 6-digit verification code will be generated
          in the terminal.
        </p>
      </div>

      {error && <AuthErrorBanner message={error} />}

      <Field id="forgot-email" label="Email address">
        <Input
          id="forgot-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="name@studio.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </Field>

      <Button
        type="submit"
        variant="tactile"
        size="lg"
        disabled={forgotMutation.isPending}
        className="mt-2 w-full"
      >
        {forgotMutation.isPending ? (
          <>
            <Loader2 className="animate-spin" style={ICON_SIZE} />
            <span>{RESET_PASSWORD_COPY.SENDING}</span>
          </>
        ) : (
          <>
            <span>{RESET_PASSWORD_COPY.SEND_OTP_SUBMIT}</span>
            <ArrowRight style={ICON_SIZE} />
          </>
        )}
      </Button>

      <button
        type="button"
        onClick={onBackToLogin}
        className="mt-1 text-center text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        {RESET_PASSWORD_COPY.BACK_TO_LOGIN}
      </button>
    </form>
  );
}
