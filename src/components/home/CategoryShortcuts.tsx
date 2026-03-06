"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

const SHORTCUTS = [
  { label: "New Arrival", href: "/products?sort=newest",   highlight: false },
  { label: "Best Seller", href: "/products?sort=popular",  highlight: false },
  { label: "Last Call",   href: "/products?sale=true",     highlight: true  }, // red
  { label: "Man",         href: "/products?gender=men",    highlight: false },
  { label: "Woman",       href: "/products?gender=women",  highlight: false },
  { label: "Kids",        href: "/products?gender=kids",   highlight: false },
];

export function CategoryShortcuts() {
  return (
    <div className="px-4 py-4">
      <div className="grid grid-cols-3 gap-2.5">
        {SHORTCUTS.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.05 }}
            whileTap={{ scale: 0.92 }}
          >
            <Link
              href={item.href}
              className={cn(
                "flex items-center justify-center h-10 px-3 rounded-sm border text-sm font-semibold tracking-wide transition-colors",
                item.highlight
                  ? "border-red-200 text-red-500 bg-red-50 dark:bg-red-950/20 dark:border-red-900"
                  : "border-border text-foreground bg-card hover:border-primary/50 hover:text-primary"
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
