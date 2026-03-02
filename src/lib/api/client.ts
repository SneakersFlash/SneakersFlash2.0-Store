import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

// ─── Token storage helpers ────────────────────────────────────────────────────
// We store the token in memory (Zustand) and read it via a getter function
// to avoid circular imports. The getter is registered by the auth store.

let _getToken: (() => string | null) | null = null;
let _onUnauthorized: (() => void) | null = null;

export function registerTokenGetter(fn: () => string | null) {
  _getToken = fn;
}

export function registerUnauthorizedHandler(fn: () => void) {
  _onUnauthorized = fn;
}

// ─── Axios instance ───────────────────────────────────────────────────────────

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ─── Request interceptor: attach JWT ─────────────────────────────────────────

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = _getToken?.();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor: handle 401 ────────────────────────────────────────

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      _onUnauthorized?.();
    }
    // Normalize error message
    const message =
      (error.response?.data as { message?: string })?.message ??
      error.message ??
      "An unexpected error occurred";

    return Promise.reject(new Error(message));
  }
);

export { apiClient };
export default apiClient;
