"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ShoppingBag, User, Menu, X,
  ChevronDown, Heart, LogOut, Package, Settings,
} from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import { useAuthStore } from "@/lib/store/authStore";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { cn } from "@/lib/utils/cn";
import { MobileMenu } from "./MobileMenu";
import { CartSidebar } from "../cart/CartSidebar";
import { WishlistSidebar } from "../wishlist/WishlistSidebar";
import CampaignsService from "@/lib/api/campaigns.service";

// ─── Nav data ─────────────────────────────────────────────────────────────────

export const NAV_ITEMS = [
  {
    label: "New Arrivals",
    href: "/products?sort=newest",
    megaMenu: null,
    isHot: true,
  },
  {
    label: "Shoes",
    href: "/products?category=shoes",
    megaMenu: {
      featured: {
        label: "Trending Now",
        items: [], // populated dynamically from active campaign event
      },
      columns: [
        {
          title: "By Sport",
          links: [
            { label: "Running",       href: "/products?category=running"       },
            { label: "Basketball",    href: "/products?category=basketball"    },
            { label: "Training",      href: "/products?category=training"      },
            { label: "Lifestyle",     href: "/products?category=lifestyle"     },
            { label: "Skateboarding", href: "/products?category=skateboarding" },
          ],
        },
        {
          title: "By Brand",
          links: [
            { label: "Nike",        href: "/products?brand=nike"        },
            { label: "Adidas",      href: "/products?brand=adidas"      },
            { label: "New Balance", href: "/products?brand=new-balance" },
            { label: "Puma",        href: "/products?brand=puma"        },
            { label: "Converse",    href: "/products?brand=converse"    },
          ],
        },
        {
          title: "By Gender",
          links: [
            { label: "Men's",   href: "/products?gender=men"    },
            { label: "Women's", href: "/products?gender=women"  },
            { label: "Kids'",   href: "/products?gender=kids"   },
            { label: "Unisex",  href: "/products?gender=unisex" },
          ],
        },
      ],
    },
  },
  {
    label: "Apparel",
    href: "/products?category=apparel",
    megaMenu: null,
  },
  { label: "Brands", href: "/brands", megaMenu: null },
];

// ─── Mega Menu ────────────────────────────────────────────────────────────────

function MegaMenu({
  item,
  featuredItems,
}: {
  item: (typeof NAV_ITEMS)[number];
  featuredItems?: { label: string; href: string }[];
}) {
  if (!item.megaMenu) return null;
  const { megaMenu } = item;

  // Merge dynamic items into featured when provided and available
  const resolvedFeatured = megaMenu.featured
    ? {
        ...megaMenu.featured,
        items: featuredItems && featuredItems.length > 0
          ? featuredItems
          : megaMenu.featured.items,
      }
    : null;

  // Don't render featured column if there are no items at all
  const showFeatured = resolvedFeatured && resolvedFeatured.items.length > 0;

  // Total columns to determine grid
  const colCount = (showFeatured ? 1 : 0) + megaMenu.columns.length;
  const gridCols =
    colCount === 1 ? "grid-cols-1 max-w-xs" :
    colCount === 2 ? "grid-cols-2 max-w-md"  :
    colCount === 3 ? "grid-cols-3"            :
                     "grid-cols-[180px_1fr_1fr_1fr]";

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      className="fixed left-0 right-0 bg-card border-t-2 border-primary border-b border-border z-50 shadow-2xl"
      style={{ top: "96px" }}
    >
      <div className="container-2xl py-8">
        <div className={cn("grid gap-8", gridCols)}>
          {showFeatured && resolvedFeatured && (
            <div>
              <p className="label mb-4">{resolvedFeatured.label}</p>
              <ul className="space-y-2.5">
                {resolvedFeatured.items.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-gray-900 transition-colors font-medium flex items-center gap-1.5 min-w-0"
                    >
                      <span className="text-primary text-xs shrink-0">⚡</span>
                      <span className="truncate">{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-5 h-px bg-border" />
              <Link
                href={item.href}
                className="inline-block mt-4 text-xs font-bold uppercase tracking-widest text-black hover:text-brand-yellowDark transition-colors"
              >
                View All {item.label} →
              </Link>
            </div>
          )}

          {megaMenu.columns.map((col) => (
            <div key={col.title}>
              <p className="label mb-4">{col.title}</p>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>
      </div>
    </motion.div>
  );
}

// ─── Search overlay ───────────────────────────────────────────────────────────

function SearchBar({ onClose }: { onClose: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.18 }}
      className="absolute top-full left-0 right-0 bg-card border-b border-border z-50 shadow-2xl"
    >
      <div className="container-2xl py-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            ref={inputRef}
            type="search"
            placeholder="Search sneakers, brands, styles…"
            className="w-full bg-background border border-border pl-12 pr-12 py-4 text-foreground placeholder:text-muted-foreground font-sans focus:outline-none focus:border-primary transition-colors text-base"
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "Enter") {
                const q = (e.target as HTMLInputElement).value.trim();
                if (q) window.location.href = `/products?search=${encodeURIComponent(q)}`;
              }
            }}
          />
          <button
            onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2.5">
          Press <kbd className="px-1.5 py-0.5 bg-muted border border-border text-xs font-mono">Enter</kbd> to search ·{" "}
          <kbd className="px-1.5 py-0.5 bg-muted border border-border text-xs font-mono">Esc</kbd> to close
        </p>
      </div>
    </motion.div>
  );
}

// ─── Account dropdown ─────────────────────────────────────────────────────────

function AccountDropdown({ onClose, pathname }: { onClose: () => void; pathname: string }) {
  const { user, isAuthenticated, clearAuth } = useAuthStore();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -6 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-full mt-2 w-64 bg-card border border-border shadow-2xl z-50"
    >
      {!isAuthenticated ? (
        <div className="p-4">
          <p className="text-sm text-muted-foreground mb-3">Sign in to your account</p>
          <div className="space-y-2">
            <Link
              href={pathname === "/" ? "/login" : `/login?callbackUrl=${encodeURIComponent(pathname)}`}
              onClick={onClose}
              className="block w-full text-center bg-primary hover:bg-brand-yellowDark text-primary-foreground py-2.5 text-sm font-display uppercase tracking-wider transition-colors"
            >
              Sign In
            </Link>
            <Link
              href={pathname === "/" ? "/register" : `/register?callbackUrl=${encodeURIComponent(pathname)}`}
              onClick={onClose}
              className="block w-full text-center border border-border hover:border-primary text-foreground py-2.5 text-sm font-display uppercase tracking-wider transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="p-4 border-b border-border flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-display font-bold text-sm">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div>
              <p className="font-display text-sm uppercase tracking-wider">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <ul className="py-2">
            {[
              { icon: Package,  label: "My Orders",       href: "/account/orders"   },
              { icon: Settings, label: "My Account", href: "/account"          },
            ].map(({ icon: Icon, label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Icon size={14} /> {label}
                </Link>
              </li>
            ))}
            <li className="border-t border-border mt-2 pt-2">
              <button
                onClick={() => { clearAuth(); onClose(); }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </li>
          </ul>
        </>
      )}
    </motion.div>
  );
}

// ─── Logo ─────────────────────────────────────────────────────────────────────

function Logo() {
  return (
    <Link href="/" className="shrink-0 flex items-center">
      <div className="relative h-9 w-auto">
        <Image
          src="/images/logo_basic.png"
          alt="Sneakers Flash"
          width={140}
          height={36}
          className="h-9 w-auto object-contain"
          priority
        />
      </div>
    </Link>
  );
}

// ─── Cart badge ───────────────────────────────────────────────────────────────

function CartBadge({ count }: { count: number }) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center bg-[#FF6B00] text-white text-[9px] font-bold rounded-full border-2 border-white"
        >
          {count > 9 ? "9+" : count}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

// ─── Inner component: everything that needs useSearchParams ───────────────────

function NavbarInner() {
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const router       = useRouter();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const search      = searchParams.toString();
  const currentPath = search ? `${pathname}?${search}` : pathname;

  const [activeMenu,   setActiveMenu]   = useState<string | null>(null);
  const [showSearch,   setShowSearch]   = useState(false);
  const [showAccount,  setShowAccount]  = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isScrolled,   setIsScrolled]   = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [trendingItems,  setTrendingItems]  = useState<{ label: string; href: string }[]>([]);
  const [campaignItems,  setCampaignItems]  = useState<{ label: string; href: string }[]>([]);
  const navRef = useRef<HTMLDivElement>(null);

  // Single fetch: events → trending products (Shoes) + campaign list (Sale)
  useEffect(() => {
    async function loadCampaignData() {
      try {
        const events = await CampaignsService.getEvent();
        if (!events || events.length === 0) return;

        // All active campaigns → Sale dropdown
        setCampaignItems(
          events.map((e: any) => ({
            label: e.name ?? e.title ?? "Campaign",
            href:  e.slug
              ? `/events/${e.slug}`
              : `/products?sale=true&event=${e.id}`,
          }))
        );

        // Products from the first event → Shoes "Trending Now"
        const { data: products } = await CampaignsService.getEventProducts(
          events[0].id,
          { per_page: 3, page: 1 }
        );

        if (!products || products.length === 0) return;

        setTrendingItems(
          products.slice(0, 3).map((p: any) => {
            // Strip trailing " - SKU" (e.g. "ADIDAS NMD R1 - HQ4247" → "ADIDAS NMD R1")
            const name = (p.productName ?? "Product").replace(/\s*-\s*\S+$/, "").trim();
            return {
              label: name,
              href:  `/products/${p.productId}`,
            };
          })
        );
      } catch {
        // silently fall back — both states remain empty arrays
      }
    }
    loadCampaignData();
  }, []);

  const items = useCartStore((state) => state.items);
  const { openCart } = useCartStore();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const fn = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    setActiveMenu(null);
    setShowSearch(false);
    setShowAccount(false);
    setIsMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
        setShowSearch(false);
        setShowAccount(false);
      }
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileOpen]);

  const hasOverlay = Boolean(activeMenu || showSearch || showAccount);

  return (
    <>
      <header
        ref={navRef}
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
          isScrolled
            ? "bg-card/95 backdrop-blur-md border-b border-border shadow-lg"
            : "bg-card border-b border-border"
        )}
      >
        {/* Announcement bar */}
        <div className="announcement-bar">
          FREE SHIPPING ON ORDERS RP 50.000 &nbsp;⚡&nbsp; NEW DROPS EVERY FRIDAY
        </div>

        {/* Main nav row */}
        <div className="container-2xl">
          <div className="flex items-center h-16 gap-4 lg:gap-6">

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-1.5 text-foreground"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            {/* Logo */}
            <Logo />

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-0 flex-1 ml-4">
              {NAV_ITEMS.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setActiveMenu(item.label)}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "nav-link flex items-center gap-1 px-3 py-2",
                      (item as { isHot?: boolean }).isHot && "text-black",
                      pathname === item.href && "active"
                    )}
                  >
                    {item.label}
                    {(item as { isHot?: boolean }).isHot && (
                      <span className="text-[9px] font-bold bg-primary text-primary-foreground px-1.5 py-px uppercase tracking-wider ml-1">
                        New
                      </span>
                    )}
                    {item.megaMenu && (
                      <ChevronDown
                        size={13}
                        className={cn(
                          "transition-transform duration-200",
                          activeMenu === item.label && "rotate-180"
                        )}
                      />
                    )}
                  </Link>
                  <AnimatePresence>
                    {activeMenu === item.label && (
                      <MegaMenu
                        item={item}
                        featuredItems={item.label === "Shoes" ? trendingItems : undefined}
                      />
                    )}
                  </AnimatePresence>
                </div>
              ))}

              {/* Active campaigns — flat nav links, no dropdown */}
              {campaignItems.map((campaign) => (
                <Link
                  key={campaign.href}
                  href={campaign.href}
                  className="nav-link px-3 py-2 text-red-500 hover:text-red-400 truncate max-w-[140px]"
                  title={campaign.label}
                >
                  {campaign.label.length > 18 ? campaign.label.slice(0, 18) + "…" : campaign.label}
                </Link>
              ))}
            </nav>

            {/* Right icon cluster */}
            <div className="flex items-center gap-1 ml-auto">

              {/* Search */}
              <button
                onClick={() => { setShowSearch(!showSearch); setShowAccount(false); }}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Search"
              >
                <Search size={19} />
              </button>

              {/* Theme toggle */}
              {/* <ThemeToggle /> */}

              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsWishlistOpen(true)} // <-- Tambahkan ini
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                  aria-label="Wishlist"
                >
                  <Heart className="w-5 h-5" />
                </button>
              </div>
              {/* Account */}
              <div className="relative">
                <button
                  onClick={() => { setShowAccount(!showAccount); setShowSearch(false); }}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Account"
                >
                  <User size={19} />
                </button>
                <AnimatePresence>
                  {showAccount && (
                    <AccountDropdown
                      onClose={() => setShowAccount(false)}
                      pathname={currentPath}
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* Cart */}
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    router.push(
                      currentPath === "/"
                        ? "/login"
                        : `/login?callbackUrl=${encodeURIComponent(currentPath)}`
                    );
                    return;
                  }
                  openCart();
                  setShowSearch(false);
                  setShowAccount(false);
                }}
                className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={`Cart (${cartCount} items)`}
              >
                <ShoppingBag size={19} />
                <AnimatePresence>
                  <CartBadge count={cartCount} />
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        {/* Search overlay */}
        <AnimatePresence>
          {showSearch && <SearchBar onClose={() => setShowSearch(false)} />}
        </AnimatePresence>
      </header>

      {/* Spacer: announcement (32px) + nav (64px) = 96px */}
      <div className="h-[96px]" aria-hidden />

      {/* Backdrop overlay */}
      <AnimatePresence>
        {hasOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-30"
            onClick={() => {
              setActiveMenu(null);
              setShowSearch(false);
              setShowAccount(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Mobile menu */}
      <MobileMenu
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        navItems={NAV_ITEMS}
      />

      {/* Cart sidebar */}
      <CartSidebar />
      <WishlistSidebar 
        isOpen={isWishlistOpen} 
        onClose={() => setIsWishlistOpen(false)} 
      />
    </>
  );
}

// ─── Public export: wraps inner component in Suspense ────────────────────────

export function Navbar() {
  return (
    <Suspense fallback={
      // Minimal placeholder that holds the height so layout doesn't shift
      <div className="fixed top-0 left-0 right-0 z-40 bg-card border-b border-border h-[96px]" />
    }>
      <NavbarInner />
    </Suspense>
  );
}