"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { validateEmail, validatePassword } from "@/lib/auth-validation";
import AuthInput from "@/components/auth/AuthInput";
import AuthHeroBanner from "@/components/auth/AuthHeroBanner";
import { authService } from "@/lib/api/auth.service";

type Step = "email" | "otp" | "done";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Langkah 1 — minta OTP. Backend menjawab sama walau email tidak terdaftar,
  // jadi kita selalu maju ke langkah OTP apa pun hasilnya.
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailError = validateEmail(email);
    if (emailError) {
      setFieldError(emailError);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setFieldError(null);
    try {
      await authService.forgotPassword({ email });
      setStep("otp");
      setCountdown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Langkah 2 — tukar OTP + password baru.
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const invalidPassword = validatePassword(password);
    if (invalidPassword) {
      setPasswordError(invalidPassword);
      return;
    }
    if (password !== confirmPassword) {
      setConfirmError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setPasswordError(null);
    setConfirmError(null);
    try {
      await authService.resetPassword({ email, otp, newPassword: password });
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    setError(null);
    try {
      await authService.forgotPassword({ email });
      setCountdown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend code.");
    } finally {
      setIsResending(false);
    }
  };

  const canSubmitOtp = otp.length === 6 && password.length > 0 && confirmPassword.length > 0;

  return (
    <div className="min-h-screen bg-[#F2F2F2] flex flex-col">
      <div className="bg-white px-4 py-4 flex items-center gap-3 sticky top-0 z-20 shadow-sm">
        <button
          onClick={() => (step === "otp" ? setStep("email") : router.back())}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Go back"
        >
          <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-base font-semibold text-gray-900">Forgot Password</h1>
      </div>

      <div className="flex-1 flex flex-col px-5 pt-6 pb-10 max-w-md mx-auto w-full">
        <AuthHeroBanner />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 flex items-center gap-2 mb-4">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}

        {step === "email" && (
          <>
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Reset your password</h2>
            <p className="text-sm text-gray-500 text-center mb-8">
              Enter your email and we&apos;ll send you a 6-digit code.
            </p>

            <form onSubmit={handleRequestOtp} noValidate className="flex flex-col gap-4">
              <AuthInput
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldError(null);
                }}
                error={fieldError}
                autoComplete="email"
                inputMode="email"
                disabled={isSubmitting}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl py-4 text-sm font-bold bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 transition-all duration-200 shadow-lg shadow-orange-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Sending..." : "Send Code"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Remembered it?{" "}
              <Link href="/login" className="text-orange-500 font-semibold hover:text-orange-600">
                Back to login
              </Link>
            </p>
          </>
        )}

        {step === "otp" && (
          <>
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Check your email</h2>
            <p className="text-sm text-gray-500 text-center mb-8">
              If <span className="font-semibold text-gray-800">{email}</span> is registered, we sent
              it a 6-digit code. It expires in 10 minutes.
            </p>

            <form onSubmit={handleResetPassword} noValidate className="flex flex-col gap-4">
              <AuthInput
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6));
                  setError(null);
                }}
                inputMode="numeric"
                autoComplete="one-time-code"
                disabled={isSubmitting}
                className="text-center text-lg tracking-[0.5em] font-semibold"
              />
              <AuthInput
                type="password"
                placeholder="New password (min 8 characters)"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError(null);
                }}
                error={passwordError}
                autoComplete="new-password"
                disabled={isSubmitting}
              />
              <AuthInput
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setConfirmError(null);
                }}
                error={confirmError}
                autoComplete="new-password"
                disabled={isSubmitting}
              />

              <button
                type="submit"
                disabled={!canSubmitOtp || isSubmitting}
                className={[
                  "w-full rounded-xl py-4 text-sm font-bold transition-all duration-300 mt-2",
                  "focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:cursor-not-allowed",
                  canSubmitOtp
                    ? "bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 shadow-lg shadow-orange-200"
                    : "bg-white text-gray-800 border border-gray-200",
                ].join(" ")}
              >
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </button>
            </form>

            <div className="text-center mt-8">
              <p className="text-sm text-gray-500">Didn&apos;t receive the code?</p>
              <button
                onClick={handleResend}
                disabled={countdown > 0 || isResending || isSubmitting}
                className="mt-2 text-sm font-semibold transition-colors disabled:text-gray-400 text-orange-500 hover:text-orange-600"
              >
                {isResending
                  ? "Sending..."
                  : countdown > 0
                    ? `Resend code in ${countdown}s`
                    : "Resend code"}
              </button>
            </div>
          </>
        )}

        {step === "done" && (
          <div className="flex flex-col items-center text-center pt-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Password changed</h2>
            <p className="text-sm text-gray-500 mb-8">
              Your password has been updated. Sign in with your new password.
            </p>
            <Link
              href="/login"
              className="w-full block text-center rounded-xl py-4 text-sm font-bold bg-orange-500 text-white hover:bg-orange-600 transition-all duration-200 shadow-lg shadow-orange-200"
            >
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
