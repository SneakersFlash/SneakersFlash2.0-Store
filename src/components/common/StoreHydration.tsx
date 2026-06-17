"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/store/cartStore";

export function StoreHydration() {
  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);

  return null;
}
