"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { buildImageUrl } from "@/lib/utils/imageUrl";
import { useCategories } from "@/lib/hooks/useCategories";
import { cn } from "@/lib/utils/cn";

// ─── Fallback static categories (shown until API returns) ─────────────────────
// Replace imageUrl values with your real product images once backend is ready.

const STATIC_CATEGORIES = [
  {
    slug: "running",
    name: "Running",
    description: "Built for speed. Engineered for distance.",
    imageUrl: null,
    span: "col-span-2 row-span-2", // large featured tile
  },
  {
    slug: "basketball",
    name: "Basketball",
    description: "Dominate the court.",
    imageUrl: null,
    span: "col-span-1 row-span-1",
  },
  {
    slug: "lifestyle",
    name: "Lifestyle",
    description: "Street-ready. Always.",
    imageUrl: null,
    span: "col-span-1 row-span-1",
  },
  {
    slug: "training",
    name: "Training",
    description: "Push your limits.",
    imageUrl: null,
    span: "col-span-1 row-span-1",
  },
  {
    slug: "apparel",
    name: "Apparel",
    description: "Gear up, head to toe.",
    imageUrl: null,
    span: "col-span-1 row-span-1",
  },
];

// Gradient backgrounds per category (as fallback when no image)
const CATEGORY_GRADIENTS: Record<string, string> = {
  running:    "from-brand-gray-800 via-brand-gray-900 to-brand-black",
  basketball: "from-[#1a0a00] to-brand-gray-900",
  lifestyle:  "from-[#0a0a1a] to-brand-gray-900",
  training:   "from-[#0a1a0a] to-brand-gray-900",
  apparel:    "from-[#1a001a] to-brand-gray-900",
};

// ─── Single Category Tile ─────────────────────────────────────────────────────

interface CategoryTileProps {
  category: (typeof STATIC_CATEGORIES)[number];
  index: number;
}

function CategoryTile({ category, index }: CategoryTileProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const gradient = CATEGORY_GRADIENTS[category.slug] ?? "from-brand-gray-800 to-brand-black";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={
        isInView
          ? { opacity: 1, scale: 1 }
          : { opacity: 0, scale: 0.97 }
      }
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={cn(category.span, "relative")}
    >
      <Link
        href={`/products?category=${category.slug}`}
        className="group block relative overflow-hidden h-full min-h-[220px]"
      >
        {/* Background: image or gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />

        {category.imageUrl && (
          <Image
            src={buildImageUrl(category.imageUrl)}
            alt={category.name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        )}

        {/* Always-on overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Hover reveal: red left border */}
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-1 bg-primary origin-bottom"
          initial={{ scaleY: 0 }}
          whileHover={{ scaleY: 1 }}
          transition={{ duration: 0.3 }}
        />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <p className="font-display text-xs uppercase tracking-[0.2em] text-primary mb-1">
            Shop Category
          </p>
          <h3
            className={cn(
              "font-display font-bold uppercase text-white leading-tight",
              category.span.includes("col-span-2")
                ? "text-3xl md:text-4xl"
                : "text-xl md:text-2xl"
            )}
          >
            {category.name}
          </h3>
          {category.description && (
            <p className="text-sm text-white/60 mt-1 hidden sm:block">
              {category.description}
            </p>
          )}

          {/* Arrow */}
          <div className="flex items-center gap-2 mt-3 text-white/70 group-hover:text-primary transition-colors">
            <span className="text-xs font-display uppercase tracking-widest">
              Explore
            </span>
            <ArrowRight
              size={13}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </div>
        </div>

        {/* Count badge if available */}
      </Link>
    </motion.div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export function CategoryHighlights() {
  const { data: apiCategories } = useCategories();

  // Merge API data into static categories for images/counts
  const categories = STATIC_CATEGORIES.map((cat) => {
    const apiCat = apiCategories?.find((c) => c.slug === cat.slug);
    return {
      ...cat,
      imageUrl: apiCat?.imageUrl ?? cat.imageUrl,
      count: apiCat?._count?.products,
    };
  });

  return (
    <section className="container-2xl py-16 md:py-20">
      <SectionHeading
        eyebrow="Browse by Sport"
        title="Shop Categories"
        subtitle="Find your fit, from track to street."
        viewAllHref="/products"
        viewAllLabel="All Products"
      />

      {/* Asymmetric bento grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 grid-rows-2 gap-3 md:gap-4 auto-rows-[220px]">
        {categories.map((cat, i) => (
          <CategoryTile key={cat.slug} category={cat} index={i} />
        ))}
      </div>
    </section>
  );
}
