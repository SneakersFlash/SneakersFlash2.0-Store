// src/features/auth/api/auth.service.ts
// (atau di src/lib/api/auth.service.ts)

import apiClient from "@/lib/api/client";
import { LoginDto, AuthResponse, RegisterDto, OAuthLoginDto, User } from "@/types/user.types";

export const authService = {
  // --- Local Auth ---
  async login(dto: LoginDto): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>("/auth/login", dto);
    return data;
  },

  register: async (dto: RegisterDto): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/auth/register', dto);
    return response.data;
  },

  verifyOtp: async (data: { email: string; otp: string }): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/verify-otp', data);
    return response.data;
  },

  resendOtp: async (data: { email: string }): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/auth/resend-otp', data);
    return response.data;
  },

  // --- Password Reset (OTP) ---
  // Responsnya seragam walau email tidak terdaftar — jangan dipakai untuk
  // menyimpulkan apakah sebuah email punya akun.
  forgotPassword: async (data: { email: string }): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/auth/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: {
    email: string;
    otp: string;
    newPassword: string;
  }): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/auth/reset-password', data);
    return response.data;
  },

  // --- OAuth ---
  async loginWithGoogle(dto: OAuthLoginDto): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>("/auth/google", dto);
    return data;
  },

  async loginWithApple(dto: OAuthLoginDto): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>("/auth/apple", dto);
    return data;
  },

  // --- Session ---
  async getMe(): Promise<User> {
    const { data } = await apiClient.get<User>("/auth/me");
    return data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // Silent catch
    }
  },
};