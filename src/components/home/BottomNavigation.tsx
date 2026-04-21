"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, Heart, LogIn, User, Package, Settings, LogOut, Home } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAuthStore } from "@/lib/store/authStore";
import { WishlistSidebar } from "@/components/wishlist/WishlistSidebar";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  {
    label: "Home",
    href: "/",
    icon: Home, // uses logo image
    isLogo: true,
  },
  {
    label: "Category",
    href: "/products",
    icon: LayoutGrid,
    isLogo: false,
  },
  {
    label: "Wishlist",
    href: "/account/wishlist",
    icon: Heart,
    isLogo: false,
  },
  {
    label: "Login",
    href: "/login",
    icon: LogIn,
    isLogo: false,
    isAuthDependent: true, // penanda bahwa tombol ini berubah berdasarkan status auth
  },
];

function BottomNavigationInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const currentPath = search ? `${pathname}?${search}` : pathname;

  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const [showAccount, setShowAccount] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  return (
    <>
      {/* Spacer so content isn't hidden behind nav */}
      <div className="h-16 lg:hidden" aria-hidden />

      {/* Main Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16 px-2">
          {NAV_ITEMS.map((item, idx) => {
            const isAuthItem = item.isAuthDependent;
            
            // Ubah label & icon jika user sudah login
            const displayLabel = isAuthItem && isAuthenticated ? "Account" : item.label;
            const DisplayIcon = isAuthItem && isAuthenticated ? User : item.icon;
            
            // Cek kondisi menu sedang aktif
            let isActive = false;
            if (isAuthItem && isAuthenticated) {
              isActive = showAccount || pathname.startsWith("/account");
            } else if (item.label === "Wishlist") {
              isActive = isWishlistOpen
            } else {
              isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            }

            // Atur rute dinamis callbackUrl
            let finalHref = item.href;
            if (isAuthItem && !isAuthenticated && currentPath !== "/") {
              finalHref = `/login?callbackUrl=${encodeURIComponent(currentPath)}`;
            }

            // Komponen isi tombol (Icon + Label)
            const ItemContent = (
              <motion.div
                whileTap={{ scale: 0.85 }}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-1 w-full h-full",
                  isActive ? "text-[#FF6B00]" : "text-gray-400"
                )}
              >
                {
                  DisplayIcon && (
                    <DisplayIcon
                      size={22}
                      className={cn(
                        "transition-colors",
                        isActive ? "text-black" : "text-gray-400"
                      )}
                      strokeWidth={isActive ? 2.5 : 1.8}
                    />
                  )
                }
                {displayLabel && (
                  <span
                    className={cn(
                      "text-[10px] font-medium tracking-wide",
                      isActive ? "text-black" : "text-gray-400"
                    )}
                  >
                    {displayLabel}
                  </span>
                )}
              </motion.div>
            );

            if (item.label === "Wishlist") {
              return (
                <button 
                  key={item.label || idx} 
                  className="flex-1 h-full focus:outline-none"
                  onClick={() => {
                    if (!isAuthenticated) {
                      router.push(currentPath === "/" ? "/login" : `/login?callbackUrl=${encodeURIComponent(currentPath)}`);
                      return;
                    }
                    setIsWishlistOpen(true);
                  }}
                >
                  {ItemContent}
                </button>
              );
            }

            // Jika item ini menu akun dan user SUDAH login, jadikan tombol yang memicu pop-up (bukan Link)
            if (isAuthItem && isAuthenticated) {
              return (
                <button 
                  key={item.label || idx} 
                  className="flex-1 h-full focus:outline-none"
                  onClick={() => setShowAccount(true)}
                >
                  {ItemContent}
                </button>
              );
            }

            // Jika tombol biasa (Home, Category, dsb) ATAU menu Login (karena belum login)
            return (
              <Link key={item.label || idx} href={finalHref} className="flex-1 h-full focus:outline-none">
                {ItemContent}
              </Link>
            );
          })}
        </div>
      </nav>

      <WishlistSidebar 
        isOpen={isWishlistOpen} 
        onClose={() => setIsWishlistOpen(false)} 
      />
      {/* Mobile Account Menu (Bottom Sheet Drawer) */}
      <AnimatePresence>
        {showAccount && isAuthenticated && (
          <>
            {/* Dark Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 z-50 lg:hidden"
              onClick={() => setShowAccount(false)}
            />

            {/* Sliding Panel */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 lg:hidden overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.1)] pb-[env(safe-area-inset-bottom)]"
            >
              {/* Drag Handle Indicator */}
              <div 
                className="w-full flex justify-center pt-4 pb-2 active:bg-gray-50"
                onClick={() => setShowAccount(false)}
              >
                <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
              </div>

              {/* Profile Header */}
              <div className="p-5 border-b border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF6B00] font-bold text-lg rounded-full uppercase shrink-0">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-base font-bold text-gray-900 leading-tight truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5 truncate">{user?.email}</p>
                </div>
              </div>

               {/* Navigation Links */}
              <ul className="py-2 px-3">
                {[
                  { icon: Package,  label: "My Orders",        href: "/account/orders"   },
                  { icon: Settings, label: "My Account",  href: "/account"          },
                ].map(({ icon: Icon, label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={() => setShowAccount(false)}
                      className="flex items-center gap-3 px-4 py-4 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <Icon size={20} className="text-gray-400" /> 
                      <span className="font-semibold text-base">{label}</span>
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Logout Button */}
              <div className="p-4 pt-2 border-t border-gray-100 mb-2">
                <button
                  onClick={() => { clearAuth(); setShowAccount(false); }}
                  className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 py-3.5 rounded-xl text-sm font-bold transition-colors active:scale-[0.98]"
                >
                  <LogOut size={18} /> Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export function BottomNavigation() {
  return (
    <Suspense fallback={<div className="h-16 lg:hidden" aria-hidden />}>
      <BottomNavigationInner />
    </Suspense>
  );
}