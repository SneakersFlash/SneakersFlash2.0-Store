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

  const isHydrated = useAuthStore((state) => state.isHydrated);
  
  useEffect(() => {
    if (!isHydrated) return; 
    
  }, [isHydrated]);
  const isHome = pathname === "/";
  
  const isProductDetail = pathname.match(/^\/products\/[^\/]+$/);
  
  const isCheckout = pathname.startsWith("/checkout");
  const isBrands = pathname.startsWith("/brands");
  const isOrder = pathname.startsWith("/orders");
  // const isMyOrder = pathname.startsWith("/account/orders");

  const showDesktopNavbar = !isCheckout && !isOrder  ;
  const showFooter = !isCheckout && !isOrder ;
  
  const showBottomNav = !isProductDetail && !isCheckout;

  return (
    <>
      {/* --- DESKTOP NAVBAR --- */}
      {showDesktopNavbar && (
        <div className="hidden lg:block">
          <Navbar /> 
        </div>
      )}

      {!isCheckout && (
        <TopSearchBar />
      )}

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