"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, Heart } from "lucide-react"; 
import { cn } from "@/lib/utils/cn";
import { formatPrice, discountPercent } from "@/lib/utils/formatPrice";
import { getProductImageUrl } from "@/lib/utils/imageUrl";
import type { Product } from "@/types/product.types";
import { useCheckWishlist, useAddWishlist, useRemoveWishlist } from "@/lib/hooks/useWishlist";

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
            className={cn("w-2.5 h-2.5 sm:w-4 sm:h-4 transition-colors", i < full ? "text-black fill-black" : "text-black fill-transparent")}
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

  const productId = Number(product.id);
  const { data: checkData, isLoading: isChecking } = useCheckWishlist(productId);
  const { mutate: add, isPending: isAdding } = useAddWishlist();
  const { mutate: remove, isPending: isRemoving } = useRemoveWishlist();

  const isWishlisted = checkData?.wishlisted || false;
  const wishlistId = checkData?.wishlistId;
  const isProcessing = isAdding || isRemoving || isChecking;

  const primaryImage = getProductImageUrl(product.variants?.[0]?.imageUrl);
  const secondaryImage = product.variants?.[0]?.imageUrl?.length > 1
    ? getProductImageUrl([product.variants[0].imageUrl[1]])
    : null;

  const hasEvent = Boolean(product.activeEvent?.specialPrice);
  const eventPrice = hasEvent ? product.activeEvent!.specialPrice! : null;
  const eventName = product.activeEvent?.eventName ?? null;

  const hasDiscount = hasEvent
    ? true
    : Boolean(product.variants?.[0]?.price && product.variants[0].price < product.basePrice);
  const displayPrice = hasEvent
    ? eventPrice!
    : (product.variants?.[0]?.price ?? product.basePrice);
  const saving = hasDiscount
    ? discountPercent(product.basePrice, displayPrice)
    : 0;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted && wishlistId) {
      remove({ id: wishlistId, productId });
    } else {
      add({ productId });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group relative h-full font-sans"
    >
      <Link
        href={`/products/${product.slug}`}
        className="block h-full bg-white border border-[#E5E5E5] rounded-[12px] sm:rounded-[20px] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col relative pb-3 sm:pb-5"
      >
        {/* ── Image Container ── */}
        <div className="relative w-full aspect-square sm:aspect-[5/4] bg-[#F5F5F5] shrink-0 overflow-hidden">
        {/* ── Event Badge ── */}
          {eventName && (
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-black text-white text-[9px] sm:text-[10px] font-bold tracking-wide uppercase leading-none shadow-sm">
                {eventName}
              </span>
            </div>
          )}

          <button
            onClick={handleWishlistToggle}
            disabled={isProcessing}
            className={cn(
              "absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-2 rounded-full bg-white/90 shadow-sm transition-all duration-300",
              "hover:scale-110 disabled:opacity-50",
              isWishlisted ? "text-[#FF0000]" : "text-[#888888] hover:text-[#FF0000]" 
            )}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={cn("w-4 h-4 sm:w-5 sm:h-5 transition-colors", isProcessing && "animate-pulse", isWishlisted && "fill-[#FF0000]")}
            />
          </button>

          <Image
            src={imageError ? "/images/placeholder-product.svg" : primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              "object-cover object-top transition-all duration-700 ease-out",
              secondaryImage ? "group-hover:opacity-0 group-hover:scale-105" : "group-hover:scale-105"
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
              className="object-cover object-top opacity-0 scale-105 transition-all duration-700 ease-out group-hover:opacity-100 group-hover:scale-100"
            />
          )}
        </div>

        {/* ── Product Info ── */}
        <div className="pt-3 sm:pt-4 px-3 sm:px-4 md:px-5 flex flex-col flex-1">
          <h3 className="text-[10px] sm:text-[12px] font-bold tracking-tight text-black mb-0.5">
            {product.brand?.name ?? "Nike"}
          </h3>
          <p className="text-[10px] sm:text-[12px] leading-snug font-normal text-black line-clamp-2 mb-1">
            {product.name.toUpperCase()}
          </p>
          
          {/* Penambahan Available Sizes */}
          {product.availableSizes && product.availableSizes.length > 0 && (
            <p className="text-[10px] sm:text-[11px] text-[#888888] mb-1.5 sm:mb-2 line-clamp-1">
              Size : {product.availableSizes.slice(0, 5).join(", ")}
              {product.availableSizes.length > 5 && "..."}
            </p>
          )}

          <div className="flex flex-col mt-auto">
            <span className="text-[14px] lg:text-[18px] font-bold leading-none tracking-tight mb-1.5 text-black">
              {formatPrice(displayPrice)}
            </span>
            {hasDiscount && (
              <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                <span className="text-[11px] lg:text-[13px] text-[#888888] line-through font-normal">
                  {formatPrice(product.basePrice)}
                </span>
                <span className={cn(
                  "inline-flex items-center justify-center text-[10px] lg:text-[11px] font-bold px-1.5 py-0.5 rounded",
                  hasEvent
                    ? "bg-black text-white"
                    : "bg-green-200 text-green-500"
                )}>
                  Save {saving}%
                </span>
              </div>
            )}
          </div>
          {/* <StarRating rating={parseFloat(product?.ratingAvg?.toString() ?? '4') ?? 4} count={product?.reviewCount ?? 78} /> */}
        </div>
      </Link>
    </motion.div>
  );
}