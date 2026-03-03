"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { X, ShoppingBag, Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore, selectCartItemCount, selectCartTotal } from "@/lib/store/cartStore";
import { formatPrice } from "@/lib/utils/formatPrice";
import { buildImageUrl } from "@/lib/utils/imageUrl";

export function CartSidebar() {
  const {
    items,
    isOpen,
    closeCart,
    removeItemOptimistic,
    updateQuantityOptimistic,
  } = useCartStore();

  const itemCount = useCartStore(selectCartItemCount);
  const total = useCartStore(selectCartTotal);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] bg-brand-gray-900 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} />
                <span className="font-display uppercase tracking-wider text-sm">
                  Your Cart
                </span>
                {itemCount > 0 && (
                  <span className="bg-primary text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                    {itemCount}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <EmptyCart onClose={closeCart} />
              ) : (
                <ul className="divide-y divide-border">
                  {items.map((item) => (
                    <li key={item.id} className="p-5">
                      <div className="flex gap-4">
                        {/* Image */}
                        <div className="relative w-20 h-20 shrink-0 bg-brand-gray-800 overflow-hidden">
                          <Image
                            src={buildImageUrl(item.product.images?.[0]?.url)}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/products/${item.product.slug}`}
                            onClick={closeCart}
                            className="text-sm font-medium line-clamp-2 hover:text-primary transition-colors"
                          >
                            {item.product.name}
                          </Link>
                          <p className="text-xs text-muted-foreground mt-1">
                            Size: {item.variant.size}
                          </p>
                          <div className="flex items-center justify-between mt-3">
                            {/* Quantity controls */}
                            <div className="flex items-center gap-0 border border-border">
                              <button
                                onClick={() =>
                                  updateQuantityOptimistic(
                                    item.id,
                                    item.quantity - 1
                                  )
                                }
                                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors hover:bg-brand-gray-800"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="px-3 text-sm font-medium min-w-[2rem] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantityOptimistic(
                                    item.id,
                                    item.quantity + 1
                                  )
                                }
                                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors hover:bg-brand-gray-800"
                              >
                                <Plus size={12} />
                              </button>
                            </div>

                            {/* Price */}
                            <span className="font-display font-bold text-sm">
                              {formatPrice(
                                (item.product.salePrice ?? item.product.price) *
                                  item.quantity
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeItemOptimistic(item.id)}
                          className="text-muted-foreground hover:text-primary transition-colors self-start"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground uppercase tracking-wider">
                    Subtotal
                  </span>
                  <span className="font-display text-xl font-bold">
                    {formatPrice(total)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Shipping calculated at checkout
                </p>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="block w-full bg-primary hover:bg-primary/90 text-white text-center py-4 font-display uppercase tracking-widest text-sm transition-colors"
                >
                  Checkout
                </Link>
                <button
                  onClick={closeCart}
                  className="block w-full text-center py-2 text-sm text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider font-display"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
      <div className="w-16 h-16 bg-brand-gray-800 flex items-center justify-center mb-4">
        <ShoppingBag size={28} className="text-muted-foreground" />
      </div>
      <h3 className="font-display text-lg uppercase tracking-wider mb-2">
        Your cart is empty
      </h3>
      <p className="text-sm text-muted-foreground mb-6">
        Looks like you haven't added anything yet.
      </p>
      <button
        onClick={onClose}
        className="bg-primary hover:bg-primary/90 text-white px-8 py-3 font-display uppercase tracking-widest text-sm transition-colors"
      >
        Start Shopping
      </button>
    </div>
  );
}
