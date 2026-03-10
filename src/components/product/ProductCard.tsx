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
  priority?: boolean; // for LCP images (above-fold)
  index?: number;     // for staggered animation delay
}

// Komponen Rating Bintang disamakan dengan ProductScrollCard
function StarRating({ rating = 4.2, count = 78 }: { rating?: number; count?: number }) {
  const full  = Math.floor(rating);
  return (
    <div className="flex items-center gap-1 mt-1.5">
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={11}
            className={cn(
              i < full
                ? "text-primary fill-primary"
                : "text-muted-foreground/40 fill-muted-foreground/10"
            )}
          />
        ))}
      </div>
      <span className="text-[10px] text-muted-foreground">({count} review)</span>
    </div>
  );
}

export function ProductCard({ product, priority = false, index = 0 }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageError, setImageError] = useState(false);

  // LOGIKA DATA: Disamakan dengan ProductScrollCard
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
      className="group relative"
    >
      <Link href={`/products/${product.slug}`} className="block">
        {/* ── Image container ── */}
        <div className="relative overflow-hidden bg-brand-gray-800 aspect-square rounded-sm">
          {/* Primary image */}
          <Image
            src={imageError ? "/images/placeholder-product.svg" : primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              "object-cover transition-all duration-500 ease-out",
              secondaryImage
                ? "group-hover:opacity-0 group-hover:scale-105"
                : "group-hover:scale-105"
            )}
            priority={priority}
            onError={() => setImageError(true)}
          />

          {/* Secondary image on hover (swap effect) */}
          {secondaryImage && !imageError && (
            <Image
              src={secondaryImage}
              alt={`${product.name} — alternate view`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover opacity-0 scale-105 transition-all duration-500 ease-out group-hover:opacity-100 group-hover:scale-100"
            />
          )}

          {/* ── Badges ── */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
            {product.isFeatured && (
              <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-primary text-white rounded-sm">
                Featured
              </span>
            )}
            {product.variants?.every((v) => v.stock === 0) && (
              <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-black/60 text-white rounded-sm backdrop-blur-sm">
                Sold Out
              </span>
            )}
          </div>

          {/* ── Wishlist button ── */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsWishlisted((prev) => !prev);
            }}
            className={cn(
              "absolute top-2 right-2 z-20 w-8 h-8 flex items-center justify-center rounded-full",
              "bg-black/20 backdrop-blur-sm border border-white/10",
              "opacity-0 lg:group-hover:opacity-100 transition-all duration-200",
              "hover:bg-primary/20 hover:border-primary/50"
            )}
            aria-label="Add to wishlist"
          >
            <Heart
              size={14}
              className={cn(
                "transition-colors",
                isWishlisted ? "fill-primary text-primary" : "text-white"
              )}
            />
          </button>
        </div>

        {/* ── Product info ── */}
        <div className="pt-3 pb-1 space-y-0.5">
          {/* Brand */}
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {product.brand?.name ?? "Brand"}
          </p>

          {/* Name */}
          <h3 className="text-[13px] sm:text-sm font-medium line-clamp-2 leading-snug text-foreground group-hover:text-primary transition-colors duration-200">
            {product.name}
          </h3>

          {/* Sale price */}
          <p className="font-bold text-[14px] sm:text-base text-primary leading-tight mt-1">
            {formatPrice(displayPrice)}
          </p>

          {/* Original price + save (Badge Hijau disamakan dgn ScrollCard) */}
          {hasDiscount && (
            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
              <p className="text-[11px] sm:text-xs line-through text-muted-foreground">
                {formatPrice(product.basePrice)}
              </p>
              <span className="inline-flex items-center px-1.5 py-0.5 bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 text-[9px] font-bold uppercase tracking-wider rounded-sm">
                save {saving}%
              </span>
            </div>
          )}

          {/* Stars */}
          <StarRating rating={parseFloat(product?.ratingAvg ?? '4.2') ?? 4.2} count={product?.reviewCount ?? 78} />
        </div>
      </Link>
    </motion.div>
  );
}