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
  /** narrow = horizontal scroll card; grid = desktop grid card */
  variant?: "scroll" | "grid";
}

function StarRating({ rating = 4.2, count = 78 }: { rating?: number; count?: number }) {
  const full  = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.4;
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={10}
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

export function ProductScrollCard({
  product,
  index = 0,
  variant = "scroll",
}: ProductScrollCardProps) {
  const [imgError, setImgError] = useState(false);

  const imageSrc  = imgError ? "/images/placeholder-product.svg" : getProductImageUrl(product.images);
  const hasDiscount = Boolean(product.salePrice && product.salePrice < product.price);
  const displayPrice = product.salePrice ?? product.price;
  const saving = hasDiscount ? discountPercent(product.price, product.salePrice!) : 0;

  const isScroll = variant === "scroll";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      whileHover={{ y: -3 }}
      className={cn(isScroll ? "w-[155px] shrink-0" : "w-full")}
    >
      <Link href={`/products/${product.slug}`} className="block">
        {/* Image */}
        <div className="relative bg-muted rounded-sm overflow-hidden mb-2" style={{ aspectRatio: "1/1" }}>
          {/* Brand stamp — top left */}
          <div className="absolute top-1.5 left-1.5 z-10 bg-card/90 backdrop-blur-sm px-1.5 py-0.5 rounded-sm">
            <span className="font-display font-black text-[9px] uppercase tracking-wider text-foreground leading-none">
              SNKRS<br />FL<span className="text-primary">⚡</span>SH
            </span>
          </div>

          <Image
            src={imageSrc}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            sizes="(max-width: 640px) 155px, (max-width: 1024px) 220px, 280px"
            onError={() => setImgError(true)}
          />
        </div>

        {/* Info */}
        <div className="space-y-0.5">
          {/* Brand */}
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {product.brand?.name ?? "Brand"}
          </p>

          {/* Name */}
          <p className="text-[12px] font-medium text-foreground line-clamp-2 leading-snug">
            {product.name}
          </p>

          {/* Sale price */}
          <p className="font-bold text-[13px] text-primary leading-tight">
            {formatPrice(displayPrice)}
          </p>

          {/* Original price + save */}
          {hasDiscount && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-[11px] line-through text-muted-foreground">
                {formatPrice(product.price)}
              </p>
              <span className="inline-flex items-center px-1.5 py-0.5 bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 text-[9px] font-bold uppercase tracking-wider rounded-sm">
                save {saving}%
              </span>
            </div>
          )}

          {/* Stars */}
          <StarRating rating={product?.rating ?? 4.2} count={product?.reviewCount ?? 78} />
        </div>
      </Link>
    </motion.div>
  );
}