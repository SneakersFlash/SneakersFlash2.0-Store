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
    <Link href={viewAllHref} className="block group mb-3 px-4 lg:px-6">
      <div
        className="relative h-20 md:h-24 flex items-center px-5 md:px-6 overflow-hidden rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-[1.01]"
        style={{ backgroundColor: bgColor }}
      >
        {/* Background image */}
        {backgroundImage ? (
          <Image
            src={backgroundImage}
            alt={title}
            fill
            className="object-cover object-center opacity-60 transition-opacity duration-500 group-hover:opacity-80"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          // Fallback pattern jika tidak ada gambar dari API
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        )}
        
        {/* Gradient Overlay agar teks selalu terbaca jelas */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex items-center justify-between w-full">
          <div className="flex flex-col">
            <p className="text-[10px] md:text-xs font-bold text-white/70 uppercase tracking-[0.2em] mb-0.5">
              Collection
            </p>
            <h3 className="font-display font-black text-2xl md:text-3xl text-white uppercase tracking-tight line-clamp-1">
              {title}
            </h3>
          </div>

          {/* Tombol View All berdesain Pill/Glassmorphism */}
          <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-white transition-all duration-300 group-hover:bg-white group-hover:text-black shadow-lg">
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider hidden sm:block">
              View All
            </span>
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
    <div className="flex gap-3 px-4 py-4 overflow-hidden">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="w-[155px] shrink-0 space-y-2">
          <div className="skeleton w-full aspect-square rounded-sm" />
          <div className="skeleton h-2.5 w-16 rounded" />
          <div className="skeleton h-3 w-full rounded" />
          <div className="skeleton h-3 w-3/4 rounded" />
          <div className="skeleton h-4 w-24 rounded" />
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

  const { data, isLoading } = useProducts({
    ...filters,
    limit: filters.limit ?? 8,
  });

  const products = data?.data ?? [];

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="mb-8"
    >
      {/* Banner header */}
      <SectionBannerHeader
        title={title}
        viewAllHref={href}
        backgroundImage={backgroundImage}
        bgColor={bgColor}
      />

      {/* Product scroll / grid */}
      {isLoading ? (
        <ScrollSkeleton />
      ) : products.length === 0 ? (
        // No products from API yet — show placeholder cards
        <PlaceholderCards title={title} />
      ) : (
        <>
          {/* Mobile: horizontal snap scroll */}
          <div className="lg:hidden flex gap-3 px-4 py-2 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none">
            {products.map((product, i) => (
              <div key={product.id} className="snap-start">
                <ProductScrollCard product={product} index={i} variant="scroll" />
              </div>
            ))}
          </div>

          {/* Desktop: 4-col grid */}
          <div className="hidden lg:grid grid-cols-4 xl:grid-cols-5 gap-4 px-6 py-2">
            {products.map((product, i) => (
              <ProductScrollCard key={product.id} product={product} index={i} variant="grid" />
            ))}
          </div>
        </>
      )}
    </motion.section>
  );
}

// ─── Placeholder cards (shown when API has no data yet) ───────────────────────

const MOCK_PRODUCTS = [
  { id: "1", name: "Nike Full Force Low Men's", brand: "NIKE", price: 1299000, salePrice: 649500  },
  { id: "2", name: "P 6000 Metallic",           brand: "NIKE", price: 1299000, salePrice: 1099500 },
  { id: "3", name: "Nike Vomero S",             brand: "NIKE", price: 2599000, salePrice: 1999500 },
  { id: "4", name: "Air Max 97",                brand: "NIKE", price: 2100000, salePrice: 1499000 },
];

function PlaceholderCards({ title }: { title: string }) {
  return (
    <>
      {/* Mobile horizontal scroll */}
      <div className="lg:hidden flex gap-3 px-4 py-2 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none">
        {MOCK_PRODUCTS.map((p, i) => (
          <div key={p.id} className="snap-start">
            <MockCard mock={p} index={i} />
          </div>
        ))}
      </div>

      {/* Desktop grid */}
      <div className="hidden lg:grid grid-cols-4 xl:grid-cols-5 gap-4 px-6 py-2">
        {MOCK_PRODUCTS.map((p, i) => (
          <MockCard key={p.id} mock={p} index={i} />
        ))}
      </div>
    </>
  );
}

function MockCard({ mock, index }: { mock: (typeof MOCK_PRODUCTS)[number]; index: number }) {
  const saving = Math.round((1 - mock.salePrice / mock.price) * 100);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className="w-[155px] shrink-0 lg:w-full"
    >
      <div className="relative bg-muted rounded-sm overflow-hidden mb-2" style={{ aspectRatio: "1/1" }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3/4 h-3/4 bg-muted-foreground/10 rounded-full flex items-center justify-center">
            <span className="text-muted-foreground/30 text-3xl">👟</span>
          </div>
        </div>
      </div>

      <div className="space-y-0.5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{mock.brand}</p>
        <p className="text-[12px] font-medium text-foreground line-clamp-2 leading-snug">{mock.name}</p>
        <p className="font-bold text-[13px] text-primary">
          Rp {mock.salePrice.toLocaleString("id-ID")}
        </p>
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-[11px] line-through text-muted-foreground">
            Rp {mock.price.toLocaleString("id-ID")}
          </p>
          <span className="inline-flex items-center px-1.5 py-0.5 bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 text-[9px] font-bold uppercase tracking-wider rounded-sm">
            save {saving}%
          </span>
        </div>
        <div className="flex items-center gap-1">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="text-primary text-[10px]">★</span>
          ))}
          <span className="text-muted-foreground/40 text-[10px]">★</span>
          <span className="text-[10px] text-muted-foreground">(78 review)</span>
        </div>
      </div>
    </motion.div>
  );
}