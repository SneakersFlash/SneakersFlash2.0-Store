"use client";

import { useState, useEffect, Suspense } from "react";
import PageLoader from "@/components/common/PageLoader";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AuthInput from "@/components/auth/AuthInput";
import { useAuthGMutations } from "@/lib/hooks/useAuthGMutations";

// ─── Tidak ada lagi import WelcomeVoucherPopup di sini ───────────────────────
// Popup sekarang ditampilkan di ClientLayoutWrapper (route main),
// dipicu lewat welcomeVoucher di authStore secara otomatis.

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const { resendOtp } = useAuth();
  const { verifyOtpMutation } = useAuthGMutations();

  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (!email) router.replace("/register");
  }, [email, router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || otp.length !== 6) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // verifyOtpMutation.onSuccess → handleSuccess di useAuthGMutations
      // → setAuth + setWelcomeVoucher (jika ada) → popup muncul di layout (main)
      await verifyOtpMutation.mutateAsync({ email, otp });
      router.push(callbackUrl);
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Invalid OTP code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email || countdown > 0 || isResending) return;
    setIsResending(true);
    setError(null);
    const result = await resendOtp(email);
    setIsResending(false);
    if (result.success) {
      setCountdown(60);
    } else {
      setError(result.error ?? "Failed to resend OTP.");
    }
  };

  const isFilled = otp.length === 6;
  if (!email) return null;

  return (
    <div className="min-h-screen bg-[#F2F2F2] flex flex-col">
      <div className="bg-white px-4 py-4 flex items-center gap-3 sticky top-0 z-20 shadow-sm">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Go back"
        >
          <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-base font-semibold text-gray-900">Verification</h1>
      </div>

      <div className="flex-1 flex flex-col px-5 pt-10 pb-10 max-w-md mx-auto w-full">
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Check Your Email</h2>
        <p className="text-sm text-gray-500 text-center mb-8">
          We&apos;ve sent a 6-digit verification code to <br />
          <span className="font-semibold text-gray-800">{email}</span>
        </p>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <div className="text-center">
            <AuthInput
              type="text"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
                setOtp(val);
                setError(null);
              }}
              inputMode="numeric"
              autoComplete="one-time-code"
              disabled={isSubmitting || isResending}
              className="text-center text-lg tracking-[0.5em] font-semibold"
            />
          </div>

          <button
            type="submit"
            disabled={!isFilled || isSubmitting || isResending}
            className={[
              "w-full rounded-xl py-4 text-sm font-bold transition-all duration-300 mt-2",
              "focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:cursor-not-allowed",
              isFilled
                ? "bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 shadow-lg shadow-orange-200"
                : "bg-white text-gray-800 border border-gray-200 hover:border-gray-300",
            ].join(" ")}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingSpinner color={isFilled ? "white" : "gray"} />
                Verifying...
              </span>
            ) : (
              "Verify Account"
            )}
          </button>
        </form>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">Didn&apos;t receive the code?</p>
          <button
            onClick={handleResend}
            disabled={countdown > 0 || isResending}
            className="mt-2 text-sm font-semibold transition-colors disabled:text-gray-400 text-orange-500 hover:text-orange-600"
          >
            {isResending ? "Sending..." : countdown > 0 ? `Resend code in ${countdown}s` : "Resend OTP"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <VerifyOtpContent />
    </Suspense>
  );
}

function LoadingSpinner({ color }: { color: "white" | "gray" }) {
  return (
    <svg
      className={`animate-spin w-5 h-5 ${color === "white" ? "text-white" : "text-gray-500"}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}