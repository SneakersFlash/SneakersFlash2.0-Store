"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
  Heart,
  LogOut,
  Package,
  Settings,
} from "lucide-react";
import { useCartStore, selectCartItemCount } from "@/lib/store/cartStore";
import { useAuthStore } from "@/lib/store/authStore";
import { cn } from "@/lib/utils/cn";
import { MobileMenu } from "./MobileMenu";
import { CartSidebar } from "../cart/CartSidebar";

// ─── Navigation data ──────────────────────────────────────────────────────────

const NAV_ITEMS = [
  {
    label: "New Arrivals",
    href: "/products?sort=newest",
    megaMenu: null,
  },
  {
    label: "Shoes",
    href: "/products?category=shoes",
    megaMenu: {
      featured: {
        label: "Trending Now",
        items: [
          { label: "Air Jordan 1", href: "/products?q=air+jordan+1" },
          { label: "Yeezy Boost", href: "/products?q=yeezy" },
          { label: "NMD R1", href: "/products?q=nmd" },
        ],
      },
      columns: [
        {
          title: "By Sport",
          links: [
            { label: "Running", href: "/products?category=running" },
            { label: "Basketball", href: "/products?category=basketball" },
            { label: "Training", href: "/products?category=training" },
            { label: "Lifestyle", href: "/products?category=lifestyle" },
            { label: "Skateboarding", href: "/products?category=skateboarding" },
          ],
        },
        {
          title: "By Brand",
          links: [
            { label: "Nike", href: "/products?brand=nike" },
            { label: "Adidas", href: "/products?brand=adidas" },
            { label: "New Balance", href: "/products?brand=new-balance" },
            { label: "Puma", href: "/products?brand=puma" },
            { label: "Converse", href: "/products?brand=converse" },
          ],
        },
        {
          title: "By Gender",
          links: [
            { label: "Men's", href: "/products?gender=men" },
            { label: "Women's", href: "/products?gender=women" },
            { label: "Kids'", href: "/products?gender=kids" },
            { label: "Unisex", href: "/products?gender=unisex" },
          ],
        },
      ],
    },
  },
  {
    label: "Apparel",
    href: "/products?category=apparel",
    megaMenu: {
      featured: null,
      columns: [
        {
          title: "Tops",
          links: [
            { label: "T-Shirts", href: "/products?category=tshirts" },
            { label: "Hoodies", href: "/products?category=hoodies" },
            { label: "Jackets", href: "/products?category=jackets" },
            { label: "Jerseys", href: "/products?category=jerseys" },
          ],
        },
        {
          title: "Bottoms",
          links: [
            { label: "Pants", href: "/products?category=pants" },
            { label: "Shorts", href: "/products?category=shorts" },
            { label: "Joggers", href: "/products?category=joggers" },
          ],
        },
        {
          title: "Accessories",
          links: [
            { label: "Hats & Caps", href: "/products?category=hats" },
            { label: "Socks", href: "/products?category=socks" },
            { label: "Bags", href: "/products?category=bags" },
          ],
        },
      ],
    },
  },
  {
    label: "Brands",
    href: "/brands",
    megaMenu: null,
  },
  {
    label: "Sale",
    href: "/products?sale=true",
    megaMenu: null,
    isRed: true,
  },
];

// ─── Mega Menu ────────────────────────────────────────────────────────────────

function MegaMenu({
  item,
}: {
  item: (typeof NAV_ITEMS)[number];
}) {
  if (!item.megaMenu) return null;
  const { megaMenu } = item;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="absolute top-full left-0 right-0 bg-brand-gray-900 border-t border-border z-50 shadow-2xl"
    >
      <div className="container-2xl py-8">
        <div
          className={cn(
            "grid gap-8",
            megaMenu.featured
              ? "grid-cols-[200px_1fr_1fr_1fr]"
              : "grid-cols-3"
          )}
        >
          {/* Featured */}
          {megaMenu.featured && (
            <div>
              <p className="label mb-4">{megaMenu.featured.label}</p>
              <ul className="space-y-2">
                {megaMenu.featured.items.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                    >
                      → {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-6 h-px bg-border" />
              <Link
                href={item.href}
                className="inline-block mt-4 text-xs font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
              >
                View All {item.label} →
              </Link>
            </div>
          )}

          {/* Columns */}
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

// ─── Search Bar ───────────────────────────────────────────────────────────────

function SearchBar({ onClose }: { onClose: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="absolute top-full left-0 right-0 bg-brand-gray-900 border-b border-border z-50 shadow-2xl"
    >
      <div className="container-2xl py-6">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={20}
          />
          <input
            ref={inputRef}
            type="search"
            placeholder="Search shoes, brands, styles..."
            className="w-full bg-brand-gray-800 border border-border pl-12 pr-12 py-4 text-foreground placeholder:text-muted-foreground font-sans focus:outline-none focus:border-primary transition-colors text-lg"
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "Enter") {
                const q = (e.target as HTMLInputElement).value.trim();
                if (q) window.location.href = `/products?q=${encodeURIComponent(q)}`;
              }
            }}
          />
          <button
            onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Press <kbd className="px-1.5 py-0.5 bg-muted border border-border text-xs font-mono">Enter</kbd> to search or{" "}
          <kbd className="px-1.5 py-0.5 bg-muted border border-border text-xs font-mono">Esc</kbd> to close
        </p>
      </div>
    </motion.div>
  );
}

// ─── Account Dropdown ─────────────────────────────────────────────────────────

function AccountDropdown({ onClose }: { onClose: () => void }) {
  const { user, isAuthenticated, clearAuth } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -8 }}
        transition={{ duration: 0.15 }}
        className="absolute right-0 top-full mt-2 w-64 bg-brand-gray-900 border border-border shadow-2xl z-50"
      >
        <div className="p-4 border-b border-border">
          <p className="text-sm text-muted-foreground mb-3">
            Sign in to access your account
          </p>
          <div className="space-y-2">
            <Link
              href="/login"
              onClick={onClose}
              className="block w-full text-center bg-primary hover:bg-primary/90 text-white py-2.5 text-sm font-display uppercase tracking-wider transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              onClick={onClose}
              className="block w-full text-center bg-transparent border border-border hover:border-foreground text-foreground py-2.5 text-sm font-display uppercase tracking-wider transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -8 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-full mt-2 w-64 bg-brand-gray-900 border border-border shadow-2xl z-50"
    >
      <div className="p-4 border-b border-border">
        <p className="font-display text-sm uppercase tracking-wider">
          {user?.firstName} {user?.lastName}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
      </div>
      <ul className="py-2">
        {[
          { icon: Package, label: "My Orders", href: "/account/orders" },
          { icon: Heart, label: "Wishlist", href: "/account/wishlist" },
          { icon: Settings, label: "Account Settings", href: "/account" },
        ].map(({ icon: Icon, label, href }) => (
          <li key={href}>
            <Link
              href={href}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-brand-gray-800 transition-colors"
            >
              <Icon size={15} />
              {label}
            </Link>
          </li>
        ))}
        <li className="border-t border-border mt-2 pt-2">
          <button
            onClick={() => {
              clearAuth();
              onClose();
            }}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-primary hover:bg-brand-gray-800 transition-colors"
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </li>
      </ul>
    </motion.div>
  );
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────

export function Navbar() {
  const pathname = usePathname();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  const cartItemCount = useCartStore(selectCartItemCount);
  const { openCart } = useCartStore();

  // Scroll detection for backdrop
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setActiveMenu(null);
    setShowSearch(false);
    setShowAccount(false);
    setIsMobileOpen(false);
  }, [pathname]);

  // Click-outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
        setShowSearch(false);
        setShowAccount(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileOpen]);

  return (
    <>
      <header
        ref={navRef}
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
          isScrolled
            ? "bg-brand-black/95 backdrop-blur-sm border-b border-border shadow-xl"
            : "bg-brand-black border-b border-border"
        )}
      >
        {/* ── Top announcement bar ── */}
        <div className="bg-primary text-white text-center py-2 text-xs font-sans font-medium tracking-wide">
          FREE SHIPPING ON ORDERS OVER RP 500.000 &nbsp;|&nbsp; NEW DROPS EVERY FRIDAY
        </div>

        {/* ── Main nav row ── */}
        <div className="container-2xl">
          <div className="flex items-center h-16 gap-6">

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden text-foreground p-1"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>

            {/* Logo */}
            <Link
              href="/"
              className="font-display text-2xl font-bold tracking-wider text-foreground shrink-0 mr-4 lg:mr-8"
            >
              SNEAKERS<span className="text-primary">FLASH</span>
            </Link>

            {/* Desktop nav links */}
            <nav className="hidden lg:flex items-center gap-1 flex-1">
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
                      item.isRed && "text-primary hover:text-primary/80",
                      pathname === item.href && "active"
                    )}
                  >
                    {item.label}
                    {item.megaMenu && (
                      <ChevronDown
                        size={14}
                        className={cn(
                          "transition-transform duration-200",
                          activeMenu === item.label && "rotate-180"
                        )}
                      />
                    )}
                  </Link>

                  <AnimatePresence>
                    {activeMenu === item.label && item.megaMenu && (
                      <div className="fixed left-0 right-0" style={{ top: "calc(64px + 40px)" }}>
                        <MegaMenu item={item} />
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* Right icons */}
            <div className="flex items-center gap-1 ml-auto">
              {/* Search */}
              <button
                onClick={() => {
                  setShowSearch(!showSearch);
                  setShowAccount(false);
                  setActiveMenu(null);
                }}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              {/* Account */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowAccount(!showAccount);
                    setShowSearch(false);
                    setActiveMenu(null);
                  }}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Account"
                >
                  <User size={20} />
                </button>
                <AnimatePresence>
                  {showAccount && (
                    <AccountDropdown onClose={() => setShowAccount(false)} />
                  )}
                </AnimatePresence>
              </div>

              {/* Cart */}
              <button
                onClick={() => {
                  openCart();
                  setShowSearch(false);
                  setShowAccount(false);
                }}
                className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={`Cart (${cartItemCount} items)`}
              >
                <ShoppingBag size={20} />
                <AnimatePresence>
                  {cartItemCount > 0 && (
                    <motion.span
                      key="badge"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center bg-primary text-white text-[10px] font-bold rounded-full"
                    >
                      {cartItemCount > 9 ? "9+" : cartItemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        {/* ── Search overlay ── */}
        <AnimatePresence>
          {showSearch && <SearchBar onClose={() => setShowSearch(false)} />}
        </AnimatePresence>
      </header>

      {/* ── Spacer to push content below fixed header ── */}
      {/* Announcement bar (32px) + nav (64px) = 96px */}
      <div className="h-[96px]" aria-hidden />

      {/* ── Overlays ── */}
      <AnimatePresence>
        {(activeMenu || showSearch || showAccount) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-30"
            onClick={() => {
              setActiveMenu(null);
              setShowSearch(false);
              setShowAccount(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Mobile menu ── */}
      <MobileMenu
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        navItems={NAV_ITEMS}
      />

      {/* ── Cart sidebar ── */}
      <CartSidebar />
    </>
  );
}
