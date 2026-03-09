"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

const SHORTCUTS = [
  { label: "New Arrival", href: "/products?sort=newest",   highlight: false },
  { label: "Best Seller", href: "/products?sort=popular",  highlight: false },
  { label: "Last Call",   href: "/products?sale=true",     highlight: true  },
  { label: "Man",         href: "/products?gender=men",    highlight: false },
  { label: "Woman",       href: "/products?gender=women",  highlight: false },
  { label: "Kids",        href: "/products?gender=kids",   highlight: false },
];

export function CategoryShortcuts() {
  return (
    <div className="px-4 py-4 bg-background">
      <div className="grid grid-cols-3 gap-3">
        {SHORTCUTS.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href={item.href}
              className={cn(
                "flex items-center justify-center h-12 px-2 rounded-xl border border-border/50 shadow-sm text-[11px] font-semibold tracking-wide transition-all",
                item.highlight
                  ? "text-red-600 bg-white"
                  : "text-foreground bg-white hover:border-primary/50"
              )}
            >
              {item.label}
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}