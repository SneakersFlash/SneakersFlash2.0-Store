"use client";

import { useEffect } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Setiap deploy, Next.js merotasi hash nama file di /_next/static/. Chunk lama
// LENYAP dari container baru, sedangkan browser yang masih memegang HTML lama
// (tab dibiarkan terbuka, tombol back, bfcache, atau HTML yang ke-cache nginx
// lalu menyeberangi momen deploy) tetap meminta nama file versi lama → 404 →
// ChunkLoadError → halaman blank.
//
// Guard ini menangkap error itu dan me-reload SEKALI supaya klien mengambil HTML
// baru berikut peta chunk yang benar. Cooldown lewat sessionStorage mencegah
// loop reload kalau ternyata penyebabnya bukan rotasi chunk (mis. jaringan mati).
// ─────────────────────────────────────────────────────────────────────────────

const RELOAD_KEY = "sf:chunk-reload-at";
const COOLDOWN_MS = 60_000;

function looksLikeChunkError(text: string): boolean {
  return (
    /ChunkLoadError/i.test(text) ||
    /Loading chunk [\w./-]+ failed/i.test(text) ||
    /Loading CSS chunk/i.test(text) ||
    /Failed to fetch dynamically imported module/i.test(text) ||
    /error loading dynamically imported module/i.test(text)
  );
}

export function ChunkReloadGuard() {
  useEffect(() => {
    const recoverOnce = () => {
      try {
        const last = Number(window.sessionStorage.getItem(RELOAD_KEY) ?? 0);
        if (Date.now() - last < COOLDOWN_MS) return;
        window.sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
      } catch {
        // sessionStorage bisa dilarang (mode privasi ketat). Tanpa penanda,
        // reload berulang lebih berbahaya daripada halaman rusak — jadi diam.
        return;
      }
      window.location.reload();
    };

    const onError = (event: ErrorEvent) => {
      // Kasus 1: <script>/<link> gagal dimuat. Error resource tidak bubble,
      // makanya listener dipasang di fase capture — dan pesannya kosong, yang
      // bisa dibaca cuma target-nya.
      const target = event.target;
      if (target instanceof HTMLElement) {
        // Baca atribut mentah, bukan properti .src/.href — elemennya bisa
        // <script> atau <link> dan atributnya nilainya sama-sama berguna.
        const url =
          target.getAttribute("src") ?? target.getAttribute("href") ?? "";
        if (url.includes("/_next/static/")) {
          recoverOnce();
          return;
        }
      }

      // Kasus 2: ChunkLoadError yang dilempar webpack runtime.
      if (looksLikeChunkError(`${event.message ?? ""}`)) recoverOnce();
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason as { name?: string; message?: string } | string;
      const text =
        typeof reason === "string"
          ? reason
          : `${reason?.name ?? ""} ${reason?.message ?? ""}`;
      if (looksLikeChunkError(text)) recoverOnce();
    };

    window.addEventListener("error", onError, true);
    window.addEventListener("unhandledrejection", onRejection);

    return () => {
      window.removeEventListener("error", onError, true);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
