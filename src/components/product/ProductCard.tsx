"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatPrice, discountPercent } from "@/lib/utils/formatPrice";
import { getProductImageUrl } from "@/lib/utils/imageUrl";
import type { Product } from "@/types/product.types";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  index?: number;     
}

function StarRating({ rating = 4.2, count = 78 }: { rating?: number; count?: number }) {
  const full  = Math.floor(rating);
  return (
    <div className="flex items-center gap-1 mt-auto pt-1.5">
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={11}
            className={cn(
              i < full
                ? "text-[#FF6B00] fill-[#FF6B00]"
                : "text-gray-200 fill-gray-100"
            )}
          />
        ))}
      </div>
      <span className="text-[10px] text-gray-500">({count})</span>
    </div>
  );
}

export function ProductCard({ product, priority = false, index = 0 }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
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
      className="group relative h-full"
    >
      {/* ── CARD WRAPPER UTAMA (Latar Putih, Border, Shadow, Rounded) ── */}
      <Link 
        href={`/products/${product.slug}`} 
        className="block h-full bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 overflow-hidden flex flex-col"
      >
        
        {/* ── Image container (Kotak Gambar) ── */}
        <div className="relative overflow-hidden bg-gray-50/80 aspect-square shrink-0">
          <Image
            src={imageError ? "/images/placeholder-product.svg" : primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              "object-cover transition-all duration-700 ease-out p-4",
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
              className="object-cover opacity-0 scale-105 transition-all duration-700 ease-out group-hover:opacity-100 group-hover:scale-100 p-4"
            />
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {product.isFeatured && (
              <span className="inline-flex items-center px-2 py-1 text-[9px] font-bold uppercase tracking-wider bg-black text-white rounded-md shadow-sm">
                Featured
              </span>
            )}
            {product.variants?.every((v) => v.stock === 0) && (
              <span className="inline-flex items-center px-2 py-1 text-[9px] font-bold uppercase tracking-wider bg-white/90 text-red-600 rounded-md backdrop-blur-md shadow-sm">
                Sold Out
              </span>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsWishlisted((prev) => !prev);
            }}
            className={cn(
              "absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center rounded-full",
              "bg-white shadow-sm border border-gray-200",
              "opacity-0 lg:group-hover:opacity-100 transition-all duration-300 translate-y-2 lg:group-hover:translate-y-0",
              "hover:scale-110 active:scale-95"
            )}
            aria-label="Add to wishlist"
          >
            <Heart
              size={14}
              className={cn(
                "transition-colors",
                isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400"
              )}
            />
          </button>
        </div>

        {/* ── Product info (Berada di dalam Card, ada Padding) ── */}
        <div className="p-3 md:p-4 flex flex-col flex-1 space-y-0.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
            {product.brand?.name ?? "Brand"}
          </p>

          <h3 className="text-[13px] sm:text-sm font-medium line-clamp-2 leading-snug text-gray-900 group-hover:text-black transition-colors duration-200 mb-1">
            {product.name}
          </h3>

          <p className="font-bold text-[14px] sm:text-base text-gray-900 leading-tight mt-1">
            {formatPrice(displayPrice)}
          </p>

          {hasDiscount && (
            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
              <p className="text-[11px] sm:text-xs line-through text-gray-400 font-medium">
                {formatPrice(product.basePrice)}
              </p>
              <span className="inline-flex items-center px-1.5 py-0.5 bg-red-50 text-red-600 text-[9px] font-bold uppercase tracking-wider rounded-md">
                save {saving}%
              </span>
            </div>
          )}

          <StarRating rating={parseFloat(product?.ratingAvg ?? '4.2') ?? 4.2} count={product?.reviewCount ?? 78} />
        </div>
      </Link>
    </motion.div>
  );
}