"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { CountdownTimer } from "@/components/home/CountdownTimer";

/**
 * Hero campaign 08.08.
 *
 * Bentuk panelnya sengaja mengikuti EventCampaignSection di beranda (bg gelap,
 * pola titik, gradasi hitam, sudut 20–24px) supaya halaman ini tidak terasa
 * seperti template asing yang ditempel ke toko.
 */

// WIB = UTC+7, ditulis eksplisit supaya tidak ikut zona waktu server/perangkat:
// kontainer app berjalan di UTC, selisihnya 7 jam.
const MULAI    = "2026-08-08T00:00:00+07:00";
const BERAKHIR = "2026-08-10T23:59:59+07:00";

const KEUNGGULAN = [
  "100% Original",
  "Tukar Ukuran 7 Hari",
  "Kirim Hari Yang Sama",
];

const STRIP = [
  "Infinite Deals 8.8",
  "Keuntungan Tanpa Batas",
  "Gratis Ongkir",
  "100% Original",
];

type Fase = "pra" | "berjalan" | "selesai";

/**
 * Fase dihitung setelah mount, bukan saat render. Kalau dihitung langsung,
 * server dan klien bisa menghasilkan label berbeda dan React melempar
 * hydration mismatch.
 */
function useFaseCampaign(): Fase | null {
  const [fase, setFase] = useState<Fase | null>(null);

  useEffect(() => {
    const hitung = (): Fase => {
      const now = Date.now();
      if (now < Date.parse(MULAI)) return "pra";
      if (now < Date.parse(BERAKHIR)) return "berjalan";
      return "selesai";
    };

    setFase(hitung());
    const timer = setInterval(() => setFase(hitung()), 1000);
    return () => clearInterval(timer);
  }, []);

  return fase;
}

export function Campaign88Hero() {
  const fase = useFaseCampaign();

  const label =
    fase === "pra"      ? "Dimulai Dalam:"
    : fase === "berjalan" ? "Berakhir Dalam:"
    : fase === "selesai"  ? "Sale Sudah Berakhir"
    : "";

  const target = fase === "pra" ? MULAI : BERAKHIR;

  return (
    <>
      {/* ── Strip promo berjalan ── */}
      <div className="w-full bg-primary text-primary-foreground overflow-hidden py-1.5">
        <div className="flex w-max gap-8 animate-marquee88" aria-hidden="true">
          {/* Digandakan — lihat @keyframes marquee88 di globals.css */}
          {[...STRIP, ...STRIP, ...STRIP, ...STRIP].map((teks, i) => (
            <span
              key={i}
              className="text-[11px] font-bold uppercase tracking-[0.1em] whitespace-nowrap"
            >
              {teks}
            </span>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl pt-4 md:pt-6">
        <section className="relative w-full rounded-[20px] md:rounded-[24px] overflow-hidden shadow-lg bg-[#1A1A1A]">
          {/* Latar: pola titik + gradasi, sama seperti section event beranda */}
          <div className="absolute inset-0 z-0" aria-hidden="true">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/80" />
          </div>

          <div className="relative z-10 p-5 md:p-8 lg:p-10 flex flex-col gap-6">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              {/* ── Kiri: judul & ajakan ── */}
              <div className="flex flex-col items-start gap-3.5">
                <span className="inline-flex items-center gap-1.5 text-[10px] md:text-xs font-bold bg-white text-black px-2 py-1 rounded shadow-sm uppercase tracking-widest">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                  </span>
                  Special Event
                </span>

                <h1 className="font-display font-bold text-white text-4xl md:text-5xl lg:text-6xl tracking-tight drop-shadow-md">
                  Infinite Deals 8.8
                </h1>

                <p className="text-base md:text-lg text-white/80 max-w-md leading-relaxed">
                  Keuntungan Tanpa Batas Belanja Makin Puas
                </p>

                <div className="flex flex-wrap gap-2.5 pt-1">
                  <Link
                    href="#pilihan-88"
                    className="inline-flex items-center justify-center bg-white text-black px-6 py-3 font-display uppercase tracking-widest text-sm transition-all duration-200 active:scale-95 hover:bg-gray-100"
                  >
                    Lihat Semua Deal
                  </Link>
                  <Link
                    href="/products"
                    className="inline-flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 font-display uppercase tracking-widest text-sm transition-all duration-200 active:scale-95 hover:bg-white hover:text-black"
                  >
                    Semua Produk
                  </Link>
                </div>
              </div>

              {/* ── Kanan: hitung mundur ──
                  Tinggi dikunci supaya isi hero tidak melompat saat fase
                  ditentukan sesudah mount. */}
              <div className="flex flex-col items-start lg:items-end gap-2 min-h-[68px] md:min-h-[76px]">
                <span className="text-[10px] text-white/80 font-medium uppercase tracking-wider">
                  {label}
                </span>
                {fase !== null && fase !== "selesai" && (
                  <CountdownTimer targetDate={target} />
                )}
              </div>
            </div>

            {/* ── Baris kepercayaan ── */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-4 border-t border-white/15">
              {KEUNGGULAN.map((teks) => (
                <span
                  key={teks}
                  className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-white/80"
                >
                  <Check className="w-3.5 h-3.5 shrink-0 text-primary" strokeWidth={3} />
                  {teks}
                </span>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
