"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  // Jika hanya ada 1 halaman atau kurang, sembunyikan pagination
  if (totalPages <= 1) return null;

  // Fungsi untuk membuat deretan angka dengan elipsis (...)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      // Tampilkan semua angka jika halaman sedikit
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Jika halaman banyak, gunakan elipsis (...)
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }

    return pages;
  };

  const pages = getPageNumbers();
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  return (
    <div className={cn("flex items-center justify-center gap-2 w-full my-5", className)}>
      
      {/* Tombol Previous */}
      <button
        onClick={() => canPrev && onPageChange(currentPage - 1)}
        disabled={!canPrev}
        className={cn(
          "w-10 h-10 flex items-center justify-center rounded-lg border transition-colors",
          canPrev 
            ? "border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-black" 
            : "border-gray-100 text-gray-300 cursor-not-allowed"
        )}
        aria-label="Previous Page"
      >
        <ChevronLeft size={20} />
      </button>

      {/* Deretan Angka Halaman */}
      <div className="flex items-center gap-1.5">
        {pages.map((page, index) => {
          if (page === "...") {
            return (
              <div 
                key={`ellipsis-${index}`} 
                className="w-10 h-10 flex items-center justify-center text-gray-400"
              >
                <MoreHorizontal size={16} />
              </div>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <button
              key={`page-${pageNum}`}
              onClick={() => onPageChange(pageNum)}
              className={cn(
                "w-10 h-10 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors border",
                isActive
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:bg-gray-50 hover:text-black"
              )}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      {/* Tombol Next */}
      <button
        onClick={() => canNext && onPageChange(currentPage + 1)}
        disabled={!canNext}
        className={cn(
          "w-10 h-10 flex items-center justify-center rounded-lg border transition-colors",
          canNext 
            ? "border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-black" 
            : "border-gray-100 text-gray-300 cursor-not-allowed"
        )}
        aria-label="Next Page"
      >
        <ChevronRight size={20} />
      </button>
      
    </div>
  );
}