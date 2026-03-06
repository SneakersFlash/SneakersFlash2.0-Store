"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, SlidersHorizontal, X } from "lucide-react";
import { useCartStore, selectCartItemCount } from "@/lib/store/cartStore";

export function TopSearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const cartCount = useCartStore(selectCartItemCount);
  const { openCart } = useCartStore();

  const handleSearch = () => {
    const q = query.trim();
    if (q) router.push(`/products?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border lg:hidden">
      <div className="flex items-center gap-2.5 px-4 py-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Sepatu running…"
            className="w-full bg-muted border border-transparent rounded-full pl-9 pr-9 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                <X size={13} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Cart icon */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={openCart}
          className="relative shrink-0 w-9 h-9 flex items-center justify-center"
          aria-label="Cart"
        >
          <ShoppingBag size={22} className="text-foreground" />
          <AnimatePresence>
            {cartCount > 0 && (
              <motion.span
                key="badge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center bg-primary text-primary-foreground text-[9px] font-bold rounded-full"
              >
                {cartCount > 9 ? "9+" : cartCount}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Sort/filter icon */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => router.push("/products")}
          className="shrink-0 w-9 h-9 flex items-center justify-center"
          aria-label="Filter"
        >
          <SlidersHorizontal size={20} className="text-foreground" />
        </motion.button>
      </div>
    </div>
  );
}
