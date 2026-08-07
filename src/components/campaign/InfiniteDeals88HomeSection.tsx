"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CountdownTimer } from "@/components/home/CountdownTimer";
import { ProductScrollCard } from "@/components/product/ProductScrollCard";
import { useAutoScroll } from "@/lib/hooks/useAutoScroll";
import { useFaseCampaign88 } from "./useFaseCampaign88";
import {
  CAMPAIGN_88_HREF,
  CAMPAIGN_88_NAMA,
} from "@/lib/campaign/infinite-deals-88";
import type { Product } from "@/types/product.types";

interface InfiniteDeals88HomeSectionProps {
  products: Product[];
}

/**
 * Panel campaign di beranda.
 *
 * Bentuknya sengaja mengikuti EventCampaignSection (panel gelap, pola titik,
 * gradasi hitam, sudut 20–24px, rail produk yang bergeser sendiri) supaya
 * beranda tetap terasa satu bahasa. Bedanya isinya kurasi tangan dari
 * lib/campaign/infinite-deals-88.ts, bukan event dari admin, dan tautannya
 * menuju halaman campaign.
 */
export function InfiniteDeals88HomeSection({
  products,
}: InfiniteDeals88HomeSectionProps) {
  const scrollRef = useAutoScroll<HTMLDivElement>({
    enabled: products.length > 0,
  });
  const { fase, label, target } = useFaseCampaign88();

  if (products.length === 0) return null;
  // Campaign sudah lewat — panelnya ikut hilang tanpa perlu deploy ulang.
  if (fase === "selesai") return null;

  return (
    <section className="relative w-full rounded-[20px] md:rounded-[24px] overflow-hidden shadow-lg bg-[#1A1A1A] mb-4">
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/80" />
      </div>

      <div className="relative z-10 p-4 md:p-6 lg:p-8 flex flex-col gap-5 md:gap-6">
        {/* ── Kepala ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col items-start gap-2">
            <span className="text-[10px] md:text-xs font-bold bg-white text-black px-2 py-1 rounded shadow-sm uppercase tracking-widest flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              Special Event
            </span>

            <Link href={CAMPAIGN_88_HREF}>
              <h2 className="font-display font-black text-2xl md:text-3xl lg:text-4xl text-white tracking-tight drop-shadow-md hover:text-gray-200 transition-colors">
                {CAMPAIGN_88_NAMA}
              </h2>
            </Link>

            <p className="text-[11px] md:text-xs text-white/70">
              Keuntungan Tanpa Batas Belanja Makin Puas
            </p>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-2 sm:gap-4 w-full md:w-auto">
            {/* Tinggi dikunci supaya baris ini tidak melompat saat fase
                ditentukan sesudah mount. */}
            <div className="flex flex-col items-start md:items-end min-h-[56px] md:min-h-[62px]">
              <span className="text-[10px] text-white/80 font-medium uppercase tracking-wider mb-1">
                {label}
              </span>
              {fase !== null && <CountdownTimer targetDate={target} />}
            </div>

            <Link
              href={CAMPAIGN_88_HREF}
              aria-label={`Buka halaman ${CAMPAIGN_88_NAMA}`}
              className="flex items-center justify-center shrink-0 ml-auto w-10 h-10 md:w-11 md:h-11 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white hover:bg-white hover:text-black transition-all duration-300"
            >
              <ChevronRight size={20} strokeWidth={3} />
            </Link>
          </div>
        </div>

        {/* ── Rail produk ── */}
        <div
          ref={scrollRef}
          className="flex gap-3 lg:gap-4 pb-2 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none"
        >
          {products.map((product, i) => (
            <div key={product.id} className="snap-start shrink-0">
              <ProductScrollCard product={product} index={i} showStock />
            </div>
          ))}
        </div>

        <Link
          href={CAMPAIGN_88_HREF}
          className="self-start inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-white/80 hover:text-white transition-colors"
        >
          Lihat Semua Deal
          <ChevronRight size={14} strokeWidth={3} />
        </Link>
      </div>
    </section>
  );
}
