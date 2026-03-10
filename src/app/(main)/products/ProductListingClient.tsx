"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ArrowLeft, Search, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { useProducts } from "@/lib/hooks/useProducts";
import { ProductGrid } from "@/components/product/ProductGrid";
import { FilterModal } from "@/components/common/FIlterModal"; // Pastikan path import sesuai
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

export function ProductListingClient({ 
  categoryName, 
  subCategories = [] 
}: ProductListingClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // --- 1. STATE UNTUK MODAL FILTER ---
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  
  // --- 2. AMBIL PARAMETER DARI URL ---
  const categoryFromUrl = searchParams.get("category");
  const subCategoryFromUrl = searchParams.get("subCategory") || "all";
  const brandFromUrl = searchParams.get("brand") || searchParams.get("brandName"); 
  const qFromUrl = searchParams.get("q"); 
  const sortFromUrl: any = searchParams.get("sort");
  const pageFromUrl = Number(searchParams.get("page")) || 1; // Default ke halaman 1

  // --- 3. BENTUK FILTER UNTUK API ---
  const currentFilters: ProductFilters = {
    page: pageFromUrl,
    limit: 12, // Anda bisa mengatur jumlah produk per halaman di sini
  };

  if (subCategoryFromUrl !== "all") currentFilters.categoryName = subCategoryFromUrl;
  else if (categoryFromUrl) currentFilters.categoryName = categoryFromUrl;
  
  if (brandFromUrl) currentFilters.brandName = brandFromUrl;
  if (qFromUrl) currentFilters.q = qFromUrl;
  if (sortFromUrl) currentFilters.sort = sortFromUrl;

  // --- 4. FETCH DATA ---
  const { data, isLoading } = useProducts(currentFilters);
  const products = data?.data || [];
  const totalProducts = data?.meta.total || 0;
  const totalPages = data?.meta.lastPage || 1;

  // --- 5. FUNGSI UPDATE URL (PAGINATION & TABS & MODAL) ---
  const updateUrlParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) params.delete(key);
      else params.set(key, value);
    });

    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleTabChange = (slug: string) => {
    updateUrlParams({ 
      subCategory: slug === "all" ? null : slug,
      page: "1" // Reset ke halaman 1 jika ganti tab
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    updateUrlParams({ page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: "smooth" }); // Gulir ke atas saat ganti halaman
  };

  // Fungsi saat tombol "Apply" di modal filter ditekan
  const handleApplyFilter = (modalFilters: any) => {
    // Memetakan data dari FilterModal ke format URL Parameter
    updateUrlParams({
      // Gabungkan brand yang dipilih menjadi string yang dipisahkan koma (jika ada)
      brand: modalFilters.brands.length > 0 ? modalFilters.brands.join(",") : null,
      
      // Ubah format sort: "high-to-low" menjadi "desc", dsb (sesuaikan dengan backend Anda)
      sort: modalFilters.priceSort === "high-to-low" ? "desc" 
          : modalFilters.priceSort === "low-to-high" ? "asc" 
          : null,
          
      page: "1" // Selalu reset ke halaman 1 jika filter berubah
    });
  };

  const displayTitle = qFromUrl ? `Search: "${qFromUrl}"` : brandFromUrl ? `${brandFromUrl.toUpperCase()}` : categoryName || "All Footwear";

  return (
    <div className="flex flex-col flex-1">
      
      {/* --- TOP HEADER --- */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="p-1.5 -ml-1.5 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-gray-900" />
          </button>
          
          <div className="text-center">
            <h1 className="font-bold text-lg text-gray-900 tracking-tight capitalize">
              {displayTitle}
            </h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              {isLoading ? "Loading..." : `${totalProducts} Products`}
            </p>
          </div>
          
          {/* Tombol Filter Utama di Header */}
          <button 
            onClick={() => setIsFilterModalOpen(true)}
            className="p-1.5 -mr-1.5 hover:bg-gray-100 rounded-full transition-colors relative"
          >
            <SlidersHorizontal size={22} className="text-gray-900" />
            {(brandFromUrl || sortFromUrl) && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF6B00] rounded-full border border-white"></span>
            )}
          </button>
        </div>

        {/* --- HORIZONTAL FILTER TABS --- */}
        {subCategories.length > 0 && !brandFromUrl && !qFromUrl && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 mt-4">
            <button
              onClick={() => handleTabChange("all")}
              className={cn(
                "shrink-0 px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border",
                subCategoryFromUrl === "all" ? "bg-black text-white border-black shadow-md" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              All
            </button>
            {subCategories.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.slug)}
                className={cn(
                  "shrink-0 px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border",
                  subCategoryFromUrl === tab.slug ? "bg-black text-white border-black shadow-md" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                {tab.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* --- PRODUCT GRID AREA --- */}
      <div className="px-4 py-6 flex-1">
        <ProductGrid
          products={products}
          isLoading={isLoading}
          columns={2} 
          skeletonCount={6}
        />

        {/* --- PAGINATION CONTROLS --- */}
        {!isLoading && totalPages > 1 && (
          <Pagination
            currentPage={pageFromUrl}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* --- FILTER MODAL INTEGRATION --- */}
      <FilterModal 
        isOpen={isFilterModalOpen} 
        onClose={() => setIsFilterModalOpen(false)} 
        onApply={handleApplyFilter} 
      />
      
    </div>
  );
}