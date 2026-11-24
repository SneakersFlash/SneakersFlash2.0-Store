"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { captureFbc, syncAdvancedMatchingCache } from "@/lib/utils/metaMatching";

/**
 * - Tangkap fbclid → cookie _fbc di tiap pendaratan.
 * - Jaga cache Advanced Matching (em/ph/external_id ter-hash) sesuai user yang
 *   login. Script init pixel di layout membaca cache ini secara sinkron, jadi
 *   halaman BERIKUTNYA setelah login sudah membawa data pencocokan.
 */
export function MetaMatchingCapture() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    captureFbc(window.location.search, window.location.hostname);
  }, [pathname]);

  useEffect(() => {
    // Sebelum store auth selesai dibaca dari localStorage, user selalu null —
    // jangan sampai itu menghapus cache milik user yang sebenarnya login.
    if (!useAuthStore.persist?.hasHydrated?.()) return;
    void syncAdvancedMatchingCache(user ?? null);
  }, [user?.id, user?.email, user?.phone]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
