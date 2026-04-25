// src/contexts/AuthContext.tsx
"use client";

import { createContext, useContext, ReactNode, useRef } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuthGMutations } from "@/lib/hooks/useAuthGMutations";
import { RegisterDto } from "@/types/user.types";

interface AuthResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  login: (email: string, password: string) => Promise<AuthResult>;
  loginWithGoogle: () => Promise<AuthResult>;
  loginWithApple: () => Promise<AuthResult>;
  register: (dto: RegisterDto) => Promise<AuthResult>;
  // TAMBAHKAN TIPE BARU
  verifyOtp: (email: string, otp: string) => Promise<AuthResult>;
  resendOtp: (email: string) => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Destructure mutation yang baru ditambahkan
  const { 
    loginMutation, 
    googleLoginMutation, 
    appleLoginMutation, 
    registerMutation,
    verifyOtpMutation,
    resendOtpMutation
  } = useAuthGMutations();

  const googleAuthResolver = useRef<((value: AuthResult) => void) | null>(null);

  // --- 1. LOCAL LOGIN & REGISTER ---
  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      await loginMutation.mutateAsync({ email, password });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message || "Login failed. Please check your credentials." };
    }
  };

  const register = async (dto: RegisterDto): Promise<AuthResult> => {
    try {
      await registerMutation.mutateAsync(dto);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message || "Register failed. Please check your input." };
    }
  };

  // --- 2. OTP FUNCTIONS (BARU) ---
  const verifyOtp = async (email: string, otp: string): Promise<AuthResult> => {
    try {
      await verifyOtpMutation.mutateAsync({ email, otp });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || "Invalid or expired OTP." };
    }
  };

  const resendOtp = async (email: string): Promise<AuthResult> => {
    try {
      await resendOtpMutation.mutateAsync({ email });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || "Failed to resend OTP." };
    }
  };

  // --- 3. GOOGLE LOGIN SETUP ---
  const triggerGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        await googleLoginMutation.mutateAsync(tokenResponse.access_token);
        if (googleAuthResolver.current) {
          googleAuthResolver.current({ success: true });
        }
      } catch (error: any) {
        if (googleAuthResolver.current) {
          googleAuthResolver.current({ success: false, error: error.response?.data?.message || error.message || "Google authentication failed at server." });
        }
      } finally {
        googleAuthResolver.current = null;
      }
    },
    onError: () => {
      if (googleAuthResolver.current) {
        googleAuthResolver.current({ success: false, error: "Failed to open Google login window." });
        googleAuthResolver.current = null;
      }
    },
  });

  const loginWithGoogle = (): Promise<AuthResult> => {
    return new Promise((resolve) => {
      googleAuthResolver.current = resolve;
      triggerGoogleLogin();
    });
  };

  // --- 4. APPLE LOGIN ---
  const loginWithApple = async (): Promise<AuthResult> => {
    try {
      return { success: false, error: "Apple login is not fully configured yet." };
    } catch (error: any) {
      return { success: false, error: error.message || "Apple login failed." };
    }
  };

  return (
    // JANGAN LUPA MASUKKAN verifyOtp DAN resendOtp KE PROVIDER
    <AuthContext.Provider value={{ login, loginWithGoogle, loginWithApple, register, verifyOtp, resendOtp }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};