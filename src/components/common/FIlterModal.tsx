"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProductFacets } from "@/lib/hooks/useProducts";
import { formatPrice } from "@/lib/utils/formatPrice";

// --- Tipe Data ---
export interface FilterState {
  genders: string[];                       // "mens" | "womens" | "unisex"
  sports: string[];                        // "Sportstyle" | "Running" | ...
  brands: string[];
  maxPrice: number | null;                 // null = semua harga
  sizes: string[];
  priceSort: "high-to-low" | "low-to-high" | null;
  category: "new" | "deals" | null;
}

export const EMPTY_FILTERS: FilterState = {
  genders: [],
  sports: [],
  brands: [],
  maxPrice: null,
  sizes: [],
  priceSort: null,
  category: null,
};

const list = (v: string | null) =>
  (v ?? "").split(",").map((x) => x.trim()).filter(Boolean);

/**
 * URL → FilterState. Ikut membaca parameter lama dari Navbar (?gender=men,
 * ?brand=new-balance) supaya modal terbuka dengan pilihan yang sedang aktif,
 * bukan kosong.
 */
export function filtersFromParams(sp: URLSearchParams): FilterState {
  const genders = list(sp.get("genders"));
  const navGender = sp.get("gender")?.toLowerCase();
  if (genders.length === 0 && navGender) {
    if (navGender.startsWith("wom")) genders.push("womens");
    else if (navGender.startsWith("men")) genders.push("mens");
    else if (navGender === "unisex") genders.push("unisex");
  }

  const brands = list(sp.get("brands"));
  const navBrand = sp.get("brand") || sp.get("brandName");
  if (brands.length === 0 && navBrand) {
    brands.push(navBrand.replace(/-/g, " ").toUpperCase());
  }

  const maxPrice = Number(sp.get("maxPrice"));
  const priceSort = sp.get("priceSort");
  const category = sp.get("category");

  return {
    genders,
    sports: list(sp.get("sports")),
    brands,
    maxPrice: Number.isFinite(maxPrice) && maxPrice > 0 ? maxPrice : null,
    sizes: list(sp.get("sizes")),
    priceSort:
      priceSort === "high-to-low" || priceSort === "low-to-high" ? priceSort : null,
    category: category === "new" || category === "deals" ? category : null,
  };
}

/**
 * FilterState → perubahan URL. Parameter Navbar (`gender`, `brand`) dihapus
 * karena isinya sudah dipindah ke versi multi-nya; kalau dibiarkan, pilihan
 * di modal kalah oleh parameter lama yang tak kelihatan.
 */
export function filtersToParamUpdates(
  f: FilterState
): Record<string, string | null> {
  const join = (a: string[]) => (a.length > 0 ? a.join(",") : null);
  return {
    genders: join(f.genders),
    sports: join(f.sports),
    brands: join(f.brands),
    maxPrice: f.maxPrice != null ? String(f.maxPrice) : null,
    sizes: join(f.sizes),
    priceSort: f.priceSort,
    category: f.category,
    gender: null,
    brand: null,
    brandName: null,
    page: "1",
  };
}

export function countActiveFilters(f: FilterState): number {
  return (
    f.genders.length +
    f.sports.length +
    f.brands.length +
    f.sizes.length +
    (f.maxPrice != null ? 1 : 0) +
    (f.priceSort ? 1 : 0) +
    (f.category ? 1 : 0)
  );
}

const GENDER_LABEL: Record<string, string> = {
  mens: "Mens",
  womens: "Womens",
  unisex: "Unisex",
};

const PRICE_STEP = 50_000;

type ListKey = "genders" | "sports" | "brands" | "sizes";

// --- Props ---
interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Dipanggil dengan FilterState yang sudah dipilih user */
  onApply: (filters: FilterState) => void;
  /** Pilihan yang sedang aktif (dari URL); modal dibuka dengan isi ini. */
  initial?: FilterState;
}

export function FilterModal({
  isOpen,
  onClose,
  onApply,
  initial = EMPTY_FILTERS,
}: FilterModalProps) {
  const [filters, setFilters] = useState<FilterState>(initial);
  const { data: facets, isLoading: facetsLoading } = useProductFacets(isOpen);

  // Setiap kali dibuka, mulai dari filter yang sedang aktif di URL.
  useEffect(() => {
    if (isOpen) setFilters(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

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

  const isOn = (key: ListKey, value: string) =>
    filters[key].some((v) => v.toLowerCase() === value.toLowerCase());

  const toggle = (key: ListKey, value: string) => {
    setFilters((prev) => {
      const has = prev[key].some((v) => v.toLowerCase() === value.toLowerCase());
      return {
        ...prev,
        [key]: has
          ? prev[key].filter((v) => v.toLowerCase() !== value.toLowerCase())
          : [...prev[key], value],
      };
    });
  };

  const handleSetCategory = (cat: "new" | "deals") =>
    setFilters((prev) => ({ ...prev, category: prev.category === cat ? null : cat }));

  const handleSetPriceSort = (sort: "high-to-low" | "low-to-high") =>
    setFilters((prev) => ({ ...prev, priceSort: prev.priceSort === sort ? null : sort }));

  const handleReset = () => setFilters(EMPTY_FILTERS);

  const activeFilterCount = countActiveFilters(filters);

  // Ujung kanan slider = harga tertinggi katalog, dibulatkan ke atas.
  // Slider di ujung kanan berarti "semua harga" (tanpa batas).
  const sliderMax = Math.max(
    PRICE_STEP * 2,
    Math.ceil((facets?.priceMax ?? 10_000_000) / PRICE_STEP) * PRICE_STEP
  );
  const sliderValue = Math.min(filters.maxPrice ?? sliderMax, sliderMax);
  const sliderPct = ((sliderValue - PRICE_STEP) / (sliderMax - PRICE_STEP)) * 100;
  const noPriceLimit = filters.maxPrice == null || filters.maxPrice >= sliderMax;

  // Pill tanpa produk disembunyikan (data kategori diisi dari sheet bertahap),
  // kecuali yang sedang dipilih — supaya tetap bisa dimatikan.
  const genders = (facets?.genders ?? []).filter(
    (g) => g.count > 0 || isOn("genders", g.value)
  );
  const sports = (facets?.sports ?? []).filter(
    (s) => s.count > 0 || isOn("sports", s.value)
  );

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
                aria-label="Tutup filter"
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
              {activeFilterCount > 0 && (
                <span className="ml-2 flex items-center justify-center w-5 h-5 rounded-full bg-[#FF6B00] text-white text-xs font-bold">
                  {activeFilterCount}
                </span>
              )}
            </div>

            {/* --- BODY (Scrollable) --- */}
            <div className="flex-1 overflow-y-auto p-5 pb-32">
              {/* Gender */}
              <Section title="Gender" first>
                {facetsLoading ? (
                  <PillSkeleton n={3} />
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {genders.map((g) => (
                      <FilterPill
                        key={g.value}
                        label={GENDER_LABEL[g.value] ?? g.value}
                        isActive={isOn("genders", g.value)}
                        onClick={() => toggle("genders", g.value)}
                      />
                    ))}
                  </div>
                )}
              </Section>

              {/* Kategori olahraga */}
              {(facetsLoading || sports.length > 0) && (
                <Section title="Category">
                  {facetsLoading ? (
                    <PillSkeleton n={4} />
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {sports.map((s) => (
                        <FilterPill
                          key={s.value}
                          label={s.value}
                          isActive={isOn("sports", s.value)}
                          onClick={() => toggle("sports", s.value)}
                        />
                      ))}
                    </div>
                  )}
                </Section>
              )}

              {/* Brand */}
              <Section title="Brand">
                {facetsLoading ? (
                  <PillSkeleton n={6} />
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {(facets?.brands ?? []).map((b) => (
                      <FilterPill
                        key={b.name}
                        label={b.name}
                        isActive={isOn("brands", b.name)}
                        onClick={() => toggle("brands", b.name)}
                        className="justify-center w-full"
                      />
                    ))}
                  </div>
                )}
              </Section>

              {/* Price: slider budget maksimal + urutan */}
              <Section title="Price">
                <div className="flex items-baseline justify-between mb-4">
                  <span className="text-sm text-zinc-500">Budget maksimal</span>
                  <span className="text-base font-bold text-zinc-900">
                    {noPriceLimit ? "Semua harga" : formatPrice(sliderValue)}
                  </span>
                </div>
                <input
                  type="range"
                  min={PRICE_STEP}
                  max={sliderMax}
                  step={PRICE_STEP}
                  value={sliderValue}
                  disabled={facetsLoading}
                  aria-label="Budget maksimal"
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setFilters((prev) => ({ ...prev, maxPrice: v >= sliderMax ? null : v }));
                  }}
                  className="sf-range w-full"
                  style={{
                    background: `linear-gradient(to right, #FF6B00 ${sliderPct}%, #e5e7eb ${sliderPct}%)`,
                  }}
                />
                <div className="flex justify-between mt-2 text-xs text-zinc-400">
                  <span>{formatPrice(PRICE_STEP)}</span>
                  <span>{formatPrice(sliderMax, { compact: true })}</span>
                </div>

                <div className="flex flex-wrap gap-3 mt-5">
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
              </Section>

              {/* Size — hanya ukuran yang stoknya masih ada */}
              <Section title="Size">
                {facetsLoading ? (
                  <PillSkeleton n={8} />
                ) : (
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                    {(facets?.sizes ?? []).map((size) => (
                      <motion.button
                        key={size}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggle("sizes", size)}
                        className={`py-2.5 rounded-lg border text-sm font-semibold transition-all ${
                          isOn("sizes", size)
                            ? "border-[#FF6B00] bg-orange-50 text-[#FF6B00]"
                            : "border-gray-200 bg-white text-zinc-800 hover:border-gray-300"
                        }`}
                      >
                        {size}
                      </motion.button>
                    ))}
                  </div>
                )}
              </Section>

              {/* Koleksi — filter lama, tetap ada */}
              <Section title="Collection">
                <div className="flex flex-wrap gap-3">
                  <FilterPill
                    label="New Product"
                    icon="🔥"
                    isActive={filters.category === "new"}
                    onClick={() => handleSetCategory("new")}
                  />
                  <FilterPill
                    label="Best Deals"
                    isActive={filters.category === "deals"}
                    onClick={() => handleSetCategory("deals")}
                  />
                </div>
              </Section>
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
function Section({
  title,
  first = false,
  children,
}: {
  title: string;
  first?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={first ? "" : "mt-8"}>
      <h3
        className="text-sm font-black uppercase tracking-wider text-zinc-900 mb-4"
        style={{ fontFamily: "var(--font-oswald), sans-serif" }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function PillSkeleton({ n }: { n: number }) {
  return (
    <div className="flex flex-wrap gap-3">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="h-10 w-20 rounded-full bg-gray-100 animate-pulse" />
      ))}
    </div>
  );
}

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
