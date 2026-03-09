"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { validateEmail } from "@/lib/auth-validation";
import AuthInput from "@/components/auth/AuthInput";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailError = validateEmail(email);
    if (emailError) { setError(emailError); return; }

    setIsSubmitting(true);
    // TODO: Replace with real API call
    await new Promise((res) => setTimeout(res, 1200));
    setIsSubmitting(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2] flex flex-col">
      <div className="bg-white px-4 py-4 flex items-center gap-3 sticky top-0 z-20 shadow-sm">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-base font-semibold text-gray-900">Forgot Password</h1>
      </div>

      <div className="relative w-full h-56 md:h-80 mb-8 rounded-2xl overflow-hidden shadow-sm">
        <Image
          src="/images/sneakers-hero.jpeg"
          alt="SNKRS Flash"
          fill
          className="object-cover hover:scale-105 transition-transform duration-500"
          priority
        />
      </div>
      <div className="flex-1 flex flex-col px-5 pt-10 pb-10 max-w-md mx-auto w-full">
        {!sent ? (
          <>
            {/* Lock icon */}
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Reset your password</h2>
            <p className="text-sm text-gray-500 text-center mb-8">
              Enter your email and we&apos;ll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              <AuthInput
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                error={error}
                autoComplete="email"
                inputMode="email"
                disabled={isSubmitting}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl py-4 text-sm font-bold bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 transition-all duration-200 shadow-lg shadow-orange-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Remembered it?{" "}
              <Link href="/login" className="text-orange-500 font-semibold hover:text-orange-600">
                Back to login
              </Link>
            </p>
          </>
        ) : (
          <div className="flex flex-col items-center text-center pt-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Check your inbox</h2>
            <p className="text-sm text-gray-500 mb-8">
              We sent a reset link to <span className="font-medium text-gray-700">{email}</span>
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
