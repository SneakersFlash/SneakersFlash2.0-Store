"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutGrid, Heart, LogIn } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  {
    label: "Home",
    href: "/",
    icon: null, // uses logo image
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
  },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Spacer so content isn't hidden behind nav */}
      <div className="h-16 lg:hidden" aria-hidden />

      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-card border-t border-border">
        <div className="flex items-center justify-around h-16 px-2">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link key={item.label} href={item.href} className="flex-1">
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 py-1",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {item.isLogo ? (
                    <div className="w-8 h-8 relative">
                      <Image
                        src="/images/logo.jpeg"
                        alt="Home"
                        fill
                        className="object-contain"
                        sizes="32px"
                      />
                    </div>
                  ) : (
                    item.icon && (
                      <item.icon
                        size={22}
                        className={cn(
                          "transition-colors",
                          isActive ? "text-primary" : "text-muted-foreground"
                        )}
                        strokeWidth={isActive ? 2.5 : 1.8}
                      />
                    )
                  )}
                  <span
                    className={cn(
                      "text-[10px] font-medium tracking-wide",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}