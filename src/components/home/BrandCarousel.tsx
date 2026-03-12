"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Brand } from "@/types/product.types";
import { brandsService } from "@/lib/api/brands.service";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

function BrandCard({ brand, index }: { brand: Brand; index: number }) {
  // Membersihkan slash berlebih jika ada slug seperti "/AIR"
  const cleanSlug = brand.slug.startsWith("/") ? brand.slug.substring(1) : brand.slug;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
      whileTap={{ scale: 0.95 }}
      className="shrink-0 snap-start"
    >
      <Link
        href={`/products?brandName=${cleanSlug}`}
        className="group flex items-center justify-center bg-white border border-gray-100 shadow-sm rounded-xl md:rounded-2xl w-[120px] h-[60px] md:w-[160px] md:h-[80px] hover:border-gray-300 hover:shadow-md transition-all duration-300 relative overflow-hidden px-4"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-gray-50/0 via-gray-50/0 to-gray-100/50 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {brand.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={brand.logoUrl}
            alt={brand.name}
            // Efek Grayscale: Abu-abu saat diam, berwarna penuh saat di-hover
            className="w-full h-full object-contain relative z-10 transition-all duration-300 group-hover:scale-110 filter grayscale group-hover:grayscale-0 opacity-70 group-hover:opacity-100"
          />
        ) : (
          <span
            className="font-black tracking-tighter text-gray-800 select-none relative z-10 transition-transform duration-300 group-hover:scale-110 text-sm md:text-lg text-center truncate w-full"
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

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const data = await brandsService.getAll();
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

  // Animasi Auto-Scroll yang Disesuaikan untuk Desktop/Mobile
  useEffect(() => {
    if (isPaused || brands.length === 0) return;

    const interval = setInterval(() => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        // Mengambil lebar kartu pertama secara dinamis + gap
        const firstChild = carouselRef.current.children[0] as HTMLElement;
        const scrollAmount = firstChild ? firstChild.clientWidth + 16 : 176; 

        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [isPaused, brands.length]);

  if (isLoading) {
    return (
      <div className="py-2 container mx-auto max-w-7xl animate-pulse px-4 lg:px-0">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 bg-gray-200 rounded w-32" />
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>
        <div className="flex gap-3 md:gap-4 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="w-[120px] h-[60px] md:w-[160px] md:h-[80px] bg-gray-100 rounded-xl md:rounded-2xl shrink-0 border border-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  if (brands.length === 0) return null;

  return (
    <div className="relative w-full py-2">
      {/* HEADER SECTION (Menyatu dengan batas layar max-w-7xl) */}
      <div className="container mx-auto px-4 max-w-7xl flex items-center justify-between mb-4 md:mb-6">
        <h3 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight hidden lg:block">
          {/* Judul ini bisa disembunyikan jika Anda sudah memanggil judul "Brand Terlaris" di page.tsx */}
        </h3>
        <Link
          href="/brands"
          className="text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-[#FF6B00] transition-colors flex items-center gap-1 ml-auto"
        >
          View All <ChevronRight size={14} />
        </Link>
      </div>

      {/* CAROUSEL TRACK */}
      <div className="relative container mx-auto max-w-7xl px-0 lg:px-4">
        
        {/* Fading Edges khusus Desktop untuk efek elegan */}
        <div className="hidden lg:block absolute left-4 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="hidden lg:block absolute right-4 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <div
          ref={carouselRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className="flex overflow-x-auto snap-x snap-mandatory gap-3 md:gap-5 px-4 lg:px-0 pb-4 pt-1 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {/* Custom style for Webkit hidden scrollbar */}
          <style dangerouslySetInnerHTML={{__html: `div::-webkit-scrollbar { display: none; }`}} />

          {brands.map((brand, i) => (
            <BrandCard key={brand.id} brand={brand} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}