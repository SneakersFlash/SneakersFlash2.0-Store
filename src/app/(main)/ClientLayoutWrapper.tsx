"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BottomNavigation } from "@/components/home/BottomNavigation";
import { TopSearchBar } from "@/components/home/TopSearchBar";
import { useAuthStore } from "@/lib/store/authStore";
import { useEffect } from "react";
import WelcomeVoucherPopup from "@/components/voucher/WelcomeVoucherPopup";
import { Campaign99FloatingButton } from "@/components/campaign/Campaign99FloatingButton";
import { Campaign99Popup } from "@/components/campaign/Campaign99Popup";

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

      {/* ─── Tombol mengambang campaign 9.9 ───────────────────────────────────
           Menyembunyikan dirinya sendiri di /9-9-sale, di checkout, dan sesudah
           campaign berakhir (9 Sep 23:59 WIB) — jadi mencabutnya tidak butuh
           deploy, tinggal biarkan lewat. Komponennya baru perlu dilepas dari
           sini kalau memang mau dibersihkan.
      ──────────────────────────────────────────────────────────────────────── */}
      <Campaign99FloatingButton />

      {/* ─── Pop-up campaign 9.9 ──────────────────────────────────────────────
           Hanya di beranda, muncul sekali per sesi, menutup sendiri setelah
           5 detik. Sama seperti tombol mengambang di atas, ia berhenti muncul
           sendiri sesudah campaign berakhir — tidak perlu deploy untuk
           mencabutnya.
      ──────────────────────────────────────────────────────────────────────── */}
      <Campaign99Popup />

    </>
  );
}