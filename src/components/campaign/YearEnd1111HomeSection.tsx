"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CountdownTimer } from "@/components/home/CountdownTimer";
import { ProductScrollCard } from "@/components/product/ProductScrollCard";
import { useAutoScroll } from "@/lib/hooks/useAutoScroll";
import { useFaseCampaign } from "./useFaseCampaign";
import {
  YEAR_END_BERAKHIR,
  YEAR_END_HARI_H,
  YEAR_END_HREF,
  YEAR_END_NAMA,
  teaser1111,
} from "@/lib/campaign/year-end-1111";
import type { Product } from "@/types/product.types";

/**
 * Panel hitung mundur harga 11.11 di beranda.
 *
 * Cetakannya panel 8.8 (InfiniteDeals88HomeSection): panel gelap, timer di
 * kanan kepala, rail produk yang bergeser sendiri. Sebelum promo website buka
 * timer menghitung ke 9 Nov 00:00 WIB ("Promo Website Dimulai Dalam" — copy
 * PDF revisi); 9–15 Nov ke akhir promo. Sesudah itu panel hilang sendiri.
 *
 * Timer tetap tampil walau rail produk kosong — hitung mundurnya inti panel
 * ini; rail cuma bonus.
 */
export function YearEnd1111HomeSection({ products }: { products: Product[] }) {
  const scrollRef = useAutoScroll<HTMLDivElement>({
    enabled: products.length > 0,
  });
  const { fase, target } = useFaseCampaign(YEAR_END_HARI_H, YEAR_END_BERAKHIR);

  if (fase === "selesai") return null;

  const label =
    fase === "pra"
      ? "Promo Website Dimulai Dalam:"
      : fase === "berjalan"
        ? "Promo Berakhir Dalam:"
        : "";

  return (
    <section className="relative w-full rounded-[20px] md:rounded-[24px] overflow-hidden shadow-lg bg-[#0D0D0D] mb-4">
      {/* Garis kuning di kepala panel — aksen campaign. Sempat berupa bidang
          miring di pojok kanan, tapi ia membelah kotak timer jadi setengah
          hitam setengah merah dan menutupi judul di layar HP. */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-[#F5E809]" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:16px_16px]"
      />

      <div className="relative z-10 p-4 md:p-6 lg:p-8 flex flex-col gap-5 md:gap-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col items-start gap-2">
            <span className="text-[10px] md:text-xs font-bold bg-white text-black px-2 py-1 rounded shadow-sm uppercase tracking-widest flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F5E809] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F5E809]" />
              </span>
              {fase === "berjalan" ? "Live Now" : "Coming Soon"}
            </span>

            <Link href={YEAR_END_HREF}>
              <h2 className="font-display font-black text-2xl md:text-3xl lg:text-4xl text-white tracking-tight drop-shadow-md hover:text-gray-200 transition-colors">
                <span className="text-[#F5E809]">11.11</span>{" "}
                {YEAR_END_NAMA.replace(/^11\.11\s*/, "")}
              </h2>
            </Link>

            <p className="text-[11px] md:text-xs text-white/70">
              {fase === "berjalan"
                ? "Last chance 15 November 2026 — belanja sebelum periode berakhir"
                : "Siapkan wishlist! Promo website 9 – 15 November 2026"}
            </p>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-2 sm:gap-4 w-full md:w-auto">
            {/* Tinggi dikunci supaya baris ini tidak melompat saat fase
                ditentukan sesudah mount. */}
            <div className="flex flex-col items-start md:items-end min-h-[56px] md:min-h-[62px]">
              <span className="text-[10px] text-white/85 font-bold uppercase tracking-wider mb-1">
                {label}
              </span>
              {fase !== null && <CountdownTimer targetDate={target} />}
            </div>

            <Link
              href={YEAR_END_HREF}
              aria-label={`Buka halaman ${YEAR_END_NAMA}`}
              className="flex items-center justify-center shrink-0 ml-auto w-10 h-10 md:w-11 md:h-11 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white hover:bg-white hover:text-black transition-all duration-300"
            >
              <ChevronRight size={20} strokeWidth={3} />
            </Link>
          </div>
        </div>

        {products.length > 0 && (
          <div
            ref={scrollRef}
            className="flex gap-3 lg:gap-4 pb-2 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none"
          >
            {products.map((product, i) => (
              <div key={product.id} className="snap-start shrink-0">
                <ProductScrollCard
                  product={product}
                  index={i}
                  showStock
                  hargaTeaser={teaser1111(product.skuParent)}
                />
              </div>
            ))}
          </div>
        )}

        <Link
          href={YEAR_END_HREF}
          className="self-start inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-white/80 hover:text-white transition-colors"
        >
          Lihat Semua Deal
          <ChevronRight size={14} strokeWidth={3} />
        </Link>
      </div>
    </section>
  );
}
