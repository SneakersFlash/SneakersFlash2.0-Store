"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const HREF = "/jrf2026";
// Sama dengan CAMPAIGN.claimStart/claimEnd di JrfVoucherPage.
const MULAI = "2026-10-22T00:00:00+07:00";
const SELESAI = "2026-10-29T23:59:59+07:00";
const KUNCI_CIUT = "jrf-fab-ciut";

/**
 * Tombol mengambang menuju klaim voucher JRF 2026 — di HP ini pintu masuk
 * utama, karena navbar desktop tidak tampil di sana.
 *
 * Bisa diciutkan (×) jadi bulatan kecil dan dibuka lagi dengan mengetuk
 * bulatan itu. Pilihan ciut diingat per sesi tab, jadi tidak muncul lebar lagi
 * di tiap pindah halaman, tapi kembali lebar di kunjungan berikutnya.
 *
 * Posisinya di atas tombol chat (`bottom-[80px] lg:bottom-5`, tinggi 56px),
 * cetakan yang sama dengan MerdekaFloatingButton; z-40 supaya panel chat
 * (z-50) menutupinya saat dibuka.
 */
export function JrfFloatingButton() {
  const pathname = usePathname();
  const [tampil, setTampil] = useState(false);
  const [ciut, setCiut] = useState(false);

  // Diputuskan sesudah mount supaya tidak ikut ter-prerender ke cache.
  useEffect(() => {
    const sekarang = Date.now();
    if (sekarang < Date.parse(MULAI) || sekarang > Date.parse(SELESAI)) return;
    try {
      setCiut(sessionStorage.getItem(KUNCI_CIUT) === "1");
    } catch {}
    const t = setTimeout(() => setTampil(true), 600);
    return () => clearTimeout(t);
  }, []);

  const ubahCiut = (nilai: boolean) => {
    setCiut(nilai);
    try {
      sessionStorage.setItem(KUNCI_CIUT, nilai ? "1" : "0");
    } catch {}
  };

  const disembunyikan =
    pathname === HREF ||
    pathname.startsWith(`${HREF}/`) ||
    pathname.startsWith("/checkout") ||
    pathname === "/links";

  if (disembunyikan) return null;

  return (
    <div
      className={cn(
        "fixed z-40 right-4 bottom-[148px] lg:bottom-[88px]",
        "transition-all duration-300 ease-out",
        tampil
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-3 pointer-events-none"
      )}
    >
      {ciut ? (
        <button
          type="button"
          onClick={() => ubahCiut(false)}
          aria-label="Tampilkan promo voucher JRF 2026"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1E3FE0] text-white shadow-lg shadow-black/25 active:scale-95 transition-transform"
        >
          <span className="text-[11px] font-black leading-none tracking-tight">JRF</span>
        </button>
      ) : (
        <div className="relative">
          <Link
            href={HREF}
            aria-label="Buka halaman klaim voucher JRF 2026"
            className="group flex items-center gap-2.5 rounded-full bg-[#1E3FE0] text-white shadow-lg shadow-black/25 pl-3 pr-4 py-2.5 hover:brightness-110 active:scale-95 transition-all"
          >
            <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-[13px] font-black tracking-tight">JRF 2026</span>
              <span className="text-[9px] font-bold uppercase tracking-wider opacity-80 mt-0.5">
                Voucher s.d. Rp500K
              </span>
            </span>
            <ArrowRight
              size={15}
              strokeWidth={2.5}
              className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </Link>
          <button
            type="button"
            onClick={() => ubahCiut(true)}
            aria-label="Kecilkan tombol JRF"
            className="absolute -top-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#1E3FE0] border border-[#1E3FE0]/20 shadow"
          >
            <X size={13} strokeWidth={3} />
          </button>
        </div>
      )}
    </div>
  );
}
