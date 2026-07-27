"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { Brand } from "@/types/product.types";
import { brandsService } from "@/lib/api/brands.service";

// List brand yang ingin ditampilkan (sesuaikan dengan slug di database Anda)
const SELECTED_BRAND_SLUGS = [
  "adidas",
  "nike",
  "new-balance",
  "vans",
  "puma",
  "converse"
];

function BrandCard({ brand, index }: { brand: Brand; index: number }) {
  const cleanSlug = brand.slug.startsWith("/") ? brand.slug.substring(1) : brand.slug;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
      whileTap={{ scale: 0.95 }}
      className="w-[140px] md:w-[180px] shrink-0 snap-start" 
    >
      <Link
        href={`/products?brand=${cleanSlug}`}
        className="group flex items-center justify-center bg-white border border-[#E5E5E5] shadow-sm rounded-[16px] h-[80px] md:h-[100px] hover:border-gray-300 hover:shadow-md transition-all duration-300 relative overflow-hidden px-4 py-3"
      >
        {brand.logoUrl ? (
          <img
            src={brand.logoUrl}
            alt={brand.name}
            className="w-full h-full object-contain relative z-10 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="font-black tracking-tighter text-black select-none relative z-10 transition-transform duration-300 group-hover:scale-105 text-lg md:text-xl text-center truncate w-full uppercase">
            {brand.name}
          </span>
        )}
      </Link>
    </motion.div>
  );
}

export function BrandCarousel() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Ref untuk mengontrol elemen carousel
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const data = await brandsService.getAll();
        
        // Filter: Hanya ambil brand yang ada di list SELECTED_BRAND_SLUGS dan aktif
        const filtered: any = data
          .filter(b => b.isActive && SELECTED_BRAND_SLUGS.includes(b.slug.toLowerCase().replace(/^\//, "")))
          // Urutkan sesuai urutan di SELECTED_BRAND_SLUGS
          .sort((a, b) => {
            const slugA = a.slug.toLowerCase().replace(/^\//, "");
            const slugB = b.slug.toLowerCase().replace(/^\//, "");
            return SELECTED_BRAND_SLUGS.indexOf(slugA) - SELECTED_BRAND_SLUGS.indexOf(slugB);
          });

        setBrands(filtered);
      } catch (error) {
        console.error("Failed to fetch brands:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrands();
  }, []);

  // Effect untuk Auto-Scroll
  useEffect(() => {
    // Jangan jalankan jika data belum ada
    if (brands.length === 0) return;

    const scrollInterval = setInterval(() => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        
        // Cek apakah sudah mencapai ujung paling kanan (dengan sedikit toleransi px)
        if (scrollLeft + clientWidth >= scrollWidth - 5) {
          // Kembali ke awal dengan mulus
          carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          // Geser ke kanan kurang lebih sejauh 1 card (otomatis akan di-snap oleh CSS)
          carouselRef.current.scrollBy({ left: 200, behavior: "smooth" });
        }
      }
    }, 3000); // Angka 3000 = bergeser setiap 3 detik. Silakan disesuaikan.

    // Bersihkan interval ketika komponen di-unmount
    return () => clearInterval(scrollInterval);
  }, [brands]);

  if (isLoading) {
    return (
      <div className="py-4 container mx-auto max-w-7xl px-4 animate-pulse">
        <div className="flex justify-between items-center mb-4 md:mb-5">
          <div className="h-7 bg-gray-200 rounded w-48" />
        </div>
        <div className="flex gap-3 md:gap-4 overflow-hidden mb-4 md:mb-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-[80px] md:h-[100px] bg-gray-100 rounded-[16px] w-[140px] md:w-[180px] shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (brands.length === 0) return null;

  return (
    <div className="relative w-full py-4 font-sans">
      <div className="container mx-auto px-4 max-w-7xl flex flex-col">
        
        <div className="flex justify-between items-center mb-4 md:mb-5">
          <p className="text-[20px] md:text-[24px] font-bold text-[#1A1A1A] tracking-tight">
            Shop by Brand
          </p>
          <Link 
            href="/brands" 
            className="block text-[#1E1E1E] hover:text-[#FF6B00] text-[15px] font-bold transition-colors"
          >
            View All
          </Link>
        </div>

        {/* Menambahkan properti ref={carouselRef} ke container ini */}
        <div 
          ref={carouselRef}
          className="flex overflow-x-auto snap-x snap-mandatory gap-3 md:gap-4 pb-4 -mx-4 px-4 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {brands.map((brand, i) => (
            <BrandCard key={brand.id} brand={brand} index={i} />
          ))}
        </div>
        
      </div>
    </div>
  );
}