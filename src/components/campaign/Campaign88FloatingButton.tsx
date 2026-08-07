"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  CAMPAIGN_88_BERAKHIR,
  CAMPAIGN_88_HREF,
} from "@/lib/campaign/infinite-deals-88";

/**
 * Tombol mengambang menuju halaman campaign.
 *
 * Disembunyikan di halaman campaign itu sendiri (percuma) dan di checkout
 * (jangan menarik orang keluar dari alur bayar). Juga hilang sendiri begitu
 * campaign lewat, supaya tidak perlu deploy lagi cuma untuk mencabutnya.
 */
export function Campaign88FloatingButton() {
  const pathname = usePathname();
  const [tampil, setTampil] = useState(false);

  // Dipasang sesudah mount: tanpa ini, keputusan "sudah lewat atau belum"
  // dihitung saat build dan bisa beda dengan jam pembeli.
  useEffect(() => {
    if (Date.now() >= Date.parse(CAMPAIGN_88_BERAKHIR)) return;
    // Jeda singkat supaya tombol tidak menabrak konten saat halaman baru muncul.
    const t = setTimeout(() => setTampil(true), 600);
    return () => clearTimeout(t);
  }, []);

  const disembunyikan =
    pathname === CAMPAIGN_88_HREF ||
    pathname.startsWith(`${CAMPAIGN_88_HREF}/`) ||
    pathname.startsWith("/checkout");

  if (disembunyikan) return null;

  return (
    <Link
      href={CAMPAIGN_88_HREF}
      aria-label="Buka halaman 8.8 Sale"
      className={cn(
        "fixed z-40 right-4 flex items-center gap-2.5 rounded-full",
        "bg-[#E50000] text-white shadow-lg shadow-red-500/25",
        "pl-3 pr-4 py-2.5 group",
        "transition-all duration-300 ease-out hover:bg-red-600 active:scale-95",
        // Di layar kecil bottom-nav (~64px) menutupi kanan bawah, jadi tombol
        // digeser naik di atasnya; desktop tidak punya bottom-nav.
        "bottom-[200px] lg:bottom-[100px]",
        tampil
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-3 pointer-events-none",
      )}
    >
      {/* Titik berdenyut — bahasa visual yang sama dengan lencana Special Event */}
      <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
      </span>

      <span className="flex flex-col leading-none">
        <span className="text-[13px] font-extrabold tracking-tight">8.8 SALE</span>
        <span className="text-[9px] font-medium uppercase tracking-wider text-white/80 mt-0.5">
          Infinite Deals
        </span>
      </span>

      <ArrowRight
        size={15}
        strokeWidth={2.5}
        className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
      />
    </Link>
  );
}
