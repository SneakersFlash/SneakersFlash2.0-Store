"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatPrice, discountPercent } from "@/lib/utils/formatPrice";
import { getProductImageUrl } from "@/lib/utils/imageUrl";
import type { Product } from "@/types/product.types";
import { useAddWishlist, useCheckWishlist, useRemoveWishlist } from "@/lib/hooks/useWishlist";

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
            size={13}
            className={cn(
              "transition-colors",
              i < full ? "text-black fill-black" : "text-black fill-transparent"
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

export function ProductScrollCard({ product, index = 0, variant = "scroll" }: ProductScrollCardProps) {
  const [imgError, setImgError] = useState(false);

  const productId = Number(product.id);
  const { data: checkData, isLoading: isChecking } = useCheckWishlist(productId);
  const { mutate: add, isPending: isAdding } = useAddWishlist();
  const { mutate: remove, isPending: isRemoving } = useRemoveWishlist();

  const primaryImage = getProductImageUrl(product.variants?.[0]?.imageUrl);
  const secondaryImage = product.variants?.[0]?.imageUrl?.length > 1
    ? getProductImageUrl([product.variants[0].imageUrl[1]])
    : null;

  const hasDiscount = Boolean(product.variants[0]?.price && product.variants[0].price < product.basePrice);
  const displayPrice = product.variants[0]?.price ?? product.basePrice;
  const saving = hasDiscount ? discountPercent(product.basePrice, product.variants[0]?.price!) : 0;

  const isWishlisted = checkData?.wishlisted || false;
  const wishlistId = checkData?.wishlistId;
  const isProcessing = isAdding || isRemoving || isChecking;
  const isScroll = variant === "scroll";

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
    // ✅ Ganti motion.div → div biasa dengan CSS animation
    // Framer Motion gesture detection (drag/pan) penyebab card bisa digeser/diputar
    <div
      className={cn(
        "group relative h-full font-sans",
        // Animasi entrance via CSS keyframe — aman dari gesture conflict
        "animate-fadeInUp",
        isScroll ? "w-[160px] lg:w-[230px]" : "w-full"
      )}
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: "both" }}
    >
      <Link
        href={`/products/${product.slug}`}
        className="block h-full bg-white border border-[#E5E5E5] rounded-[20px] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col relative pb-4 lg:pb-5"
      >
        {/* ── Image container ── */}
        <div className="relative w-full aspect-[5/4] bg-[#F5F5F5] shrink-0 overflow-hidden">
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
              className={cn(
                "w-4 h-4 sm:w-5 sm:h-5 transition-colors",
                isProcessing && "animate-pulse",
                isWishlisted && "fill-[#FF0000]"
              )}
            />
          </button>

          <Image
            src={imgError ? "/images/placeholder-product.svg" : primaryImage}
            alt={product.name}
            fill
            className={cn(
              "object-cover object-top transition-all duration-700 ease-out",
              secondaryImage && !imgError
                ? "group-hover:opacity-0 group-hover:scale-105"
                : "group-hover:scale-105"
            )}
            sizes="(max-width: 640px) 160px, (max-width: 1024px) 230px, 280px"
            onError={() => setImgError(true)}
          />

          {secondaryImage && !imgError && (
            <Image
              src={secondaryImage}
              alt={`${product.name} — alternate view`}
              fill
              sizes="(max-width: 640px) 160px, (max-width: 1024px) 230px, 280px"
              className="object-cover object-top opacity-0 scale-105 transition-all duration-700 ease-out group-hover:opacity-100 group-hover:scale-100"
            />
          )}
        </div>

        {/* ── Product info ── */}
        <div className="pt-3 lg:pt-4 px-3 lg:px-4 flex flex-col flex-1">
          <h3 className="text-[10px] lg:text-[12px] font-bold tracking-tight text-black mb-0.5">
            {product.brand?.name ?? "Nike"}
          </h3>
          <p className="text-[10px] lg:text-[12px] font-normal text-black line-clamp-2 mb-1">
            {product.name.toUpperCase()}
          </p>

          {product.availableSizes && product.availableSizes.length > 0 && (
            <p className="text-[10px] lg:text-[11px] text-[#888888] mb-2 lg:mb-3 line-clamp-1">
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
                <span className="inline-flex items-center justify-center bg-green-200 text-green-500 text-[10px] lg:text-[11px] font-bold px-1.5 py-0.5 rounded">
                  Save {saving}%
                </span>
              </div>
            )}
          </div>
          {/* <StarRating
            rating={parseFloat(product?.ratingAvg?.toString() ?? "4") ?? 4}
            count={product?.reviewCount ?? 78}
          /> */}
        </div>
      </Link>
    </div>
  );
}