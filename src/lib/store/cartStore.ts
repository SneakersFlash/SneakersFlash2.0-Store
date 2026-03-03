"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem, AddToCartDto } from "@/types/cart.types";
import type { Product, ProductVariant } from "@/types/product.types";

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  lastAdded: string | null; // productId of last added item (for animation)

  // Computed
  totalItems: number;
  totalPrice: number;

  // UI
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Data actions (called after API success)
  setItems: (items: CartItem[]) => void;
  addItemOptimistic: (product: Product, variant: ProductVariant, quantity: number) => void;
  removeItemOptimistic: (itemId: string) => void;
  updateQuantityOptimistic: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  setLoading: (loading: boolean) => void;
  setLastAdded: (productId: string | null) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isLoading: false,
      lastAdded: null,

      get totalItems() {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
      get totalPrice() {
        return get().items.reduce(
          (sum, item) =>
            sum +
            (item.product.salePrice ?? item.product.price) * item.quantity,
          0
        );
      },

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      setItems: (items) => set({ items }),

      addItemOptimistic: (product, variant, quantity) => {
        const existing = get().items.find(
          (i) => i.productId === product.id && i.variantId === variant.id
        );
        if (existing) {
          set((s) => ({
            items: s.items.map((i) =>
              i.id === existing.id
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
          }));
        } else {
          const tempItem: CartItem = {
            id: `temp_${Date.now()}`,
            productId: product.id,
            variantId: variant.id,
            quantity,
            product,
            variant,
          };
          set((s) => ({ items: [...s.items, tempItem] }));
        }
        set({ lastAdded: product.id });
      },

      removeItemOptimistic: (itemId) => {
        set((s) => ({ items: s.items.filter((i) => i.id !== itemId) }));
      },

      updateQuantityOptimistic: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItemOptimistic(itemId);
          return;
        }
        set((s) => ({
          items: s.items.map((i) =>
            i.id === itemId ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
      setLoading: (loading) => set({ isLoading: loading }),
      setLastAdded: (productId) => set({ lastAdded: productId }),
    }),
    {
      name: "sf-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectCartItemCount = (state: CartStore) =>
  state.items.reduce((sum, item) => sum + item.quantity, 0);

export const selectCartTotal = (state: CartStore) =>
  state.items.reduce(
    (sum, item) =>
      sum + (item.product.salePrice ?? item.product.price) * item.quantity,
    0
  );
