"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, SlidersHorizontal, X, ArrowLeft, Share2 } from "lucide-react";

import { useAuthStore } from "@/lib/store/authStore";
import { useCartStore } from "@/lib/store/cartStore"; 
import { FilterModal } from "../common/FIlterModal";
import { CartSidebar } from "../cart/CartSidebar";
import { cn } from "@/lib/utils/cn";

export function TopSearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  const search = searchParams.toString();
  const currentPath = search ? `${pathname}?${search}` : pathname;
  
  const items = useCartStore((state) => state.items);
  const { openCart } = useCartStore();
  
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const isHome = pathname === "/";
  const isProductList = pathname === "/products";
  const isProductDetail = pathname.startsWith("/products/") && pathname !== "/products";

  const handleSearch = () => {
    const q = query.trim();
    if (q) router.push(`/products?q=${encodeURIComponent(q)}`);
  };

  const getListTitle = () => {
    const q = searchParams.get("q");
    const brand = searchParams.get("brand") || searchParams.get("brandName");
    const category = searchParams.get("category");
    if (q) return `Search: "${q}"`;
    if (brand) return brand.toUpperCase();
    if (category) return category;
    return "All Footwear";
  };

  return (
    <>
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-border lg:hidden">
        
        {/* =========================================
            1. TAMPILAN UNTUK HOME PAGE
        ========================================= */}
        {isHome && (
          <div className="flex items-center gap-2.5 px-4 py-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
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

            {/* Sort/filter icon */}
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => setIsFilterOpen(true)}
              className="shrink-0 w-9 h-9 flex items-center justify-center"
            >
              <SlidersHorizontal size={20} className="text-foreground" />
            </motion.button>

            {/* Cart icon */}
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => {
                  if (!isAuthenticated) {
                    router.push(currentPath === "/" ? "/login" : `/login?callbackUrl=${encodeURIComponent(currentPath)}`);
                    return;
                  }
                  openCart();
                }}
              className="relative shrink-0 w-9 h-9 flex items-center justify-center"
            >
              <ShoppingBag size={22} className="text-foreground" />
              <CartBadge count={cartCount} />
            </motion.button>
          </div>
        )}

        {/* =========================================
            2. TAMPILAN UNTUK PRODUCT LIST PAGE
        ========================================= */}
        {isProductList && (
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={() => router.back()} className="p-1.5 -ml-1.5 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft size={24} className="text-gray-900" />
            </button>
            
            <div className="text-center flex-1 px-2">
              <h1 className="font-bold text-lg text-gray-900 tracking-tight capitalize truncate">
                {getListTitle()}
              </h1>
            </div>
            
            <div className="flex items-center gap-1">
              <button onClick={() => setIsFilterOpen(true)} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                <SlidersHorizontal size={22} className="text-gray-900" />
              </button>
              <button 
                onClick={() => {
                  if (!isAuthenticated) {
                    router.push(currentPath === "/" ? "/login" : `/login?callbackUrl=${encodeURIComponent(currentPath)}`);
                    return;
                  }
                  openCart();
                }}
                className="relative p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                <ShoppingBag size={22} className="text-gray-900" />
                <CartBadge count={cartCount} />
              </button>
            </div>
          </div>
        )}

        {/* =========================================
            3. TAMPILAN UNTUK PRODUCT DETAIL PAGE
        ========================================= */}
        {isProductDetail && (
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={() => router.back()} className="p-1.5 -ml-1.5 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft size={24} className="text-gray-900" />
            </button>
            
            <div className="flex items-center gap-1">
              <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                <Share2 size={22} className="text-gray-900" />
              </button>
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    router.push(currentPath === "/" ? "/login" : `/login?callbackUrl=${encodeURIComponent(currentPath)}`);
                    return;
                  }
                  openCart();
                }}
                className="relative p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                <ShoppingBag size={22} className="text-gray-900" />
                <CartBadge count={cartCount} />
              </button>
            </div>
          </div>
        )}

      </div>

      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={(selectedFilters) => {
          // Logika terapkan filter
        }}
      />
      <CartSidebar />
    </>
  );
}

// Komponen Badge
function CartBadge({ count }: { count: number }) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center bg-[#FF6B00] text-white text-[9px] font-bold rounded-full border-2 border-white"
        >
          {count > 9 ? "9+" : count}
        </motion.span>
      )}
    </AnimatePresence>
  );
}