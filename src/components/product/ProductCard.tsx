"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatPrice, discountPercent } from "@/lib/utils/formatPrice";
import { getProductImageUrl } from "@/lib/utils/imageUrl";
import type { Product } from "@/types/product.types";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  index?: number;
}

function StarRating({ rating = 4, count = 78 }: { rating?: number; count?: number }) {
  const full = Math.floor(rating);
  return (
    <div className="flex items-center gap-1 sm:gap-2 mt-auto pt-1.5 sm:pt-2">
      <div className="flex gap-0.5 sm:gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            // Menggunakan class w & h agar ukuran icon bisa responsif
            className={cn(
              "w-2.5 h-2.5 sm:w-4 sm:h-4 transition-colors",
              i < full
                ? "text-black fill-black" 
                : "text-black fill-transparent" 
            )}
          />
        ))}
      </div>
      <span className="text-[10px] sm:text-[12px] text-[#888888] underline underline-offset-[3px] decoration-1">
        ({count} review)
      </span>
    </div>
  );
}

export function ProductCard({ product, priority = false, index = 0 }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

  const primaryImage = getProductImageUrl(product.variants?.[0]?.imageUrl);
  const secondaryImage = product.variants?.[0]?.imageUrl?.length > 1
    ? getProductImageUrl([product.variants[0].imageUrl[1]])
    : null;

  const hasDiscount = Boolean(product.variants?.[0]?.price && product.variants[0].price < product.basePrice);
  const displayPrice = product.variants?.[0]?.price ?? product.basePrice;
  const saving = hasDiscount ? discountPercent(product.basePrice, product.variants[0].price) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.06,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="group relative h-full font-sans"
    >
      <Link 
        href={`/products/${product.slug}`} 
        className="block h-full bg-white border border-[#E5E5E5] rounded-[12px] sm:rounded-[20px] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col relative pb-3 sm:pb-5"
      >

        {/* ── Image Container ── */}
        {/* Mengubah aspect ratio di mobile menjadi kotak (aspect-square) agar lebih pas */}
        <div className="relative w-full aspect-square sm:aspect-[5/4] bg-white pt-4 sm:pt-10 pb-2 px-2 sm:px-4 shrink-0 flex items-center justify-center">
          <Image
            src={imageError ? "/images/placeholder-product.svg" : primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              "object-contain transition-all duration-700 ease-out p-3 sm:p-6",
              secondaryImage
                ? "group-hover:opacity-0 group-hover:scale-105"
                : "group-hover:scale-105"
            )}
            priority={priority}
            onError={() => setImageError(true)}
          />

          {secondaryImage && !imageError && (
            <Image
              src={secondaryImage}
              alt={`${product.name} — alternate view`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain opacity-0 scale-105 transition-all duration-700 ease-out group-hover:opacity-100 group-hover:scale-100 p-3 sm:p-6"
            />
          )}
        </div>

        {/* ── Product Info ── */}
        <div className="px-3 sm:px-4 md:px-5 flex flex-col flex-1">
          {/* Brand */}
          <h3 className="text-[12px] sm:text-[14px] font-bold tracking-tight text-black mb-0.5">
            {product.brand?.name ?? "Nike"}
          </h3>

          {/* Nama Produk */}
          <p className="text-[11px] sm:text-[13px] leading-snug font-normal text-black line-clamp-2 mb-1.5 sm:mb-2">
            {product.name.toUpperCase()}
          </p>

          {/* Harga & Diskon */}
          <div className="flex flex-col mt-auto">
            {/* Harga Utama */}
            <span className={cn(
              "text-[14px] sm:text-[18px] font-bold leading-none tracking-tight mb-1",
              hasDiscount ? "text-[#FF0000]" : "text-black"
            )}>
              {formatPrice(displayPrice)}
            </span>
            
            {hasDiscount && (
              <div className="flex items-center gap-1.5 mb-1 sm:mb-2 flex-wrap">
                <span className="text-[11px] sm:text-[13px] text-[#888888] line-through font-normal">
                  {formatPrice(product.basePrice)}
                </span>
                <span className="inline-flex items-center justify-center bg-[#FF0000] text-white text-[10px] sm:text-[11px] font-bold px-1.5 py-0.5 rounded-full">
                  -{saving}%
                </span>
              </div>
            )}
          </div>

          {/* Rating */}
          <StarRating 
            rating={parseFloat(product?.ratingAvg ?? '4') ?? 4} 
            count={product?.reviewCount ?? 78} 
          />
        </div>
      </Link>
    </motion.div>
  );
}