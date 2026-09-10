"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BottomNavigation } from "@/components/home/BottomNavigation";
import { TopSearchBar } from "@/components/home/TopSearchBar";
import { useAuthStore } from "@/lib/store/authStore";
import { useEffect } from "react";
import WelcomeVoucherPopup from "@/components/voucher/WelcomeVoucherPopup";
import { ClearanceSalePopup } from "@/components/campaign/ClearanceSalePopup";

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isHydrated = useAuthStore((state) => state.isHydrated);
  const welcomeVoucher = useAuthStore((state) => state.welcomeVoucher);
  const clearWelcomeVoucher = useAuthStore((state) => state.clearWelcomeVoucher);

  useEffect(() => {
    if (!isHydrated) return;
  }, [isHydrated]);

  const isHome = pathname === "/";
  const isProductDetail = pathname.match(/^\/products\/[^\/]+$/);
  const isCheckout = pathname.startsWith("/checkout");
  const isBrands = pathname.startsWith("/brands");
  const isOrder = pathname.startsWith("/orders");

  const showDesktopNavbar = !isCheckout && !isOrder;
  const showFooter = !isCheckout && !isOrder;
  const showBottomNav = !isProductDetail && !isCheckout;

  return (
    <>
      {/* --- DESKTOP NAVBAR --- */}
      {showDesktopNavbar && (
        <div className="hidden lg:block">
          <Navbar />
        </div>
      )}

      {!isCheckout && <TopSearchBar />}

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

      {/* ─── Welcome Voucher Popup ────────────────────────────────────────────
           Muncul di seluruh route (main) setelah login pertama kali.
           Dipicu dari authStore → di-set oleh handleSuccess di useAuthGMutations
           (berlaku untuk verifyOtp, Google login, Apple login, dsb.)
      ──────────────────────────────────────────────────────────────────────── */}
      <WelcomeVoucherPopup
        voucher={welcomeVoucher}
        onClose={clearWelcomeVoucher}
      />

      {/* ─── Pop-up Clearance Sale ────────────────────────────────────
           Hanya di beranda, muncul sekali per sesi, menutup sendiri setelah
           5 detik. Menggantikan pop-up 9.9 yang dicabut bersama halamannya
           (10 Sep 2026); ia berhenti muncul sendiri sesudah event clearance
           berakhir — tidak perlu deploy untuk mencabutnya.
      ────────────────────────────────────────────────────────────────────── */}
      <ClearanceSalePopup />

    </>
  );
}