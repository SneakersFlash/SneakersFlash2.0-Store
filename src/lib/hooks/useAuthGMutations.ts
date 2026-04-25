import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/lib/api/auth.service";
import { useAuthStore } from "@/lib/store/authStore";
import type { LoginDto, AuthResponse, RegisterDto } from "@/types/user.types";

export function useAuthGMutations() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);
  const setWelcomeVoucher = useAuthStore((state) => state.setWelcomeVoucher);

  const handleSuccess = (data: AuthResponse) => {
    // 1. Simpan user & token ke Zustand (otomatis masuk sessionStorage & interceptor Axios)
    setAuth(data.user, data.access_token);

    // 2. Jika backend mengembalikan welcome voucher (user baru), simpan ke store
    //    → ClientLayoutWrapper di route (main) akan menampilkan WelcomeVoucherPopup
    if (data.welcomeVoucher) {
      setWelcomeVoucher(data.welcomeVoucher);
    }

    // 3. Bersihkan/refresh cache data user & cart
    queryClient.invalidateQueries({ queryKey: ["cart"] });
    queryClient.invalidateQueries({ queryKey: ["user"] });
  };

  const loginMutation = useMutation({
    mutationFn: (dto: LoginDto) => authService.login(dto),
    onSuccess: handleSuccess,
  });

  const googleLoginMutation = useMutation({
    mutationFn: (token: string) => authService.loginWithGoogle({ token }),
    onSuccess: handleSuccess,
  });

  const appleLoginMutation = useMutation({
    mutationFn: (token: string) => authService.loginWithApple({ token }),
    onSuccess: handleSuccess,
  });

  const registerMutation = useMutation({
    mutationFn: (dto: RegisterDto) => authService.register(dto),
  });

  const verifyOtpMutation = useMutation({
    mutationFn: (data: { email: string; otp: string }) => authService.verifyOtp(data),
    onSuccess: handleSuccess,
  });

  const resendOtpMutation = useMutation({
    mutationFn: (data: { email: string }) => authService.resendOtp(data),
  });

  return {
    loginMutation,
    googleLoginMutation,
    appleLoginMutation,
    registerMutation,
    verifyOtpMutation,
    resendOtpMutation,
  };
}