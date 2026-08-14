"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BottomNavigation } from "@/components/home/BottomNavigation";
import { TopSearchBar } from "@/components/home/TopSearchBar";
import { useAuthStore } from "@/lib/store/authStore";
import { useEffect } from "react";
import WelcomeVoucherPopup from "@/components/voucher/WelcomeVoucherPopup";
import WelcomePointsPopup from "@/components/voucher/WelcomePointsPopup";
import { FreedomFloatingButton } from "@/components/campaign/FreedomFloatingButton";

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isHydrated = useAuthStore((state) => state.isHydrated);
  const welcomeVoucher = useAuthStore((state) => state.welcomeVoucher);
  const clearWelcomeVoucher = useAuthStore((state) => state.clearWelcomeVoucher);
  const welcomePoints = useAuthStore((state) => state.welcomePoints);
  const clearWelcomePoints = useAuthStore((state) => state.clearWelcomePoints);

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

      {/* Selama promo Kemerdekaan backend kirim poin (bukan voucher), jadi
          hanya salah satu dari dua popup ini yang pernah terisi. */}
      <WelcomePointsPopup
        points={welcomePoints}
        onClose={clearWelcomePoints}
      />

      {/* Pintasan ke campaign Kemerdekaan. Menyembunyikan dirinya sendiri di
          halaman campaign & checkout, dan berhenti tampil begitu campaign
          lewat — tidak perlu dicabut manual dari sini. */}
      <FreedomFloatingButton />
    </>
  );
}