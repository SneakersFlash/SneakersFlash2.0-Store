"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- Tipe Data ---
export interface FilterState {
  isAllProduct: boolean;
  category: "new" | "deals" | null;
  priceSort: "high-to-low" | "low-to-high" | null;
  brands: string[];
}

/**
 * Konversi FilterState → URLSearchParams untuk dikirim ke BE.
 *
 * Pemakaian di parent component:
 *   const params = buildFilterParams(filters);
 *   const res = await fetch(`/api/products?${params}`);
 */
export function buildFilterParams(
  filters: FilterState,
  base: Record<string, string> = {}
): URLSearchParams {
  const params = new URLSearchParams(base);

  // Reset ke default jika isAllProduct
  if (filters.isAllProduct) {
    return params;
  }

  // category: "new" | "deals"
  if (filters.category) {
    params.set("category", filters.category);
  }

  // priceSort: langsung cocok dengan field BE
  if (filters.priceSort) {
    params.set("priceSort", filters.priceSort);
  }

  // brands: join array → comma-separated string
  // BE akan split kembali menjadi array dan filter OR
  if (filters.brands.length > 0) {
    params.set("brands", filters.brands.join(","));
  }

  return params;
}

// --- Props ---
interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Dipanggil dengan FilterState yang sudah dipilih user */
  onApply: (filters: FilterState) => void;
  /** Daftar brand yang tersedia (ambil dari API atau hardcode) */
  availableBrands?: string[];
}

const DEFAULT_BRANDS = ["Nike", "Puma", "Skechers", "Adidas", "Converse", "Asics"];

export function FilterModal({
  isOpen,
  onClose,
  onApply,
  availableBrands = DEFAULT_BRANDS,
}: FilterModalProps) {
  const [filters, setFilters] = useState<FilterState>({
    isAllProduct: true,
    category: null,
    priceSort: null,
    brands: [],
  });

  // Mengunci scroll body saat modal terbuka
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const toggleBrand = (brandName: string) => {
    setFilters((prev) => {
      const isSelected = prev.brands.includes(brandName);
      return {
        ...prev,
        brands: isSelected
          ? prev.brands.filter((b) => b !== brandName)
          : [...prev.brands, brandName],
        isAllProduct: false,
      };
    });
  };

  const handleSetCategory = (cat: "new" | "deals") => {
    setFilters((prev) => ({
      ...prev,
      // Toggle: klik lagi → deselect
      category: prev.category === cat ? null : cat,
      isAllProduct: false,
    }));
  };

  const handleSetPriceSort = (sort: "high-to-low" | "low-to-high") => {
    setFilters((prev) => ({
      ...prev,
      // Toggle: klik lagi → deselect
      priceSort: prev.priceSort === sort ? null : sort,
      isAllProduct: false,
    }));
  };

  const handleReset = () => {
    setFilters({
      isAllProduct: true,
      category: null,
      priceSort: null,
      brands: [],
    });
  };

  // Hitung jumlah filter aktif untuk badge
  const activeFilterCount =
    (filters.category ? 1 : 0) +
    (filters.priceSort ? 1 : 0) +
    filters.brands.length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[998] bg-black/40 sm:block"
          />

          {/* Kontainer Modal */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[999] flex flex-col bg-white sm:max-w-md sm:mx-auto sm:border-x sm:shadow-xl sm:top-12 sm:rounded-t-2xl"
          >
            {/* --- HEADER --- */}
            <div className="flex items-center px-4 py-4 border-b border-gray-100 bg-white sm:rounded-t-2xl">
              <button
                onClick={onClose}
                className="p-1 -ml-1 text-zinc-900 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
              <p
                className="ml-4 font-black text-xl uppercase tracking-tight text-zinc-900"
                style={{ fontFamily: "var(--font-oswald), sans-serif" }}
              >
                Filter
              </p>
              {/* Badge jumlah filter aktif */}
              {activeFilterCount > 0 && (
                <span className="ml-2 flex items-center justify-center w-5 h-5 rounded-full bg-[#FF6B00] text-white text-xs font-bold">
                  {activeFilterCount}
                </span>
              )}
            </div>

            {/* --- BODY (Scrollable) --- */}
            <div className="flex-1 overflow-y-auto p-5 pb-32">
              {/* All Product */}
              <button
                onClick={handleReset}
                className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${
                  filters.isAllProduct
                    ? "bg-[#FF6B00] text-white shadow-md"
                    : "bg-gray-100 text-zinc-700 hover:bg-gray-200"
                }`}
              >
                All Product
              </button>

              {/* Categories */}
              <div className="mt-8">
                <h3
                  className="text-sm font-black uppercase tracking-wider text-zinc-900 mb-4"
                  style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                >
                  Categories
                </h3>
                <div className="flex flex-wrap gap-3">
                  <FilterPill
                    label="New Product"
                    icon="🔥"
                    isActive={filters.category === "new"}
                    onClick={() => handleSetCategory("new")}
                  />
                  <FilterPill
                    label="Best Deals"
                    icon={
                      <svg
                        className="w-4 h-4 text-[#FF6B00]"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2l3.09 2.26L18.98 4l.64 3.76L22 10.5l-2.38 2.89L20.26 17l-3.64 1.28L15.09 22 12 20.35 8.91 22l-1.53-3.72L3.74 17l.64-3.61L2 10.5l2.38-2.89L3.74 4l3.64-1.28L8.91 2 12 20.35zM10.5 9.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-4.3-5.2l5.6 5.6 1.4-1.4-5.6-5.6-1.4 1.4z" />
                      </svg>
                    }
                    isActive={filters.category === "deals"}
                    onClick={() => handleSetCategory("deals")}
                  />
                </div>
              </div>

              {/* Price Sort */}
              <div className="mt-8">
                <h3
                  className="text-sm font-black uppercase tracking-wider text-zinc-900 mb-4"
                  style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                >
                  Price
                </h3>
                <div className="flex flex-wrap gap-3">
                  <FilterPill
                    label="High to Low"
                    isActive={filters.priceSort === "high-to-low"}
                    onClick={() => handleSetPriceSort("high-to-low")}
                  />
                  <FilterPill
                    label="Low to High"
                    isActive={filters.priceSort === "low-to-high"}
                    onClick={() => handleSetPriceSort("low-to-high")}
                  />
                </div>
              </div>

              {/* Brands */}
              <div className="mt-8">
                <h3
                  className="text-sm font-black uppercase tracking-wider text-zinc-900 mb-4"
                  style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                >
                  Brand
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {availableBrands.map((brand) => (
                    <FilterPill
                      key={brand}
                      label={brand}
                      isActive={filters.brands.includes(brand)}
                      onClick={() => toggleBrand(brand)}
                      className="justify-center w-full"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* --- FOOTER --- */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white grid grid-cols-2 gap-3 pb-safe z-10 sm:rounded-b-2xl">
              <button
                onClick={handleReset}
                className="py-3.5 border border-zinc-300 rounded-xl font-bold text-zinc-900 hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => {
                  onApply(filters);
                  onClose();
                }}
                className="py-3.5 bg-[#1C1C1C] rounded-xl font-bold text-white hover:bg-black transition-colors"
              >
                Apply
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// --- Komponen Pembantu ---
interface FilterPillProps {
  label: string;
  icon?: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  className?: string;
}

function FilterPill({ label, icon, isActive, onClick, className = "" }: FilterPillProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-semibold transition-all ${
        isActive
          ? "border-[#FF6B00] bg-orange-50 text-[#FF6B00]"
          : "border-gray-200 bg-white text-zinc-800 hover:border-gray-300"
      } ${className}`}
    >
      {icon && <span>{icon}</span>}
      <span>{label}</span>
    </motion.button>
  );
}