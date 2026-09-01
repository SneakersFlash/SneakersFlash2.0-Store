"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User, WelcomeVoucher, WelcomePoints } from "@/types/user.types";
import { registerTokenGetter, registerUnauthorizedHandler } from "@/lib/api/client";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  /** Voucher selamat datang — diset saat login pertama, dikosongkan setelah popup ditutup */
  welcomeVoucher: WelcomeVoucher | null;
  /** Bonus poin member baru — dipakai selama promo Kemerdekaan, gantinya voucher */
  welcomePoints: WelcomePoints | null;

  // Actions
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  setHydrated: () => void;
  setWelcomeVoucher: (voucher: WelcomeVoucher) => void;
  clearWelcomeVoucher: () => void;
  setWelcomePoints: (points: WelcomePoints) => void;
  clearWelcomePoints: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isHydrated: false,
      welcomeVoucher: null,
      welcomePoints: null,

      setAuth: (user, token) => {
        set({ user, token, isAuthenticated: true });
      },

      clearAuth: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      setHydrated: () => set({ isHydrated: true }),

      setWelcomeVoucher: (voucher) => set({ welcomeVoucher: voucher }),

      clearWelcomeVoucher: () => set({ welcomeVoucher: null }),

      setWelcomePoints: (points) => set({ welcomePoints: points }),

      clearWelcomePoints: () => set({ welcomePoints: null }),
    }),
    {
      name: "sf-auth",
      // localStorage, bukan sessionStorage. sessionStorage mati begitu tab
      // ditutup dan tidak dibagi antar tab, jadi pembeli yang membuka produk
      // di tab baru — jalur paling umum dari IG/TikTok/Google — datang dalam
      // keadaan seolah belum login. Keranjang sendiri sudah di localStorage,
      // sehingga isinya bertahan sementara sesinya hilang: justru kombinasi itu
      // yang memantulkan orang ke /login tepat di depan checkout.
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        // welcomeVoucher & welcomePoints sengaja TIDAK di-persist agar tidak muncul ulang setelah refresh
      }),
      onRehydrateStorage: () => (state) => {
        // Dipanggil juga ketika storage kosong atau gagal dibaca, dan pada
        // kasus itu `state` bisa undefined. Flag ini sekarang menggerbangi
        // redirect di halaman checkout, jadi ia wajib menyala apa pun hasil
        // rehydrate — kalau tidak, checkout tertahan di loader selamanya.
        (state ?? useAuthStore.getState()).setHydrated();
      },
    }
  )
);

// ─── Register the token getter with Axios client ──────────────────────────────
if (typeof window !== "undefined") {
  registerTokenGetter(() => useAuthStore.getState().token);
  registerUnauthorizedHandler(() => useAuthStore.getState().clearAuth());
}