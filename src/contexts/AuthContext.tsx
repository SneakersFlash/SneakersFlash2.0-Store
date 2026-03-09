"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  provider?: "email" | "google" | "apple";
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginWithApple: () => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("sneakerflash_user");
      if (stored) {
        const user: User = JSON.parse(stored);
        setState({ user, isLoading: false, isAuthenticated: true });
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const setUser = useCallback((user: User | null) => {
    setState({ user, isLoading: false, isAuthenticated: !!user });
    if (user) {
      localStorage.setItem("sneakerflash_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("sneakerflash_user");
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));
        // TODO: Replace with real API call
        await new Promise((res) => setTimeout(res, 1200));
        if (password.length < 6) {
          setState((prev) => ({ ...prev, isLoading: false }));
          return { success: false, error: "Invalid email or password." };
        }
        const user: User = {
          id: crypto.randomUUID(),
          email,
          name: email.split("@")[0],
          provider: "email",
        };
        setUser(user);
        return { success: true };
      } catch {
        setState((prev) => ({ ...prev, isLoading: false }));
        return { success: false, error: "An unexpected error occurred." };
      }
    },
    [setUser]
  );

  const loginWithGoogle = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      // TODO: Integrate Google OAuth
      await new Promise((res) => setTimeout(res, 1000));
      const user: User = {
        id: crypto.randomUUID(),
        email: "google.user@gmail.com",
        name: "Google User",
        provider: "google",
      };
      setUser(user);
      return { success: true };
    } catch {
      setState((prev) => ({ ...prev, isLoading: false }));
      return { success: false, error: "Google login failed." };
    }
  }, [setUser]);

  const loginWithApple = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      // TODO: Integrate Apple OAuth
      await new Promise((res) => setTimeout(res, 1000));
      const user: User = {
        id: crypto.randomUUID(),
        email: "apple.user@icloud.com",
        name: "Apple User",
        provider: "apple",
      };
      setUser(user);
      return { success: true };
    } catch {
      setState((prev) => ({ ...prev, isLoading: false }));
      return { success: false, error: "Apple login failed." };
    }
  }, [setUser]);

  const logout = useCallback(() => {
    setUser(null);
  }, [setUser]);

  const register = useCallback(
    async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));
        // TODO: Replace with real API call
        await new Promise((res) => setTimeout(res, 1200));
        const user: User = {
          id: crypto.randomUUID(),
          email,
          name,
          provider: "email",
        };
        setUser(user);
        return { success: true };
      } catch {
        setState((prev) => ({ ...prev, isLoading: false }));
        return { success: false, error: "Registration failed." };
      }
    },
    [setUser]
  );

  return (
    <AuthContext.Provider value={{ ...state, login, loginWithGoogle, loginWithApple, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
