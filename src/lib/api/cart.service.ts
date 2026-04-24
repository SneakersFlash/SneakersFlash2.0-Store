import apiClient from "./client";
import type { Cart, AddToCartDto, UpdateCartItemDto } from "@/types/cart.types";
import type { AppliedVoucher, ClaimableVoucher } from "@/types/voucher.types";

export const cartService = {
  async getCart(): Promise<Cart> {
    const { data } = await apiClient.get<Cart>("/cart");
    return data;
  },

  async addItem(dto: AddToCartDto): Promise<Cart> {
    const { data } = await apiClient.post<Cart>("/cart", dto);
    return data;
  },

  async updateItem(itemId: string, dto: UpdateCartItemDto): Promise<Cart> {
    const { data } = await apiClient.patch<Cart>(`/cart/item/${itemId}`, dto);
    return data;
  },

  async removeItem(itemId: string): Promise<Cart> {
    const { data } = await apiClient.delete<Cart>(`/cart/item/${itemId}`);
    return data;
  },

  async clearCart(): Promise<void> {
    await apiClient.delete("/cart");
  },

  // ── Voucher ──────────────────────────────────────────────────────────────────

  /** Ambil semua voucher yang bisa diklaim/dipakai user (sudah diklaim tetap muncul, isClaimed=true) */
  async getClaimableVouchers(): Promise<ClaimableVoucher[]> {
    const { data } = await apiClient.get<ClaimableVoucher[]>("/vouchers/claimable");
    return data;
  },

  /**
   * Hitung diskon dari data voucher secara lokal — tidak perlu round-trip ke backend.
   * Backend tetap memvalidasi saat order dibuat, ini hanya untuk tampilan UI.
   */
  computeDiscount(voucher: ClaimableVoucher, subtotal: number): number {
    if (subtotal < voucher.minPurchaseAmount) return 0;

    if (voucher.discountType === "fixed_amount") {
      return voucher.discountValue;
    }

    if (voucher.discountType === "percentage") {
      const raw = (subtotal * voucher.discountValue) / 100;
      return voucher.maxDiscountAmount ? Math.min(raw, voucher.maxDiscountAmount) : raw;
    }

    // free_shipping — diskon ongkir, nilainya 0 di subtotal (ditangani backend)
    return 0;
  },

  /** Simpan applied voucher ke localStorage agar bisa dibaca di halaman checkout */
  saveAppliedVoucher(voucher: AppliedVoucher | null): void {
    if (voucher) {
      localStorage.setItem("appliedVoucher", JSON.stringify(voucher));
    } else {
      localStorage.removeItem("appliedVoucher");
    }
  },

  /** Baca applied voucher dari localStorage */
  loadAppliedVoucher(): AppliedVoucher | null {
    try {
      const raw = localStorage.getItem("appliedVoucher");
      return raw ? (JSON.parse(raw) as AppliedVoucher) : null;
    } catch {
      return null;
    }
  },
};