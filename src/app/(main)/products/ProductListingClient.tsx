"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { useProducts } from "@/lib/hooks/useProducts";
import { ProductGrid } from "@/components/product/ProductGrid";
import { FilterModal, FilterState } from "@/components/common/FIlterModal";
import { cn } from "@/lib/utils/cn";
import type { ProductFilters } from "@/types/product.types";
import { Pagination } from "@/components/common/Pagination";

interface SubCategory {
  id: string;
  slug: string;
  name: string;
}

interface ProductListingClientProps {
  categoryName?: string;
  subCategories?: SubCategory[];
}

// ─── Inner component ──────────────────────────────────────────────────────────
function ProductListingClientInner({
  categoryName,
  subCategories = [],
}: ProductListingClientProps) {
  const router    = useRouter();
  const pathname  = usePathname();
  const searchParams = useSearchParams();

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // ── Baca URL params ────────────────────────────────────────────────────────
  const categoryFromUrl    = searchParams.get("category");
  const subCategoryFromUrl = searchParams.get("subCategory") || "all";
  const brandFromUrl       = searchParams.get("brand");
  const brandsFromUrl      = searchParams.get("brands");        // multi-brand dari FilterModal
  const searchFromUrl      = searchParams.get("search") || searchParams.get("q");
  const priceSortFromUrl   = searchParams.get("priceSort");     // dari FilterModal
  const sortFromUrl        = searchParams.get("sort");          // dari Navbar (?sort=newest)
  const genderFromUrl      = searchParams.get("gender");        // dari Navbar (?gender=men)
  const pageFromUrl        = Number(searchParams.get("page")) || 1;

  // ── Bangun ProductFilters dari URL → dikirim ke useProducts ───────────────
  const currentFilters: ProductFilters = {
    page:  pageFromUrl,
    limit: 12,
  };

  // Category: subCategory tab diprioritaskan, lalu ?category dari URL
  if (subCategoryFromUrl !== "all") {
    currentFilters.category = subCategoryFromUrl;
  } else if (categoryFromUrl) {
    currentFilters.category = categoryFromUrl;
  }

  // Brand: multi (FilterModal) diprioritaskan, lalu single (Navbar)
  if (brandsFromUrl) {
    currentFilters.brands = brandsFromUrl.split(",").map(b => b.trim()).filter(Boolean);
  } else if (brandFromUrl) {
    currentFilters.brand = brandFromUrl;
  }

  // Search
  if (searchFromUrl) currentFilters.search = searchFromUrl;

  // Gender (dari Navbar)
  if (genderFromUrl) currentFilters.gender = genderFromUrl;

  // Price sort:
  //   FilterModal → ?priceSort=high-to-low | low-to-high (langsung)
  //   Navbar      → ?sort=newest / price-asc / price-desc (perlu mapping)
  if (priceSortFromUrl === "high-to-low" || priceSortFromUrl === "low-to-high") {
    currentFilters.priceSort = priceSortFromUrl;
  } else if (sortFromUrl) {
    if (sortFromUrl === "newest")     { currentFilters.sortBy = "createdAt"; currentFilters.sortOrder = "desc"; }
    if (sortFromUrl === "price-asc")  { currentFilters.priceSort = "low-to-high"; }
    if (sortFromUrl === "price-desc") { currentFilters.priceSort = "high-to-low"; }
    if (sortFromUrl === "name")       { currentFilters.sortBy = "name"; currentFilters.sortOrder = "asc"; }
  }

  const { data, isLoading } = useProducts(currentFilters);
  const products      = data?.data        || [];
  const totalProducts = data?.meta.total  || 0;
  const totalPages    = data?.meta.lastPage || 1;

  // ── Cek ada filter aktif (untuk dot badge di tombol) ──────────────────────
  const hasActiveFilter = Boolean(
    brandsFromUrl || brandFromUrl || priceSortFromUrl ||
    (categoryFromUrl && categoryFromUrl !== categoryName) // filter beda dari default page
  );

  // ── Helper: update URL ─────────────────────────────────────────────────────
  const updateUrlParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) params.delete(key);
      else params.set(key, value);
    });
    router.replace(`${pathname}?${params.toString()}`);
  };

  // ── Handler: klik tab subkategori ──────────────────────────────────────────
  const handleTabChange = (slug: string) => {
    updateUrlParams({
      subCategory: slug === "all" ? null : slug,
      page: "1",
    });
  };

  // ── Handler: ganti halaman ─────────────────────────────────────────────────
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    updateUrlParams({ page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Handler: FilterModal.onApply ───────────────────────────────────────────
  //
  // FilterState dari FilterModal:
  //   { isAllProduct, category: "new"|"deals"|null, priceSort: "high-to-low"|null, brands: string[] }
  //
  // Tulis ke URL dengan field yang sama persis seperti yang BE terima.
  //
  const handleApplyFilter = (modalFilters: FilterState) => {
    if (modalFilters.isAllProduct) {
      // Reset semua filter → hapus semua param filter, pertahankan search & subCategory
      updateUrlParams({
        category:  null,
        brands:    null,
        brand:     null,
        priceSort: null,
        page:      "1",
      });
      return;
    }

    updateUrlParams({
      // category: "new" | "deals" | null
      category: modalFilters.category ?? null,

      // brands: ["Nike","Puma"] → "Nike,Puma" (BE split kembali ke array)
      brands: modalFilters.brands.length > 0 ? modalFilters.brands.join(",") : null,

      // priceSort: langsung tulis, BE mengerti "high-to-low" / "low-to-high"
      priceSort: modalFilters.priceSort ?? null,

      // Reset pagination
      page: "1",
    });
  };

  // ── Display title ──────────────────────────────────────────────────────────
  const displayTitle = searchFromUrl
    ? `Search: "${searchFromUrl}"`
    : brandFromUrl
    ? brandFromUrl.replace(/-/g, " ").toUpperCase()
    : categoryName || "All Footwear";

  return (
    <div className="flex flex-col flex-1 pb-2">
      <div className="container mx-auto max-w-7xl px-4 py-6 md:py-10">

        {/* HEADER: TITLE & FILTER BUTTON */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 md:mb-8">
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 hover:border-gray-900 rounded-full text-sm font-bold transition-all shadow-sm w-full md:w-auto group"
          >
            <SlidersHorizontal
              size={16}
              className="text-gray-500 group-hover:text-gray-900 transition-colors"
            />
            Filter & Sort
            {/* Dot: muncul jika ada filter aktif dari FilterModal */}
            {hasActiveFilter && (
              <span className="w-2 h-2 bg-[#FF6B00] rounded-full ml-1" />
            )}
          </button>
          <div>
            <p className="text-xs md:text-sm text-gray-500 mt-1.5 font-medium">
              {isLoading
                ? "Fetching collection..."
                : `Showing ${totalProducts} results`}
            </p>
          </div>
        </div>

        {/* SUBCATEGORY TABS */}
        {subCategories.length > 0 && !brandFromUrl && !searchFromUrl && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-4 mb-4 border-b border-gray-200/60">
            <button
              onClick={() => handleTabChange("all")}
              className={cn(
                "shrink-0 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-200 border",
                subCategoryFromUrl === "all"
                  ? "bg-[#1C1C1C] text-white border-[#1C1C1C] shadow-md"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-900"
              )}
            >
              All
            </button>
            {subCategories.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.slug)}
                className={cn(
                  "shrink-0 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-200 border",
                  subCategoryFromUrl === tab.slug
                    ? "bg-[#1C1C1C] text-white border-[#1C1C1C] shadow-md"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-900"
                )}
              >
                {tab.name}
              </button>
            ))}
          </div>
        )}

        {/* PRODUCT GRID */}
        <div className="w-full mt-6">
          <ProductGrid
            products={products}
            isLoading={isLoading}
            columns={4}
            skeletonCount={8}
          />

          {!isLoading && totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                currentPage={pageFromUrl}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilter}
      />
    </div>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────
export function ProductListingClient(props: ProductListingClientProps) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col flex-1 pb-2">
          <div className="container mx-auto max-w-7xl px-4 py-6 md:py-10">
            <div className="h-10 w-40 bg-gray-100 rounded-full animate-pulse mb-8" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <ProductListingClientInner {...props} />
    </Suspense>
  );
}