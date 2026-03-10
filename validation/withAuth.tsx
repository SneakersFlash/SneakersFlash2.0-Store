"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";

interface WithAuthOptions {
  redirectTo?: string;
}

/**
 * Higher-order component to protect pages that require authentication.
 * Usage: export default withAuth(ProtectedPage);
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const { redirectTo = "/login" } = options;

  return function AuthGuard(props: P) {
    // Ambil state dari Zustand, bukan dari AuthContext
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isHydrated = useAuthStore((state) => state.isHydrated);
    
    const router = useRouter();

    useEffect(() => {
      // Pastikan store sudah di-hydrate dari localStorage sebelum mengecek auth
      if (isHydrated && !isAuthenticated) {
        router.replace(redirectTo);
      }
    }, [isAuthenticated, isHydrated, router, redirectTo]);

    // Tampilkan loading screen selama data di localStorage sedang dibaca (hydration)
    if (!isHydrated) return <AuthLoadingScreen />;
    
    // Jangan render komponen asli jika user belum login (karena sedang proses redirect)
    if (!isAuthenticated) return null;

    return <Component {...props} />;
  };
}

/**
 * Hook version of auth guard for use inside components.
 */
export function useRequireAuth(redirectTo = "/login") {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isHydrated, redirectTo, router]);

  // Kembalikan isHydrated sebagai pengganti isLoading
  return { isAuthenticated, isLoading: !isHydrated };
}

function AuthLoadingScreen() {
  return (
    <div className="min-h-screen bg-[#F2F2F2] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center animate-pulse">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-9z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-500 tracking-wide animate-pulse">
          Memverifikasi akses...
        </p>
      </div>
    </div>
  );
}