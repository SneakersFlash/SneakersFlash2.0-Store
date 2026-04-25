import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authService } from "../api/auth.service"; // Sesuaikan path
import { useAuthStore } from "@/lib/store/authStore";
import type { LoginDto, RegisterDto, OAuthLoginDto, AuthResponse } from "@/types/user.types";

export function useAuthMutations() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  // Fungsi helper untuk menangani sukses login
  const handleAuthSuccess = (data: AuthResponse) => {
    // 1. Simpan ke Zustand (yang akan otomatis masuk localStorage & Axios header)
    setAuth(data.user, data.access_token);
    
    // 2. Invalidate query jika ada data user/cart yang di-cache
    queryClient.invalidateQueries({ queryKey: ["cart"] });
    queryClient.invalidateQueries({ queryKey: ["user"] });

    // 3. Redirect ke halaman utama atau dashboard
    router.push("/");
  };

  const loginMutation = useMutation({
    mutationFn: (dto: LoginDto) => authService.login(dto),
    onSuccess: handleAuthSuccess,
  });

  const registerMutation = useMutation({
    mutationFn: (dto: RegisterDto) => authService.register(dto),
  });

  const googleLoginMutation = useMutation({
    mutationFn: (dto: OAuthLoginDto) => authService.loginWithGoogle(dto),
    onSuccess: handleAuthSuccess,
  });

  const appleLoginMutation = useMutation({
    mutationFn: (dto: OAuthLoginDto) => authService.loginWithApple(dto),
    onSuccess: handleAuthSuccess,
  });

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      useAuthStore.getState().clearAuth();
      queryClient.clear(); // Bersihkan semua cache
      router.push("/login");
    },
  });

  return {
    login: loginMutation,
    register: registerMutation,
    googleLogin: googleLoginMutation,
    appleLogin: appleLoginMutation,
    logout: logoutMutation,
  };
}