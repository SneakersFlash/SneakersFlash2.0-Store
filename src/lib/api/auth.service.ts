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

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>("/auth/register", dto);
    return data;
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