"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Brand } from "@/types/product.types";
import { brandsService } from "@/lib/api/brands.service";

function BrandCard({ brand, index }: { brand: Brand; index: number }) {
  // Membersihkan slash berlebih jika ada slug seperti "/AIR"
  const cleanSlug = brand.slug.startsWith("/") ? brand.slug.substring(1) : brand.slug;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
      whileTap={{ scale: 0.95 }}
      className="w-full"
    >
      <Link
        href={`/products?brandName=${cleanSlug}`}
        className="group flex items-center justify-center bg-white border border-[#E5E5E5] shadow-sm rounded-[16px] h-[80px] md:h-[100px] hover:border-gray-300 hover:shadow-md transition-all duration-300 relative overflow-hidden px-4 py-3"
      >
        {brand.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={brand.logoUrl}
            alt={brand.name}
            className="w-full h-full object-contain relative z-10 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span
            className="font-black tracking-tighter text-black select-none relative z-10 transition-transform duration-300 group-hover:scale-105 text-lg md:text-xl text-center truncate w-full uppercase"
          >
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

  if (isLoading) {
    return (
      <div className="py-4 container mx-auto max-w-7xl px-4 animate-pulse">
        <div className="h-7 bg-gray-200 rounded w-48 mb-4 md:mb-5" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-[80px] md:h-[100px] bg-gray-100 rounded-[16px] w-full" />
          ))}
        </div>
        <div className="h-[52px] bg-gray-200 rounded-[12px] w-full" />
      </div>
    );
  }

  if (brands.length === 0) return null;

  // Membatasi hanya 4 brand teratas yang muncul di grid utama
  const displayBrands = brands.slice(0, 4);

  return (
    <div className="relative w-full py-4 font-sans">
      <div className="container mx-auto px-4 max-w-7xl flex flex-col">
        
        {/* Title */}
        <h2 className="text-[20px] md:text-[24px] font-bold text-[#1A1A1A] tracking-tight mb-4 md:mb-5">
          Shop by Brand
        </h2>

        {/* Grid Brands */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-5">
          {displayBrands.map((brand, i) => (
            <BrandCard key={brand.id} brand={brand} index={i} />
          ))}
        </div>

        {/* View All Button */}
        <Link
          href="/brands"
          className="w-full bg-[#1E1E1E] hover:bg-black text-white text-[16px] font-bold py-3.5 md:py-4 rounded-[12px] flex items-center justify-center transition-colors duration-200"
        >
          View All
        </Link>
        
      </div>
    </div>
  );
}