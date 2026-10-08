"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import apiClient from "@/lib/api/client";
import { bacaUtmDariUrl, kunjunganBaru, simpanUtm } from "@/lib/attribution/utm";

/**
 * Tangkap utm_* dari URL pendaratan, simpan untuk checkout, dan catat satu
 * kunjungan ke backend. Dibaca dari window.location (bukan useSearchParams)
 * supaya tidak memaksa seluruh layout jadi dynamic / butuh Suspense - HTML
 * beranda di-cache nginx, jadi penangkapan memang harus terjadi di browser.
 */
export function UtmCapture() {
  const pathname = usePathname();

  useEffect(() => {
    const utm = bacaUtmDariUrl(window.location.search);
    if (!utm) return;
    simpanUtm(utm);
    if (kunjunganBaru(utm)) {
      apiClient.post("/attribution/visit", utm).catch(() => {});
    }
  }, [pathname]);

  return null;
}
