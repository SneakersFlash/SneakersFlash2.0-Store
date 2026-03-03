import apiClient from "./client";
import type { AuthResponse, LoginDto, RegisterDto, User } from "@/types/user.types";

export const authService = {
  async login(dto: LoginDto): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>("/auth/login", dto);
    return data;
  },

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>("/auth/register", dto);
    return data;
  },

  async getMe(): Promise<User> {
    const { data } = await apiClient.get<User>("/auth/me");
    return data;
  },

  async logout(): Promise<void> {
    // Backend may have a logout endpoint; otherwise just clear local state
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // Silent — even if it fails, we clear local state
    }
  },
};
