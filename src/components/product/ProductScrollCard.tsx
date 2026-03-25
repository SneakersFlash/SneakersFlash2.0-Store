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

interface ProductScrollCardProps {
  product: Product;
  index?: number;
  variant?: "scroll" | "grid";
}

function StarRating({ rating = 4, count = 78 }: { rating?: number; count?: number }) {
  const full = Math.floor(rating);
  return (
    <div className="flex items-center gap-1.5 mt-auto pt-2">
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={13} // Dikecilkan sedikit untuk versi scroll
            className={cn(
              "transition-colors",
              i < full 
                ? "text-black fill-black" 
                : "text-black fill-transparent"
            )}
          />
        ))}
      </div>
      <span className="text-[11px] lg:text-[12px] text-[#888888] underline underline-offset-4 decoration-1">
        ({count} review)
      </span>
    </div>
  );
}

export function ProductScrollCard({
  product,
  index = 0,
  variant = "scroll",
}: ProductScrollCardProps) {
  const [imgError, setImgError] = useState(false);

  const imageSrc = imgError ? "/images/placeholder-product.svg" : getProductImageUrl(product.variants[0]?.imageUrl);
  const hasDiscount = Boolean(product.variants[0]?.price && product.variants[0].price < product.basePrice);
  const displayPrice = product.variants[0]?.price ?? product.basePrice;
  const saving = hasDiscount ? discountPercent(product.basePrice, product.variants[0]?.price!) : 0;

  const isScroll = variant === "scroll";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className={cn(
        "group relative h-full font-sans",
        isScroll ? "w-[160px] lg:w-[230px]" : "w-full"
      )}
    >
      <Link 
        href={`/products/${product.slug}`} 
        className="block h-full bg-white border border-[#E5E5E5] rounded-[20px] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col relative pb-4 lg:pb-5"
      >
        

        {/* ── Image container ── */}
        <div className="relative w-full aspect-[5/4] bg-white pt-8 pb-2 px-3 shrink-0 flex items-center justify-center">
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            className="object-contain transition-transform duration-700 ease-out group-hover:scale-105 p-3 lg:p-4"
            sizes="(max-width: 640px) 160px, (max-width: 1024px) 230px, 280px"
            onError={() => setImgError(true)}
          />
        </div>

        {/* ── Product info ── */}
        <div className="px-3 lg:px-4 flex flex-col flex-1">
          {/* Brand */}
          <h3 className="text-[13px] lg:text-[15px] font-bold tracking-tight text-black mb-0.5">
            {product.brand?.name ?? "Nike"}
          </h3>

          {/* Nama Produk */}
          <p className="text-[12px] lg:text-[14px] font-normal text-black line-clamp-1 mb-2 lg:mb-3">
            {product.name.toUpperCase()}
          </p>

          {/* Harga & Diskon */}
          <div className="flex flex-col mt-auto">
            <span className={cn(
              "text-[16px] lg:text-[20px] font-bold leading-none tracking-tight mb-1.5 text-black"
            )}>
              {formatPrice(displayPrice)}
            </span>
            
            {hasDiscount && (
              <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                <span className="text-[11px] lg:text-[13px] text-[#888888] line-through font-normal">
                  {formatPrice(product.basePrice)}
                </span>
                <span className="inline-flex items-center justify-center bg-[#FF0000] text-white text-[10px] lg:text-[11px] font-bold px-1.5 py-0.5 rounded-full">
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