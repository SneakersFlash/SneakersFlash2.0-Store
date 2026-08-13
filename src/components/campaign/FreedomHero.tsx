"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { CountdownTimer } from "@/components/home/CountdownTimer";
import { useFaseCampaign } from "./useFaseCampaign";
import {
  FREEDOM_MULAI,
  FREEDOM_BERAKHIR,
} from "@/lib/campaign/freedom-in-every-step";

/**
 * Hero campaign "Freedom in Every Step".
 *
 * Bentuk panelnya mengikuti hero 8.8 (bg gelap, gradasi, sudut 20–24px) supaya
 * halaman ini terasa satu keluarga dengan campaign sebelumnya. Copy-nya yang
 * diganti; tata letaknya sengaja tidak diutak-atik.
 */

const KEUNGGULAN = [
  "100% Original",
  "Tukar Ukuran 7 Hari",
  "Kirim Hari Yang Sama",
];

/** `bendera: true` → item ini didahului ikon merah putih di strip. */
const STRIP: { teks: string; bendera?: boolean }[] = [
  { teks: "Freedom in Every Step", bendera: true },
  { teks: "Merdeka Buat Melangkah" },
  { teks: "Gratis Ongkir" },
  { teks: "100% Original" },
];

/**
 * Bendera merah putih mini.
 *
 * Sengaja digambar sendiri, bukan emoji 🇮🇩: di Windows emoji bendera tidak
 * dirender dan cuma keluar sebagai huruf "ID". Merahnya dipakai merah bendera
 * (#CE1126), bukan #9E0107 milik strip — di atas latar merah gelap itu justru
 * yang bikin benderanya terbaca. Garis putih tipis mengunci tepinya.
 */
function BenderaMerahPutih() {
  return (
    <span
      aria-hidden="true"
      className="inline-flex flex-col w-[14px] h-[10px] shrink-0 overflow-hidden rounded-[1px] ring-1 ring-white/70 align-middle"
    >
      <span className="h-1/2 w-full bg-[#CE1126]" />
      <span className="h-1/2 w-full bg-white" />
    </span>
  );
}

export function FreedomHero() {
  const { fase, label, target } = useFaseCampaign(
    FREEDOM_MULAI,
    FREEDOM_BERAKHIR,
  );

  return (
    <>
      {/* ── Strip promo berjalan ── */}
      <div className="w-full bg-[#9E0107] text-white overflow-hidden py-1.5">
        <div className="flex w-max gap-8 animate-marquee88" aria-hidden="true">
          {/* Digandakan — lihat @keyframes marquee88 di globals.css */}
          {[...STRIP, ...STRIP, ...STRIP, ...STRIP].map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] whitespace-nowrap"
            >
              {item.bendera && <BenderaMerahPutih />}
              {item.teks}
            </span>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl pt-4 md:pt-6">
        <section className="relative w-full rounded-[20px] md:rounded-[24px] overflow-hidden shadow-lg bg-[#9E0107]">
          {/* Gradasi hitamnya sengaja dibuat jauh lebih tipis dari versi 8.8:
              di atas dasar merah, black/80 bikin warnanya jadi merah kusam
              kehitaman. Segini masih cukup menjaga kontras teks putih. */}
          <div className="absolute inset-0 z-0" aria-hidden="true">
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/40" />
          </div>

          {/* Di layar kecil panel sengaja lebih jangkung dan isinya direnggangkan
              supaya banner tidak terlihat sesak; dari md ke atas tingginya
              kembali mengikuti isi. */}
          <div className="relative z-10 p-5 pb-7 md:p-8 lg:p-10 flex flex-col gap-6 min-h-[460px] justify-between md:min-h-0 md:justify-start">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              {/* ── Kiri: judul & ajakan ── */}
              <div className="flex flex-col items-start gap-3.5">
                <span className="inline-flex items-center gap-1.5 text-[10px] md:text-xs font-bold bg-white text-black px-2 py-1 rounded shadow-sm uppercase tracking-widest">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                  </span>
                  Merdeka Special
                </span>

                <h1 className="font-display font-black text-white text-4xl md:text-5xl lg:text-6xl tracking-tight drop-shadow-md">
                  Freedom in Every Step
                </h1>

                <p className="teks-ringan text-base md:text-lg text-white/80 max-w-md leading-relaxed">
                  Merdeka Buat Pilih Langkahmu
                  <br />
                  13 – 17 Agustus
                </p>

                <div className="flex flex-wrap gap-2.5 pt-1">
                  <Link
                    href="#voucher-freedom"
                    className="inline-flex items-center justify-center bg-white text-black px-6 py-3 font-display uppercase tracking-widest text-sm transition-all duration-200 active:scale-95 hover:bg-gray-100"
                  >
                    CLAIM 300K OFF
                  </Link>
                  <Link
                    href="#pilihan-freedom"
                    className="inline-flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 font-display uppercase tracking-widest text-sm transition-all duration-200 active:scale-95 hover:bg-white hover:text-black"
                  >
                    FREEDOM PICKS
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
                  <Check
                    className="w-3.5 h-3.5 shrink-0 text-primary"
                    strokeWidth={3}
                  />
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
