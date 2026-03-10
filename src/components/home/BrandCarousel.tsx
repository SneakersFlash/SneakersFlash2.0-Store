"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";// Sesuaikan path ini
import { Brand } from "@/types/product.types";
import { brandsService } from "@/lib/api/brands.service";

function BrandCard({ brand, index }: { brand: Brand; index: number }) {
  // Membersihkan slash berlebih jika ada slug seperti "/AIR"
  const cleanSlug = brand.slug.startsWith("/") ? brand.slug.substring(1) : brand.slug;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
      whileTap={{ scale: 0.95 }}
      className="flex-shrink-0 snap-start"
    >
      <Link
        href={`/products?brand=${cleanSlug}`}
        className="group flex items-center justify-center bg-white border border-border/40 shadow-sm rounded-2xl w-36 h-16 hover:border-zinc-900/20 hover:shadow-md transition-all duration-300 relative overflow-hidden px-4"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-zinc-100/0 via-zinc-100/0 to-zinc-100/50 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Jika ada logoUrl, tampilkan gambar. Jika tidak, tampilkan teks namanya */}
        {brand.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={brand.logoUrl}
            alt={brand.name}
            className="w-full h-full object-contain relative z-10 transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <span
            className="font-black tracking-tighter text-zinc-900 select-none relative z-10 transition-transform duration-300 group-hover:scale-110 text-xl text-center truncate w-full"
            style={{ fontFamily: "var(--font-oswald), sans-serif" }}
          >
            {brand.name}
          </span>
        )}
      </Link>
    </motion.div>
  );
}

export function BrandCarousel() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Mengambil data brands dari API
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const data = await brandsService.getAll();
        // Hanya ambil brand yang isActive = true dan urutkan jika diperlukan
        const activeBrands: any = data.filter(b => b.isActive);
        setBrands(activeBrands);
      } catch (error) {
        console.error("Failed to fetch brands:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrands();
  }, []);

  // Animasi Auto-Scroll
  useEffect(() => {
    if (isPaused || brands.length === 0) return;

    const interval = setInterval(() => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        const scrollAmount = 156; // 144px (w-36) + 12px (gap-3)

        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [isPaused, brands.length]);

  // Tampilkan Skeleton atau jangan render carouselnya jika masih loading
  if (isLoading) {
    return (
      <div className="py-6 bg-background flex flex-col gap-4 animate-pulse">
        <div className="px-5 flex items-center justify-between">
          <div className="h-5 bg-muted rounded w-32" />
          <div className="h-4 bg-muted rounded w-16" />
        </div>
        <div className="flex gap-3 px-5 pt-1 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-36 h-16 bg-muted rounded-2xl flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  // Sembunyikan component jika ternyata tidak ada brand aktif
  if (brands.length === 0) return null;

  return (
    <div className="py-6 bg-background flex flex-col gap-4 relative">
      <div className="px-5 flex items-center justify-between">
        <h3 className="font-display text-base font-bold text-foreground tracking-tight">
          Shop by Brand
        </h3>
        <Link
          href="/brands"
          className="group flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-zinc-900 transition-colors"
        >
          View All
          <svg
            className="w-4 h-4 transition-transform group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>

      <div className="relative w-full">
        <div
          ref={carouselRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className="flex overflow-x-auto snap-x snap-mandatory gap-3 px-5 pb-4 pt-1 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <style dangerouslySetInnerHTML={{__html: `div::-webkit-scrollbar { display: none; }`}} />

          {brands.map((brand, i) => (
            <BrandCard key={brand.id} brand={brand} index={i} />
          ))}

          <div className="w-2 flex-shrink-0" />
        </div>

        <div className="absolute top-0 right-0 h-full w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>
    </div>
  );
}