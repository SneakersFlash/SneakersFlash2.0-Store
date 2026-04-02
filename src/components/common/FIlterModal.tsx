"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- Tipe Data ---
interface FilterState {
  isAllProduct: boolean;
  category: string | null;
  priceSort: "high-to-low" | "low-to-high" | null;
  brands: string[];
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
}

export function FilterModal({ isOpen, onClose, onApply }: FilterModalProps) {
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

  const handleReset = () => {
    setFilters({
      isAllProduct: true,
      category: null,
      priceSort: null,
      brands: [],
    });
  };

  return (
    // AnimatePresence mendeteksi kapan elemen di dalamnya di-unmount 
    // sehingga animasi 'exit' bisa dijalankan
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Gelap (Opsional, mempertegas modal jika di layar besar) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[998] bg-black/40 sm:block"
          />

          {/* Kontainer Modal */}
          <motion.div
            // Animasi meluncur dari bawah (y: "100%") ke posisi normal (y: 0)
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
            </div>

            {/* --- BODY (Scrollable) --- */}
            <div className="flex-1 overflow-y-auto p-5 pb-32">
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
                    onClick={() =>
                      setFilters({ ...filters, category: "new", isAllProduct: false })
                    }
                  />
                  <FilterPill
                    label="Best Deals"
                    icon={
                      <svg className="w-4 h-4 text-[#FF6B00]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 2.26L18.98 4l.64 3.76L22 10.5l-2.38 2.89L20.26 17l-3.64 1.28L15.09 22 12 20.35 8.91 22l-1.53-3.72L3.74 17l.64-3.61L2 10.5l2.38-2.89L3.74 4l3.64-1.28L8.91 2 12 20.35zM10.5 9.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-4.3-5.2l5.6 5.6 1.4-1.4-5.6-5.6-1.4 1.4z" />
                      </svg>
                    }
                    isActive={filters.category === "deals"}
                    onClick={() =>
                      setFilters({ ...filters, category: "deals", isAllProduct: false })
                    }
                  />
                </div>
              </div>

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
                    onClick={() =>
                      setFilters({ ...filters, priceSort: "high-to-low", isAllProduct: false })
                    }
                  />
                  <FilterPill
                    label="Low to High"
                    isActive={filters.priceSort === "low-to-high"}
                    onClick={() =>
                      setFilters({ ...filters, priceSort: "low-to-high", isAllProduct: false })
                    }
                  />
                </div>
              </div>

              <div className="mt-8">
                <h3
                  className="text-sm font-black uppercase tracking-wider text-zinc-900 mb-4"
                  style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                >
                  Brand
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {["Nike", "Puma", "Skechers", "Adidas", "Converse", "Asics"].map((brand) => (
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

            {/* --- FOOTER (Fixed Bottom) --- */}
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
      whileTap={{ scale: 0.95 }} // Tambahan efek membal sedikit saat pill ditekan
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