"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User, WelcomeVoucher } from "@/types/user.types";
import { registerTokenGetter, registerUnauthorizedHandler } from "@/lib/api/client";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  /** Voucher selamat datang — diset saat login pertama, dikosongkan setelah popup ditutup */
  welcomeVoucher: WelcomeVoucher | null;

  // Actions
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  setHydrated: () => void;
  setWelcomeVoucher: (voucher: WelcomeVoucher) => void;
  clearWelcomeVoucher: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isHydrated: false,
      welcomeVoucher: null,

      setAuth: (user, token) => {
        set({ user, token, isAuthenticated: true });
      },

      clearAuth: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      setHydrated: () => set({ isHydrated: true }),

      setWelcomeVoucher: (voucher) => set({ welcomeVoucher: voucher }),

      clearWelcomeVoucher: () => set({ welcomeVoucher: null }),
    }),
    {
      name: "sf-auth",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        // welcomeVoucher sengaja TIDAK di-persist agar tidak muncul ulang setelah refresh
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated();
        }
      },
    }
  )
);

// ─── Register the token getter with Axios client ──────────────────────────────
if (typeof window !== "undefined") {
  registerTokenGetter(() => useAuthStore.getState().token);
  registerUnauthorizedHandler(() => useAuthStore.getState().clearAuth());
}