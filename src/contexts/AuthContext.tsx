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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function   AuthProvider({ children }: { children: ReactNode }) {
  const { loginMutation, googleLoginMutation, appleLoginMutation, registerMutation } = useAuthGMutations();

  // Ref untuk menyimpan fungsi "resolve" dari Promise Google Login
  const googleAuthResolver = useRef<((value: AuthResult) => void) | null>(null);

  // --- 1. LOCAL LOGIN ---
  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      await loginMutation.mutateAsync({ email, password });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "Login failed. Please check your credentials." };
    }
  };

  const register = async (dto: RegisterDto): Promise<AuthResult> => {
    try {
      await registerMutation.mutateAsync(dto);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "Register failed. Please check your input." };
    }
  };

  // --- 2. GOOGLE LOGIN SETUP (Dipanggil di top-level) ---
  const triggerGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        await googleLoginMutation.mutateAsync(tokenResponse.access_token);
        // Jika sukses, selesaikan promise yang tertunda
        if (googleAuthResolver.current) {
          googleAuthResolver.current({ success: true });
        }
      } catch (error: any) {
        if (googleAuthResolver.current) {
          googleAuthResolver.current({ success: false, error: error.message || "Google authentication failed at server." });
        }
      } finally {
        googleAuthResolver.current = null; // Bersihkan ref
      }
    },
    onError: () => {
      if (googleAuthResolver.current) {
        googleAuthResolver.current({ success: false, error: "Failed to open Google login window." });
        googleAuthResolver.current = null;
      }
    },
  });

  // Fungsi yang dipanggil oleh UI (Mengembalikan Promise)
  const loginWithGoogle = (): Promise<AuthResult> => {
    return new Promise((resolve) => {
      // Simpan fungsi resolve ke dalam ref agar bisa dipanggil oleh callbacks useGoogleLogin di atas
      googleAuthResolver.current = resolve;
      // Picu pop-up Google
      triggerGoogleLogin();
    });
  };

  // --- 3. APPLE LOGIN ---
  const loginWithApple = async (): Promise<AuthResult> => {
    try {
      return { success: false, error: "Apple login is not fully configured yet." };
    } catch (error: any) {
      return { success: false, error: error.message || "Apple login failed." };
    }
  };

  return (
    <AuthContext.Provider value={{ login, loginWithGoogle, loginWithApple, register }}>
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