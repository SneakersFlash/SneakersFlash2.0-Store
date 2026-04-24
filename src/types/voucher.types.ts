export interface Voucher {
    id: number;
    code: string;
    discountAmount: number;
    minPurchase?: number;
    description?: string;
    validUntil?: string;
}

export type ClaimableVoucher = {
  id: string;
  name: string;
  code: string;
  discountType: "percentage" | "fixed_amount" | "free_shipping";
  discountValue: number;
  minPurchaseAmount: number;
  maxDiscountAmount: number | null;
  expiresAt: string;
  isClaimed: boolean; // true = sudah diklaim, tombol disabled di halaman voucher
};
 
export type AppliedVoucher = {
    code: string;
    name: string;
    discountType?: "percentage" | "fixed_amount" | "free_shipping";
    discountValue?: number;
    discountAmount?: number; 
};
