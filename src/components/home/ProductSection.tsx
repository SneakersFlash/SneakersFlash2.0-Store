"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { ProductScrollCard } from "@/components/product/ProductScrollCard";
import { useProducts } from "@/lib/hooks/useProducts";
import type { ProductFilters } from "@/types/product.types";

interface ProductSectionProps {
  title: string;
  filters: ProductFilters;
  backgroundImage?: string | null;
  bgColor?: string;
  viewAllHref?: string;
}

// ─── Section banner header ────────────────────────────────────────────────────
function SectionBannerHeader({
  title,
  viewAllHref,
  backgroundImage,
  bgColor = "#1A1A1A",
}: {
  title: string;
  viewAllHref: string;
  backgroundImage?: string | null;
  bgColor?: string;
}) {
  return (
    <Link href={viewAllHref} className="block group mb-4">
      <div
        className="relative h-20 md:h-28 flex items-center px-5 md:px-8 overflow-hidden rounded-2xl shadow-xs transition-transform duration-300 group-hover:scale-[1.01]"
        style={{ backgroundColor: bgColor }}
      >
        {backgroundImage ? (
          <Image
            src={backgroundImage}
            alt={title}
            fill
            className="object-cover object-center opacity-60 transition-opacity duration-500 group-hover:opacity-80"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="absolute inset-0 opacity-10 bg-black [background-size:16px_16px]" />
        )}
        
        <div className="absolute inset-0 bg-black" />

        <div className="relative z-10 flex items-center justify-between w-full">
          <div className="flex flex-col">
            <p className="font-display font-black text-[18px] md:text-[24px] text-white tracking-tight line-clamp-1">
              {title}
            </p>
          </div>

          <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-white transition-all duration-300 group-hover:bg-white group-hover:text-black">
            <span className="text-xs font-bold uppercase tracking-wider hidden sm:block">View All</span>
            <ChevronRight size={16} strokeWidth={3} className="transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Skeleton scroll cards ────────────────────────────────────────────────────
function ScrollSkeleton() {
  return (
    <div className="flex gap-3 lg:gap-4 overflow-hidden py-2">
      {[...Array(6)].map((_, i) => (
        // Diubah: Ditambahkan lg:w-[220px] agar di PC ukurannya tetap
        <div key={i} className="w-[155px] lg:w-[220px] shrink-0 space-y-2">
          <div className="skeleton w-full aspect-square rounded-xl bg-gray-200 animate-pulse" />
          <div className="skeleton h-3 w-3/4 bg-gray-200 animate-pulse rounded" />
          <div className="skeleton h-4 w-1/2 bg-gray-200 animate-pulse rounded" />
        </div>
      ))}
    </div>
  );
}

// ─── Main ProductSection ──────────────────────────────────────────────────────
export function ProductSection({
  title,
  filters,
  backgroundImage,
  bgColor,
  viewAllHref,
}: ProductSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const href = viewAllHref ?? `/products`;

  // Karena ini scroll, kita bisa tarik lebih banyak limit (misal: 10-12 produk)
  const { data, isLoading } = useProducts({ ...filters, limit: filters.limit ?? 10 });
  const products = data?.data ?? [];

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="w-full" 
    >
      <SectionBannerHeader
        title={title}
        viewAllHref={href}
        backgroundImage={backgroundImage}
        bgColor={bgColor}
      />

      {isLoading ? (
        <ScrollSkeleton />
      ) : products.length === 0 ? (
        <PlaceholderCards />
      ) : (
        /* GABUNGAN: Scroll Horizontal yang berlaku untuk Mobile (lg:hidden tidak ada) dan Desktop */
        <div className="flex gap-3 lg:gap-4 py-2 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none">
          {products.map((product, i) => (
            <div key={product.id} className="snap-start shrink-0">
              {/* Memastikan variannya adalah scroll untuk semua platform */}
              <ProductScrollCard product={product} index={i} variant="scroll" />
            </div>
          ))}
        </div>
      )}
    </motion.section>
  );
}

// ─── Placeholder cards ───────────────────────
const MOCK_PRODUCTS = [
  { id: "1", name: "Nike Full Force Low Men's", brand: "NIKE", price: 1299000, salePrice: 649500  },
  { id: "2", name: "P 6000 Metallic",           brand: "NIKE", price: 1299000, salePrice: 1099500 },
  { id: "3", name: "Nike Vomero S",             brand: "NIKE", price: 2599000, salePrice: 1999500 },
  { id: "4", name: "Air Max 97",                brand: "NIKE", price: 2100000, salePrice: 1499000 },
  { id: "5", name: "New Balance 550",           brand: "NEW BALANCE", price: 1899000, salePrice: 1599000 },
];

function PlaceholderCards() {
  return (
    <div className="flex gap-3 lg:gap-4 py-2 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none">
      {MOCK_PRODUCTS.map((p, i) => (
        <div key={p.id} className="snap-start shrink-0">
          <MockCard mock={p} index={i} />
        </div>
      ))}
    </div>
  );
}

function MockCard({ mock, index }: { mock: (typeof MOCK_PRODUCTS)[number]; index: number }) {
  const saving = Math.round((1 - mock.salePrice / mock.price) * 100);
  return (
    // Diubah: lg:w-full menjadi lg:w-[220px] agar tidak melebar memenuhi layar PC dan bisa discroll
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: index * 0.06 }} className="w-[155px] lg:w-[220px] bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm">
      <div className="relative bg-gray-50 rounded-lg overflow-hidden mb-2" style={{ aspectRatio: "1/1" }}>
        <div className="absolute inset-0 flex items-center justify-center"><span className="text-gray-300 text-3xl">👟</span></div>
      </div>
      <div className="space-y-1 px-0.5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{mock.brand}</p>
        <p className="text-[12px] font-medium text-gray-900 line-clamp-2">{mock.name}</p>
        <p className="font-bold text-[13px] text-[#FF6B00]">Rp {mock.salePrice.toLocaleString("id-ID")}</p>
        <div className="flex items-center gap-1.5">
          <p className="text-[10px] line-through text-gray-400">Rp {mock.price.toLocaleString("id-ID")}</p>
          <span className="bg-red-100 text-red-600 text-[8px] font-bold px-1 py-0.5 rounded">-{saving}%</span>
        </div>
      </div>
    </motion.div>
  );
}