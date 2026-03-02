"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, LogIn, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAuthStore } from "@/lib/store/authStore";

interface NavItem {
  label: string;
  href: string;
  isRed?: boolean;
  megaMenu?: {
    featured?: { label: string; items: { label: string; href: string }[] } | null;
    columns: { title: string; links: { label: string; href: string }[] }[];
  } | null;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
}

export function MobileMenu({ isOpen, onClose, navItems }: MobileMenuProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const { user, isAuthenticated, clearAuth } = useAuthStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 lg:hidden"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 left-0 bottom-0 w-80 bg-brand-gray-900 z-50 lg:hidden flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <Link
                href="/"
                onClick={onClose}
                className="font-display text-xl font-bold tracking-wider"
              >
                SNEAKERS<span className="text-primary">FLASH</span>
              </Link>
              <button
                onClick={onClose}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={22} />
              </button>
            </div>

            {/* User section */}
            <div className="px-5 py-4 border-b border-border bg-brand-gray-800">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-display font-bold text-sm">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href="/login"
                    onClick={onClose}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-2 text-sm font-display uppercase tracking-wider"
                  >
                    <LogIn size={14} /> Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={onClose}
                    className="flex-1 flex items-center justify-center gap-2 border border-border text-foreground py-2 text-sm font-display uppercase tracking-wider hover:border-foreground transition-colors"
                  >
                    <UserPlus size={14} /> Register
                  </Link>
                </div>
              )}
            </div>

            {/* Nav items */}
            <nav className="flex-1 overflow-y-auto py-2">
              {navItems.map((item) => (
                <div key={item.label} className="border-b border-border/50">
                  {item.megaMenu ? (
                    <>
                      <button
                        onClick={() =>
                          setExpandedItem(
                            expandedItem === item.label ? null : item.label
                          )
                        }
                        className="flex items-center justify-between w-full px-5 py-3.5 text-sm font-display uppercase tracking-wider text-left hover:bg-brand-gray-800 transition-colors"
                      >
                        <span className={cn(item.isRed && "text-primary")}>
                          {item.label}
                        </span>
                        <ChevronDown
                          size={16}
                          className={cn(
                            "text-muted-foreground transition-transform duration-200",
                            expandedItem === item.label && "rotate-180"
                          )}
                        />
                      </button>

                      <AnimatePresence>
                        {expandedItem === item.label && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden bg-brand-gray-800"
                          >
                            {item.megaMenu.columns.map((col) => (
                              <div key={col.title} className="px-5 py-3">
                                <p className="label mb-2">{col.title}</p>
                                <ul className="space-y-1.5">
                                  {col.links.map((link) => (
                                    <li key={link.href}>
                                      <Link
                                        href={link.href}
                                        onClick={onClose}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors block py-0.5"
                                      >
                                        {link.label}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                            <div className="px-5 pb-3">
                              <Link
                                href={item.href}
                                onClick={onClose}
                                className="text-xs font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
                              >
                                View All {item.label} →
                              </Link>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center px-5 py-3.5 text-sm font-display uppercase tracking-wider hover:bg-brand-gray-800 transition-colors",
                        item.isRed ? "text-primary" : "text-foreground"
                      )}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* Bottom actions */}
            {isAuthenticated && (
              <div className="p-5 border-t border-border">
                <button
                  onClick={() => {
                    clearAuth();
                    onClose();
                  }}
                  className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors py-2 uppercase tracking-wider font-display"
                >
                  Sign Out
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
