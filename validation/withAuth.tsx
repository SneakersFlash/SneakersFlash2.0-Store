"use client";

import { useEffect } from "react";
// 1. Tambahkan usePathname dan useSearchParams di import
import { useRouter, usePathname, useSearchParams } from "next/navigation"; 
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
    // 2. Gunakan hooks untuk mendapatkan path dan query params
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
      // Pastikan store sudah di-hydrate dari localStorage sebelum mengecek auth
      if (isHydrated && !isAuthenticated) {
        // 3. Susun full path saat ini (beserta query parameternya jika ada)
        let currentPath = pathname;
        const search = searchParams.toString();
        if (search) {
          currentPath += `?${search}`;
        }
        
        // 4. Arahkan dengan menyisipkan callbackUrl
        const loginUrl = `${redirectTo}?callbackUrl=${encodeURIComponent(currentPath)}`;
        router.replace(loginUrl);
      }
    }, [isAuthenticated, isHydrated, router, redirectTo, pathname, searchParams]);

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
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      let currentPath = pathname;
      const search = searchParams.toString();
      if (search) {
        currentPath += `?${search}`;
      }
      
      const loginUrl = `${redirectTo}?callbackUrl=${encodeURIComponent(currentPath)}`;
      console.log(loginUrl);
      
      router.replace(loginUrl);
    }
  }, [isAuthenticated, isHydrated, redirectTo, router, pathname, searchParams]);

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