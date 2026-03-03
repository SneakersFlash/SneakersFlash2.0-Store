"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Heart } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatPrice, discountPercent } from "@/lib/utils/formatPrice";
import { getProductImageUrl } from "@/lib/utils/imageUrl";
import type { Product } from "@/types/product.types";

interface ProductCardProps {
  product: Product;
  priority?: boolean; // for LCP images (above-fold)
  index?: number;     // for staggered animation delay
}

export function ProductCard({ product, priority = false, index = 0 }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageError, setImageError] = useState(false);

  const primaryImage = getProductImageUrl(product.images);
  const secondaryImage =
    product.images?.length > 1
      ? getProductImageUrl([product.images[1]])
      : null;

  const hasDiscount = Boolean(product.salePrice && product.salePrice < product.price);
  const discount = hasDiscount
    ? discountPercent(product.price, product.salePrice!)
    : 0;

  const displayPrice = product.salePrice ?? product.price;

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
        <div className="relative overflow-hidden bg-brand-gray-800 aspect-product">
          {/* Primary image */}
          <Image
            src={imageError ? "/images/placeholder-product.jpg" : primaryImage}
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
          {secondaryImage && (
            <Image
              src={secondaryImage}
              alt={`${product.name} — alternate view`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover opacity-0 scale-105 transition-all duration-500 ease-out group-hover:opacity-100 group-hover:scale-100"
            />
          )}

          {/* Dark gradient overlay on hover */}
          <div className="card-overlay" />

          {/* ── Badges ── */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {product.isFeatured && (
              <span className="badge-red text-[10px] px-2 py-0.5">
                Featured
              </span>
            )}
            {hasDiscount && (
              <span className="badge-red text-[10px] px-2 py-0.5">
                -{discount}%
              </span>
            )}
            {product.variants?.every((v) => v.stock === 0) && (
              <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-brand-gray-600 text-muted-foreground">
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
              "absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center",
              "bg-brand-black/60 backdrop-blur-sm border border-white/10",
              "opacity-0 group-hover:opacity-100 transition-all duration-200",
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

          {/* ── Quick add CTA (appears on hover) ── */}
          <AnimatePresence>
            <motion.div
              initial={{ y: 12, opacity: 0 }}
              whileHover={{ y: 0, opacity: 1 }}
              className="absolute bottom-0 left-0 right-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <div className="bg-brand-black/90 backdrop-blur-sm border-t border-white/10 px-4 py-3 flex items-center justify-center gap-2">
                <ShoppingBag size={14} className="text-primary" />
                <span className="text-xs font-display uppercase tracking-widest text-white">
                  Select Size
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Product info ── */}
        <div className="pt-3 pb-1">
          {/* Brand */}
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
            {product.brand?.name}
          </p>

          {/* Name */}
          <h3 className="text-sm font-medium line-clamp-2 leading-snug text-foreground group-hover:text-primary transition-colors duration-200">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-2 mt-2">
            <span
              className={cn(
                "font-display font-bold text-base",
                hasDiscount ? "text-primary" : "text-foreground"
              )}
            >
              {formatPrice(displayPrice)}
            </span>
            {hasDiscount && (
              <span className="text-xs line-through text-muted-foreground">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Available sizes indicator */}
          {product.variants && product.variants.length > 0 && (
            <div className="flex items-center gap-1 mt-2 flex-wrap">
              {product.variants.slice(0, 5).map((v) => (
                <span
                  key={v.id}
                  className={cn(
                    "text-[9px] font-mono px-1.5 py-0.5 border",
                    v.stock > 0
                      ? "border-border text-muted-foreground"
                      : "border-border/30 text-muted-foreground/30 line-through"
                  )}
                >
                  {v.size}
                </span>
              ))}
              {product.variants.length > 5 && (
                <span className="text-[9px] text-muted-foreground font-mono">
                  +{product.variants.length - 5}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
