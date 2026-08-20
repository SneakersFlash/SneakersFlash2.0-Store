import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from "axios";

// Sisi browser dan sisi server butuh alamat yang berbeda.
//
// Di browser wajib URL publik. Di server (SSR/ISR) memanggil URL publik berarti
// request keluar ke internet lalu balik lagi lewat Cloudflare + nginx hanya untuk
// sampai ke container sebelah — mahal, dan di NAS malah kejegal Cloudflare Access
// sampai halaman ter-generate kosong.
//
// INTERNAL_API_URL sengaja HANYA di-set saat runtime (docker-compose), TIDAK saat
// `next build`: container build tidak berada di jaringan Docker yang sama, jadi
// `app:3000` tidak ter-resolve di sana. Kalau tidak di-set, jatuh ke URL publik —
// persis perilaku lama.
const API_BASE_URL =
  typeof window === "undefined"
    ? process.env.INTERNAL_API_URL ??
      process.env.NEXT_PUBLIC_API_URL ??
      "http://localhost:3001"
    : process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

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
    // Pertahankan AxiosError beserta response body/status. Halaman checkout
    // membutuhkan code dan detail aman dari backend (mis. kegagalan charge
    // Midtrans); menggantinya dengan `new Error()` membuang semua metadata itu.
    return Promise.reject(error);
  }
);

export { apiClient };
export default apiClient;
