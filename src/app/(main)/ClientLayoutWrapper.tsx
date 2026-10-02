"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BottomNavigation } from "@/components/home/BottomNavigation";
import { TopSearchBar } from "@/components/home/TopSearchBar";
import { useAuthStore } from "@/lib/store/authStore";
import { useEffect } from "react";
import WelcomeVoucherPopup from "@/components/voucher/WelcomeVoucherPopup";
import { Lowtober1010Popup } from "@/components/campaign/Lowtober1010Popup";
import { Lowtober1010FloatingButton } from "@/components/campaign/Lowtober1010FloatingButton";

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

      {/* ─── Tombol mengambang campaign 10.10 ─────────────────────────────────
           Menyembunyikan dirinya sendiri di /10-10-sale, di checkout, dan
           sesudah campaign berakhir (10 Okt 23:59 WIB) — tidak perlu deploy
           untuk mencabutnya.
      ──────────────────────────────────────────────────────────────────────── */}
      <Lowtober1010FloatingButton />

      {/* ─── Pop-up campaign 10.10 ────────────────────────────────────────────
           Hanya di beranda, muncul sekali per sesi, menutup sendiri setelah
           5 detik. Menggantikan pop-up SAVETAMBER (2 Okt 2026); tier-nya ganti
           sendiri tengah malam 10 Okt dan pop-up berhenti muncul sesudah
           10 Okt 23:59 WIB.
      ──────────────────────────────────────────────────────────────────────── */}
      <Lowtober1010Popup />

    </>
  );
}