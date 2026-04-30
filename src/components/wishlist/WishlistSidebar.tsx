"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Trash2 } from "lucide-react";
import PageLoader from "@/components/common/PageLoader";
import Link from "next/link";
import Image from "next/image";
import { useWishlists, useRemoveWishlist } from "@/lib/hooks/useWishlist"; // Sesuaikan path jika berbeda
import { formatPrice } from "@/lib/utils/formatPrice"; // Asumsi Anda punya utilitas ini

interface WishlistSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WishlistSidebar({ isOpen, onClose }: WishlistSidebarProps) {
  const { data, isLoading } = useWishlists();
  const { mutate: removeWishlist, isPending: isRemoving } = useRemoveWishlist();

  const wishlistItems: any = data?.data || data || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />

          {/* Sidebar Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-card border-l border-border z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl font-bold uppercase tracking-wide">
                  My Wishlist
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-none">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <PageLoader />
                </div>
              ) :wishlistItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-2">
                    <Heart className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-lg">Wishlist Anda kosong</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Simpan barang-barang favorit Anda di sini untuk dibeli nanti.
                  </p>
                  <button
                    onClick={onClose}
                    className="btn-primary w-full max-w-[200px]"
                  >
                    Mulai Belanja
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {wishlistItems.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-3 bg-background border border-border rounded-lg group hover:border-primary transition-colors"
                    >
                      {/* Asumsi item memiliki relasi ke product */}
                      <div className="relative w-20 h-20 bg-muted rounded-md overflow-hidden flex-shrink-0">
                        {item.product?.variants?.[0].imageUrl ? (
                          <Image
                            src={item.product.variants?.[0].imageUrl[0]}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No Image</div>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <Link 
                            href={`/products/${item.product?.slug}`}
                            onClick={onClose}
                            className="font-semibold line-clamp-1 hover:text-primary transition-colors"
                          >
                            {item.product?.name}
                          </Link>
                          <p className="text-sm text-muted-foreground mt-1">
                            {formatPrice(item.product?.variants?.[0].price.d[0] || 0)}
                          </p>
                        </div>
                        
                        <div className="flex justify-end mt-2">
                          <button
                            onClick={() => removeWishlist({ id: item.id, productId: item.product?.id })}
                            disabled={isRemoving}
                            className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                            title="Hapus dari wishlist"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}