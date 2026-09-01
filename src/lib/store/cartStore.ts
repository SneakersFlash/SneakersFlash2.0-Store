"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { cartService } from "@/lib/api/cart.service";
import type { CartItem } from "@/types/cart.types";

interface CartStore {
  items: CartItem[];
  selectedItemIds: string[];
  isOpen: boolean;
  isLoading: boolean;
  /**
   * Menyala setelah StoreHydration selesai membaca localStorage.
   *
   * Store ini memakai `skipHydration: true`, jadi render pertama selalu melihat
   * items & selectedItemIds kosong — bukan karena keranjangnya kosong, tapi
   * karena isinya belum dibaca. Halaman yang mengambil keputusan navigasi dari
   * isi keranjang (checkout) harus menunggu flag ini dulu. Sengaja tidak ikut
   * di-persist supaya selalu mulai dari false tiap kali halaman dimuat.
   */
  isHydrated: boolean;
  setCartHydrated: () => void;

  // UI Actions
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Selection Actions (Checkbox)
  setSelectedItemIds: (ids: any[]) => void; // <--- TAMBAHKAN BARIS INI
  toggleSelectItem: (itemId: string) => void;
  selectAll: () => void;
  deselectAll: () => void;

  // API Actions
  fetchCart: () => Promise<void>;
  addItemToCart: (variantId: number, quantity: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      selectedItemIds: [],
      isOpen: false,
      isLoading: false,
      isHydrated: false,

      setCartHydrated: () => set({ isHydrated: true }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      // --- LOGIKA CHECKBOX ---
      setSelectedItemIds: (ids: any) => set({ selectedItemIds: ids }),
      toggleSelectItem: (itemId) => {
        const { selectedItemIds } = get();
        if (selectedItemIds.includes(itemId)) {
          set({ selectedItemIds: selectedItemIds.filter((id) => id !== itemId) });
        } else {
          set({ selectedItemIds: [...selectedItemIds, itemId] });
        }
      },
      selectAll: () => set({ selectedItemIds: get().items.map((i) => i.id) }),
      deselectAll: () => set({ selectedItemIds: [] }),

      // --- LOGIKA API ---
      fetchCart: async () => {
        set({ isLoading: true });
        try {
          const cartData = await cartService.getCart();
          // Sesuai JSON backend, array barang ada di cartData.items
          set({ items: cartData.items || [] }); 
        } catch (error) {
          console.error("Gagal fetch cart:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      addItemToCart: async (variantId, quantity) => {
        set({ isLoading: true });
        try {
          await cartService.addItem({ productVariantId: variantId, quantity });
          await get().fetchCart(); // Refresh data keranjang
        } catch (error) {
          console.error("Gagal tambah keranjang:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      updateQuantity: async (itemId, quantity) => {
        if (quantity <= 0) return get().removeItem(itemId);
        
        // Optimistic Update UI
        set((s) => ({
          items: s.items.map((i) => 
            i.id === itemId ? { ...i, quantity, subtotal: i.price * quantity } : i
          ),
        }));

        try {
          await cartService.updateItem(itemId, { quantity });
        } catch (error) {
          await get().fetchCart(); // Rollback jika API gagal
        }
      },

      removeItem: async (itemId) => {
        set((s) => ({
          selectedItemIds: s.selectedItemIds.filter((id) => id !== itemId),
          items: s.items.filter((i) => i.id !== itemId),
        }));

        try {
          await cartService.removeItem(itemId);
        } catch (error) {
          await get().fetchCart(); 
        }
      },
    }),
    {
      name: "sf-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items, selectedItemIds: state.selectedItemIds }),
      skipHydration: true,
    }
  )
);