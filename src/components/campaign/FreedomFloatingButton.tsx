"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  FREEDOM_BERAKHIR,
  FREEDOM_BELANJA_BUKA,
  FREEDOM_HREF,
  FREEDOM_LABEL_PENDEK,
} from "@/lib/campaign/freedom-in-every-step";

/**
 * Tombol mengambang menuju halaman campaign Freedom in Every Step.
 *
 * Bentuknya mengikuti tombol 8.8 yang lama, dengan satu tambahan: selama
 * belanja belum dibuka, baris keduanya berganti jadi hitungan mundur ke jam
 * buka alih-alih tagline. Jadi tombol ini sekaligus pengingat waktu.
 *
 * Disembunyikan di halaman campaign itu sendiri (percuma) dan di checkout
 * (jangan menarik orang keluar dari alur bayar). Juga hilang sendiri begitu
 * campaign lewat, supaya tidak perlu deploy lagi cuma untuk mencabutnya.
 */
export function FreedomFloatingButton() {
  const pathname = usePathname();
  const [tampil, setTampil] = useState(false);
  const [sisa, setSisa] = useState<string | null>(null);

  // Dipasang sesudah mount: tanpa ini, keputusan "sudah lewat atau belum"
  // dihitung saat build dan bisa beda dengan jam pembeli.
  useEffect(() => {
    if (Date.now() >= Date.parse(FREEDOM_BERAKHIR)) return;
    const t = setTimeout(() => setTampil(true), 600);
    return () => clearTimeout(t);
  }, []);

  // Hitungan mundur ke jam belanja dibuka. Berhenti sendiri begitu lewat: sisa
  // jadi null dan tombol kembali menampilkan tagline.
  useEffect(() => {
    const buka = Date.parse(FREEDOM_BELANJA_BUKA);

    const hitung = () => {
      const selisih = buka - Date.now();
      if (selisih <= 0) {
        setSisa(null);
        return;
      }
      const totalDetik = Math.floor(selisih / 1000);
      const hari = Math.floor(totalDetik / 86400);
      const jam = Math.floor((totalDetik % 86400) / 3600);
      const menit = Math.floor((totalDetik % 3600) / 60);
      const detik = totalDetik % 60;
      setSisa(
        hari > 0
          ? `${hari}h ${jam}j ${menit}m`
          : `${String(jam).padStart(2, "0")}:${String(menit).padStart(2, "0")}:${String(detik).padStart(2, "0")}`,
      );
    };

    hitung();
    const timer = setInterval(hitung, 1000);
    return () => clearInterval(timer);
  }, []);

  const disembunyikan =
    pathname === FREEDOM_HREF ||
    pathname.startsWith(`${FREEDOM_HREF}/`) ||
    pathname.startsWith("/checkout");

  if (disembunyikan) return null;

  return (
    <Link
      href={FREEDOM_HREF}
      aria-label={`Buka halaman ${FREEDOM_LABEL_PENDEK}`}
      className={cn(
        "fixed z-40 right-4 flex items-center gap-2.5 rounded-full",
        // #9E0107 = warna campaign Freedom, sama dengan hero & section home.
        "bg-[#9E0107] text-white shadow-lg shadow-red-900/25",
        "pl-3 pr-4 py-2.5 group",
        "transition-all duration-300 ease-out hover:bg-[#800106] active:scale-95",
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
        <span className="text-[13px] font-extrabold tracking-tight uppercase">
          {FREEDOM_LABEL_PENDEK}
        </span>
        <span className="text-[9px] font-medium uppercase tracking-wider text-white/80 mt-0.5 tabular-nums">
          {sisa ? `Belanja buka ${sisa}` : "Promo Kemerdekaan"}
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
