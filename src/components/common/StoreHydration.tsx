"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/store/cartStore";

export function StoreHydration() {
  useEffect(() => {
    // rehydrate() bisa mengembalikan Promise, jadi flag-nya baru dinyalakan
    // setelah benar-benar selesai — bukan sekadar setelah dipanggil. Checkout
    // menggerbangi redirect-nya pada flag ini; menyalakannya terlalu dini
    // mengembalikan bug lama, di mana keranjang masih kosong saat diperiksa.
    void (async () => {
      try {
        await useCartStore.persist.rehydrate();
      } finally {
        // Tetap dinyalakan walau rehydrate gagal. Keranjang kosong lebih baik
        // daripada halaman checkout yang tertahan di loader selamanya.
        useCartStore.getState().setCartHydrated();
      }
    })();
  }, []);

  return null;
}
