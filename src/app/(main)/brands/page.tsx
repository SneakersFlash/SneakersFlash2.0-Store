"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Brand } from "@/types/product.types";
import { brandsService } from "@/lib/api/brands.service";
import { ArrowLeft } from "lucide-react";
// 1. PERBAIKAN: Gunakan next/navigation untuk App Router
import { useRouter } from "next/navigation"; 

// ─── Brand Row Item ───────────────────────────────────────────────────────────

function BrandRow({ brand, index }: { brand: Brand; index: number }) {
  const cleanSlug = brand.slug.startsWith("/") ? brand.slug.substring(1) : brand.slug;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: "easeOut" }}
    >
      <Link
        href={`/products?brandName=${cleanSlug}`}
        className="flex items-center gap-4 py-2.5 px-4 active:bg-gray-50 transition-colors duration-150"
      >
        {/* Logo Box */}
        <div className="w-[72px] h-[72px] bg-[#F5F5F5] rounded-[14px] flex items-center justify-center shrink-0 overflow-hidden border border-[#EFEFEF]">
          {brand.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={brand.logoUrl}
              alt={brand.name}
              className="w-[52px] h-[52px] object-contain"
            />
          ) : (
            <span className="text-[11px] font-black text-black uppercase tracking-tight text-center px-1 leading-tight">
              {brand.name}
            </span>
          )}
        </div>

        {/* Brand Name */}
        <span className="text-[15px] font-normal text-[#1A1A1A] tracking-tight">
          {brand.name}
        </span>
      </Link>
    </motion.div>
  );
}

// ─── Alphabetical Section ─────────────────────────────────────────────────────

function AlphaSection({
  letter,
  brands,
  startIndex,
}: {
  letter: string;
  brands: Brand[];
  startIndex: number;
}) {
  return (
    <div className="mb-2">
      {/* 2. PERBAIKAN: Header dipindahkan dari sini agar tidak ter-render berkali-kali */}
      <div className="px-4 pt-4 pb-1">
        <span className="text-[13px] font-semibold text-[#1A1A1A]">{letter}</span>
      </div>
      <div className="divide-y divide-[#F0F0F0]">
        {brands.map((brand, i) => (
          <BrandRow key={brand.id} brand={brand} index={startIndex + i} />
        ))}
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function BrandSkeleton() {
  return (
    <div className="animate-pulse px-4 py-4">
      {[..."ACNPRSV"].map((letter) => (
        <div key={letter} className="mb-3">
          <div className="h-4 w-4 bg-gray-200 rounded mb-3 mt-4" />
          {[...Array(letter === "A" || letter === "N" ? 2 : 1)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-2.5">
              <div className="w-[72px] h-[72px] bg-gray-100 rounded-[14px] shrink-0" />
              <div className="h-4 bg-gray-100 rounded w-28" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BrandsPage() {
  const router = useRouter(); // 3. PERBAIKAN: Inisiasi router di komponen utama
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const data = await brandsService.getAll();
        setBrands((data as Brand[]).filter((b) => b.isActive));
      } catch (error) {
        console.error("Failed to fetch brands:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBrands();
  }, []);

  const grouped = useMemo(() => {
    const map: Record<string, Brand[]> = {};
    brands
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((brand) => {
        const letter = brand.name[0].toUpperCase();
        if (!map[letter]) map[letter] = [];
        map[letter].push(brand);
      });
    return map;
  }, [brands]);

  const letters = Object.keys(grouped).sort();

  let count = 0;
  const letterStartIndexes: Record<string, number> = {};
  letters.forEach((letter) => {
    letterStartIndexes[letter] = count;
    count += grouped[letter].length;
  });

  return (
    <div className="bg-white min-h-screen font-sans">
      
      {/* 4. PERBAIKAN: Header diletakkan di bagian paling atas page, judul diganti jadi "Semua Brand" */}
      <header className="sticky top-0 bg-white z-40 px-4 py-3 flex items-center gap-4 border-b border-gray-200 shadow-sm">
        <button onClick={() => router.back()} className="p-1 -ml-1 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={24} className="text-gray-900" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Semua Brand</h1>
      </header>

      {/* Konten Halaman */}
      {isLoading ? (
        <BrandSkeleton />
      ) : brands.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-[#888] text-sm">
          No brands available
        </div>
      ) : (
        <div className="divide-y divide-[#F5F5F5]">
          {letters.map((letter) => (
            <AlphaSection
              key={letter}
              letter={letter}
              brands={grouped[letter]}
              startIndex={letterStartIndexes[letter]}
            />
          ))}
        </div>
      )}
    </div>
  );
}