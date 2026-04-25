"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "@/contexts/AuthContext";
import "@/lib/store/authStore"; // registers token getter with Axios

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime:          1000 * 60 * 5,  // 5 min
            gcTime:             1000 * 60 * 10, // 10 min
            retry:              1,
            refetchOnWindowFocus: false,
          },
          mutations: { retry: 0 },
        },
      })
  );

  // Ambil Client ID dari environment variables (.env.local)
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <ThemeProvider
        attribute="class"
        forcedTheme="light"
        defaultTheme="light"
        enableSystem={false}
        themes={["light"]}
      >
        <QueryClientProvider client={queryClient}>
          {/* Bungkus children dengan AuthProvider di dalam QueryClientProvider 
              agar AuthContext bisa menggunakan hooks React Query */}
          <AuthProvider>
            {children}
          </AuthProvider>

          {/* Toast notifications — theme-aware */}
          <Toaster
            position="bottom-right"
            theme="system"
            toastOptions={{
              classNames: {
                toast:
                  "!bg-card !border !border-border !text-foreground !font-sans !text-sm",
                title:   "!font-display !uppercase !tracking-wide",
                success: "!border-primary/40",
                error:   "!border-red-500/40",
              },
            }}
          />

          {process.env.NODE_ENV === "development" && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </QueryClientProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}