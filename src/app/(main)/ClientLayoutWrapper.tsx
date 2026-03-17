"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BottomNavigation } from "@/components/home/BottomNavigation";
import { TopSearchBar } from "@/components/home/TopSearchBar"; // Pastikan path import benar
import { useAuthStore } from "@/lib/store/authStore";
import { useEffect } from "react";

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // --- LOGIKA KONDISI URL ---
  
  const isHydrated = useAuthStore((state) => state.isHydrated);
  
  useEffect(() => {
    // Jangan panggil API jika Zustand belum selesai membaca localStorage
    if (!isHydrated) return; 
    
    // fetchApiWithToken();
  }, [isHydrated]);
  // 1. Apakah ini halaman Home?
  const isHome = pathname === "/";
  
  // 2. Apakah ini halaman Detail Produk? (Contoh: /products/nike-air-force-1)
  // Regex ini mencocokkan "/products/" yang diikuti karakter apapun selain garis miring
  const isProductDetail = pathname.match(/^\/products\/[^\/]+$/);
  
  // 3. Apakah ini halaman Checkout?
  const isCheckout = pathname.startsWith("/checkout");

  // --- ATURAN VISIBILITAS ---
  const showDesktopNavbar = !isCheckout;
  const showFooter = !isCheckout;
  
  // Bottom Nav disembunyikan di Detail Produk (karena ada bar Add to Cart) dan Checkout
  const showBottomNav = !isProductDetail && !isCheckout;

  return (
    <>
      {/* --- DESKTOP NAVBAR --- */}
      {showDesktopNavbar && (
        <div className="hidden lg:block">
          {/* Anda bisa meng-uncomment Navbar jika komponennya sudah siap */}
          <Navbar /> 
        </div>
      )}

      {/* --- MOBILE GLOBAL HEADER --- */}
      {/* TopSearchBar sekarang akan pintar mengatur bentuknya sendiri */}
      {!isCheckout && (
        <TopSearchBar />
      )}

      {/* --- KONTEN HALAMAN UTAMA --- */}
      {/* pb-20 digunakan agar konten tidak tertutup BottomNavigation jika sedang aktif */}
      <main className={`min-h-screen ${showBottomNav ? " lg:pb-0" : ""}`}>
        {children}
      </main>

      {/* --- MOBILE BOTTOM NAVIGATION --- */}
      {showBottomNav && (
        <div className="lg:hidden">
          <BottomNavigation />
        </div>
      )}

      {/* --- DESKTOP FOOTER --- */}
      {showFooter && (
        <div className="hidden lg:block">
          <Footer />
        </div>
      )}
    </>
  );
}