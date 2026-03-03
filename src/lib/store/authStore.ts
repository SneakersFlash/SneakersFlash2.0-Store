"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types/user.types";
import { registerTokenGetter, registerUnauthorizedHandler } from "@/lib/api/client";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;

  // Actions
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isHydrated: false,

      setAuth: (user, token) => {
        set({ user, token, isAuthenticated: true });
      },

      clearAuth: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: "sf-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
        // If there's a stored token, re-set isAuthenticated
        if (state?.token) {
          state.isAuthenticated = true;
        }
      },
    }
  )
);

// ─── Register the token getter with Axios client ──────────────────────────────
// This breaks the circular dependency: apiClient needs the token,
// but can't import the store directly.

if (typeof window !== "undefined") {
  registerTokenGetter(() => useAuthStore.getState().token);
  registerUnauthorizedHandler(() => useAuthStore.getState().clearAuth());
}
