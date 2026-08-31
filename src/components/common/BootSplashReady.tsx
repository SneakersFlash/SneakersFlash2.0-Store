"use client";

import { useEffect } from "react";

/**
 * Menandai <html> begitu React selesai hydrate, yang memicu CSS menghilangkan
 * #boot-splash.
 *
 * Atributnya dipasang di documentElement, bukan di state React, karena
 * splash-nya HTML statis dari server — ia harus bisa dimatikan lewat CSS murni
 * tanpa React perlu me-render ulang apa pun.
 */
export function BootSplashReady() {
  useEffect(() => {
    // requestAnimationFrame: beri satu frame supaya cat pertama halaman asli
    // sudah jadi sebelum splash memudar. Tanpa ini sempat terlihat kedipan
    // konten kosong di antara keduanya.
    const id = requestAnimationFrame(() => {
      document.documentElement.setAttribute("data-app-ready", "");
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return null;
}

export default BootSplashReady;
