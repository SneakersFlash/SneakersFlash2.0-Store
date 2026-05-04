"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { validateEmail, validatePassword } from "@/lib/auth-validation";
import AuthInput from "./AuthInput";
import SocialLoginButton from "../../../validation/SocialLoginButton";
import AuthHeroBanner from "./AuthHeroBanner";

interface FormState {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string | null;
  password?: string | null;
  general?: string | null;
}

export default function LoginForm() {
  const router = useRouter();
  // 2. Ambil search params dari URL
  const searchParams = useSearchParams(); 
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const { login, loginWithGoogle, loginWithApple } = useAuth();

  const [form, setForm] = useState<FormState>({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | "apple" | null>(null);

  const isFilled = form.email.trim().length > 0 && form.password.length > 0;

  const handleChange = useCallback(
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
      // Clear field error on change
      setErrors((prev) => ({ ...prev, [field]: null, general: null }));
    },
    []
  );

  const validateForm = (): boolean => {
    const emailError = validateEmail(form.email);
    const passwordError = validatePassword(form.password);
    const newErrors: FormErrors = { email: emailError, password: passwordError };
    setErrors(newErrors);
    return !emailError && !passwordError;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const result = await login(form.email, form.password);
    setIsSubmitting(false);

    if (result.success) {
      router.push(callbackUrl); 
    } else {
      setErrors({ general: result.error ?? "Login failed. Please try again." });
    }
  };

  const handleGoogle = async () => {
    setSocialLoading("google");
    const result = await loginWithGoogle();
    setSocialLoading(null);
    if (result.success) router.push(callbackUrl); 
    else setErrors({ general: result.error ?? "Google login failed." });
  };

  const handleApple = async () => {
    setSocialLoading("apple");
    const result = await loginWithApple();
    setSocialLoading(null);
    if (result.success) router.push(callbackUrl); 
    else setErrors({ general: result.error ?? "Apple login failed." });
  };

  const isAnyLoading = isSubmitting || socialLoading !== null;

  return (
    <div className="min-h-screen bg-[#F2F2F2] flex flex-col">
      {/* Header */}
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
        <h1 className="text-base font-semibold text-gray-900">Login</h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-5 pt-6 pb-10 max-w-md mx-auto w-full">

        {/* Hero illustration */}
        <AuthHeroBanner />

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
          {/* General error */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.general}
            </div>
          )}

          <AuthInput
            type="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange("email")}
            error={errors.email}
            autoComplete="email"
            inputMode="email"
            disabled={isAnyLoading}
          />

          <AuthInput
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange("password")}
            error={errors.password}
            autoComplete="current-password"
            disabled={isAnyLoading}
          />

          {/* Forgot password */}
          <div className="flex justify-end -mt-1">
            <Link
              href="/forgot-password"
              className="text-xs text-orange-500 hover:text-orange-600 font-medium transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isAnyLoading}
            className={[
              "w-full rounded-xl py-4 text-sm font-bold transition-all duration-300",
              "focus:outline-none focus:ring-2 focus:ring-orange-300",
              "disabled:cursor-not-allowed",
              isFilled
                ? "bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 shadow-lg shadow-orange-200"
                : "bg-white text-gray-800 border border-gray-200 hover:border-gray-300",
            ].join(" ")}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingSpinner color={isFilled ? "white" : "gray"} />
                Logging in...
              </span>
            ) : (
              "Log In"
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Social buttons */}
          <SocialLoginButton
            provider="google"
            onClick={handleGoogle}
            isLoading={socialLoading === "google"}
            disabled={isAnyLoading}
          />
          <SocialLoginButton
            provider="apple"
            onClick={handleApple}
            isLoading={socialLoading === "apple"}
            disabled={isAnyLoading}
          />
        </form>

        {/* Register link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-orange-500 font-semibold hover:text-orange-600 transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

function LoadingSpinner({ color }: { color: "white" | "gray" }) {
  return (
    <svg
      className={`animate-spin w-4 h-4 ${color === "white" ? "text-white" : "text-gray-400"}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
