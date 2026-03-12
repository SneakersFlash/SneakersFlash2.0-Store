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

function StarRating({ rating = 4.2, count = 78 }: { rating?: number; count?: number }) {
  const full  = Math.floor(rating);
  return (
    <div className="flex items-center gap-1 mt-auto pt-1.5">
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={10}
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

export function ProductScrollCard({
  product,
  index = 0,
  variant = "scroll",
}: ProductScrollCardProps) {
  const [imgError, setImgError] = useState(false);

  const imageSrc  = imgError ? "/images/placeholder-product.svg" : getProductImageUrl(product.variants[0]?.imageUrl);
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
        "group relative h-full",
        isScroll ? "w-[155px] lg:w-[220px]" : "w-full"
      )}
    >
      {/* ── CARD WRAPPER UTAMA (Sama persis seperti ProductCard) ── */}
      <Link 
        href={`/products/${product.slug}`} 
        className="block h-full bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 overflow-hidden flex flex-col"
      >
        
        {/* ── Image container ── */}
        <div className="relative overflow-hidden bg-gray-50/80 aspect-square shrink-0">
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 p-3 md:p-4"
            sizes="(max-width: 640px) 155px, (max-width: 1024px) 220px, 280px"
            onError={() => setImgError(true)}
          />
        </div>

        {/* ── Product info ── */}
        <div className="p-3 flex flex-col flex-1 space-y-0.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
            {product.brand?.name ?? "Brand"}
          </p>

          <p className="text-[12px] font-medium text-gray-900 line-clamp-2 leading-snug group-hover:text-black transition-colors duration-200 mb-1">
            {product.name}
          </p>

          <p className="font-bold text-[13px] text-gray-900 leading-tight mt-1">
            {formatPrice(displayPrice)}
          </p>

          {hasDiscount && (
            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
              <p className="text-[11px] line-through text-gray-400 font-medium">
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