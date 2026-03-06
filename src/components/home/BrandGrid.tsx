"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const BRANDS = [
  { name: "Nike",     slug: "nike",     logoText: "NIKE"      },
  { name: "Adidas",   slug: "adidas",   logoText: "adidas"    },
  { name: "Puma",     slug: "puma",     logoText: "PUMA"      },
  { name: "Skechers", slug: "skechers", logoText: "SKECHERS"  },
];

function BrandCard({
  brand,
  index,
}: {
  brand: (typeof BRANDS)[number];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.3, delay: index * 0.07 }}
      whileTap={{ scale: 0.93 }}
      whileHover={{ scale: 1.03 }}
    >
      <Link
        href={`/products?brand=${brand.slug}`}
        className="flex items-center justify-center bg-card border border-border rounded-sm h-16 px-4 hover:border-primary/50 transition-colors"
      >
        {/* Logo text — replace with actual <Image> once you have logo assets */}
        <span
          className={`font-black tracking-tighter text-foreground select-none ${
            brand.slug === "adidas"
              ? "text-xl italic"
              : brand.slug === "skechers"
              ? "text-base"
              : "text-2xl"
          }`}
          style={{ fontFamily: "var(--font-oswald), sans-serif" }}
        >
          {brand.logoText}
        </span>
      </Link>
    </motion.div>
  );
}

export function BrandGrid() {
  return (
    <div className="px-4 pb-4">
      {/* Section title */}
      <h3 className="font-display text-base font-bold uppercase tracking-wide text-foreground mb-3">
        Shop by Brand
      </h3>

      {/* 2×2 grid */}
      <div className="grid grid-cols-2 gap-2.5 mb-3">
        {BRANDS.map((brand, i) => (
          <BrandCard key={brand.slug} brand={brand} index={i} />
        ))}
      </div>

      {/* View All */}
      <motion.div whileTap={{ scale: 0.96 }}>
        <Link
          href="/brands"
          className="flex items-center justify-center w-full h-11 bg-foreground text-background font-display font-bold uppercase tracking-widest text-sm rounded-sm hover:bg-foreground/90 transition-colors"
        >
          View All
        </Link>
      </motion.div>
    </div>
  );
}