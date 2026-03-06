"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

interface HeroBannerProps {
  /** Override defaults for different promotions */
  headline?: string;
  subheadline?: string;
  discountValue?: string;
  voucherValue?: string;
  sneakerPrice?: string;
  ctaLabel?: string;
  ctaHref?: string;
  bgFrom?: string;
  bgTo?: string;
}

export function HeroBanner({
  headline = "GASPOL",
  subheadline = "Gajian Seru Poll",
  discountValue = "60%",
  voucherValue = "200K",
  sneakerPrice = "499K",
  ctaLabel = "Shop Now",
  ctaHref = "/products?sale=true",
  bgFrom = "#1565C0",
  bgTo = "#0D47A1",
}: HeroBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative overflow-hidden mx-0"
      style={{ background: `linear-gradient(135deg, ${bgFrom} 0%, ${bgTo} 100%)` }}
    >
      <div className="relative flex items-center min-h-[180px] sm:min-h-[220px] px-5 py-5 gap-4">

        {/* ── Left side: headline + CTA ── */}
        <div className="flex-1 z-10">
          {/* Lightning bolt + headline */}
          <div className="flex items-center gap-1.5 mb-1">
            <Zap size={16} className="text-primary fill-primary shrink-0" />
            <h2 className="font-display font-black text-white text-3xl sm:text-4xl uppercase leading-none tracking-tight">
              {headline}
            </h2>
          </div>

          {/* Sub */}
          <div className="inline-flex items-center gap-1.5 bg-primary/20 border border-primary/40 px-2.5 py-1 rounded-full mb-4">
            <Zap size={10} className="text-primary fill-primary" />
            <span className="text-primary text-[11px] font-bold uppercase tracking-wider">
              {subheadline}
            </span>
          </div>

          {/* CTA button */}
          <motion.div whileTap={{ scale: 0.94 }}>
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 text-xs font-display font-bold uppercase tracking-widest transition-colors rounded-sm"
            >
              {ctaLabel}
            </Link>
          </motion.div>
        </div>

        {/* ── Right side: badge stack ── */}
        <div className="flex flex-col gap-2 z-10 shrink-0">

          {/* Discount badge */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="bg-primary text-primary-foreground rounded-md px-3 py-2 text-center min-w-[90px]"
          >
            <p className="text-[9px] font-bold uppercase tracking-wider leading-none mb-0.5">
              DISCOUNT up to
            </p>
            <p className="font-display font-black text-2xl leading-none">
              {discountValue}
            </p>
          </motion.div>

          {/* Voucher badge */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="bg-primary text-primary-foreground rounded-md px-3 py-2 text-center min-w-[90px]"
          >
            <p className="text-[9px] font-bold uppercase tracking-wider leading-none mb-0.5">
              VOUCHER Disc.
            </p>
            <p className="font-display font-black text-2xl leading-none">
              {voucherValue}
            </p>
          </motion.div>

          {/* Sneaker price badge */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            className="bg-white/15 backdrop-blur border border-white/20 text-white rounded-md px-3 py-2 text-center min-w-[90px]"
          >
            <p className="text-[9px] font-bold uppercase tracking-wider leading-none mb-0.5">
              SNEAKERS Start from
            </p>
            <p className="font-display font-black text-2xl leading-none">
              {sneakerPrice}
            </p>
          </motion.div>
        </div>

        {/* Decorative bolt watermark */}
        <div className="absolute right-1/3 top-1/2 -translate-y-1/2 pointer-events-none opacity-5">
          <Zap size={180} className="text-white fill-white" />
        </div>
      </div>
    </motion.div>
  );
}
