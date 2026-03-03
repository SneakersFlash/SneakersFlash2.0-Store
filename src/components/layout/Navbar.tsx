"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ShoppingBag, User, Menu, X,
  ChevronDown, Heart, LogOut, Package, Settings,
} from "lucide-react";
import { useCartStore, selectCartItemCount } from "@/lib/store/cartStore";
import { useAuthStore } from "@/lib/store/authStore";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { cn } from "@/lib/utils/cn";
import { MobileMenu } from "./MobileMenu";
import { CartSidebar } from "../cart/CartSidebar";

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
        items: [
          { label: "Air Jordan 1",  href: "/products?q=air+jordan+1" },
          { label: "Yeezy Boost",   href: "/products?q=yeezy"        },
          { label: "NMD R1",        href: "/products?q=nmd"          },
        ],
      },
      columns: [
        {
          title: "By Sport",
          links: [
            { label: "Running",      href: "/products?category=running"      },
            { label: "Basketball",   href: "/products?category=basketball"   },
            { label: "Training",     href: "/products?category=training"     },
            { label: "Lifestyle",    href: "/products?category=lifestyle"    },
            { label: "Skateboarding",href: "/products?category=skateboarding"},
          ],
        },
        {
          title: "By Brand",
          links: [
            { label: "Nike",         href: "/products?brand=nike"        },
            { label: "Adidas",       href: "/products?brand=adidas"      },
            { label: "New Balance",  href: "/products?brand=new-balance" },
            { label: "Puma",         href: "/products?brand=puma"        },
            { label: "Converse",     href: "/products?brand=converse"    },
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
    megaMenu: {
      featured: null,
      columns: [
        {
          title: "Tops",
          links: [
            { label: "T-Shirts",  href: "/products?category=tshirts"  },
            { label: "Hoodies",   href: "/products?category=hoodies"  },
            { label: "Jackets",   href: "/products?category=jackets"  },
            { label: "Jerseys",   href: "/products?category=jerseys"  },
          ],
        },
        {
          title: "Bottoms",
          links: [
            { label: "Pants",   href: "/products?category=pants"   },
            { label: "Shorts",  href: "/products?category=shorts"  },
            { label: "Joggers", href: "/products?category=joggers" },
          ],
        },
        {
          title: "Accessories",
          links: [
            { label: "Hats & Caps", href: "/products?category=hats"  },
            { label: "Socks",       href: "/products?category=socks" },
            { label: "Bags",        href: "/products?category=bags"  },
          ],
        },
      ],
    },
  },
  { label: "Brands", href: "/brands",              megaMenu: null },
  { label: "Sale",   href: "/products?sale=true",  megaMenu: null, isSale: true },
];

// ─── Mega Menu ────────────────────────────────────────────────────────────────

function MegaMenu({ item }: { item: (typeof NAV_ITEMS)[number] }) {
  if (!item.megaMenu) return null;
  const { megaMenu } = item;

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
        <div className={cn(
          "grid gap-8",
          megaMenu.featured ? "grid-cols-[180px_1fr_1fr_1fr]" : "grid-cols-3"
        )}>
          {megaMenu.featured && (
            <div>
              <p className="label mb-4">{megaMenu.featured.label}</p>
              <ul className="space-y-2.5">
                {megaMenu.featured.items.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium flex items-center gap-1.5"
                    >
                      <span className="text-primary text-xs">⚡</span> {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-5 h-px bg-border" />
              <Link
                href={item.href}
                className="inline-block mt-4 text-xs font-bold uppercase tracking-widest text-primary hover:text-brand-yellowDark transition-colors"
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
                if (q) window.location.href = `/products?q=${encodeURIComponent(q)}`;
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

function AccountDropdown({ onClose }: { onClose: () => void }) {
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
              href="/login"
              onClick={onClose}
              className="block w-full text-center bg-primary hover:bg-brand-yellowDark text-primary-foreground py-2.5 text-sm font-display uppercase tracking-wider transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
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
              { icon: Package,  label: "My Orders",        href: "/account/orders"   },
              { icon: Heart,    label: "Wishlist",          href: "/account/wishlist" },
              { icon: Settings, label: "Account Settings",  href: "/account"          },
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
          src="/images/logo.jpeg"
          alt="SNKRS Flash"
          width={140}
          height={36}
          className="h-9 w-auto object-contain"
          priority
        />
      </div>
    </Link>
  );
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────

export function Navbar() {
  const pathname    = usePathname();
  const [activeMenu,  setActiveMenu]  = useState<string | null>(null);
  const [showSearch,  setShowSearch]  = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isScrolled,  setIsScrolled]  = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  const cartItemCount = useCartStore(selectCartItemCount);
  const { openCart }  = useCartStore();

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
        setActiveMenu(null); setShowSearch(false); setShowAccount(false);
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
        {/* ── Announcement bar ── */}
        <div className="announcement-bar">
          FREE SHIPPING ON ORDERS OVER RP 500.000 &nbsp;⚡&nbsp; NEW DROPS EVERY FRIDAY
        </div>

        {/* ── Main nav row ── */}
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
                      (item as { isSale?: boolean }).isSale  && "text-red-500 hover:text-red-400",
                      (item as { isHot?:  boolean }).isHot   && "text-primary",
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
                    {activeMenu === item.label && <MegaMenu item={item} />}
                  </AnimatePresence>
                </div>
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
              <ThemeToggle />

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
                  {showAccount && <AccountDropdown onClose={() => setShowAccount(false)} />}
                </AnimatePresence>
              </div>

              {/* Cart */}
              <button
                onClick={() => { openCart(); setShowSearch(false); setShowAccount(false); }}
                className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={`Cart (${cartItemCount} items)`}
              >
                <ShoppingBag size={19} />
                <AnimatePresence>
                  {cartItemCount > 0 && (
                    <motion.span
                      key="badge"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold rounded-full"
                    >
                      {cartItemCount > 9 ? "9+" : cartItemCount}
                    </motion.span>
                  )}
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
            onClick={() => { setActiveMenu(null); setShowSearch(false); setShowAccount(false); }}
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
    </>
  );
}