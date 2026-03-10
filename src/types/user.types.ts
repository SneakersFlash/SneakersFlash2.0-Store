// src/features/auth/types/index.ts 
// (atau di src/types/user.types.ts jika Anda belum memindahkannya)

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: "USER" | "ADMIN";
  provider?: "LOCAL" | "GOOGLE" | "APPLE"; // Tambahan untuk tracking OAuth
  createdAt: string;
}

export interface AuthTokens {
  access_token: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface OAuthLoginDto {
  token: string; // Token ID yang didapat dari Google/Apple SDK di frontend
}

export interface AuthResponse {
  access_token: string;
  user: User;
}