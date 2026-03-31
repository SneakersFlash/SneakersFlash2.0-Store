export interface Voucher {
    id: number;
    code: string;
    discountAmount: number;
    minPurchase?: number;
    description?: string;
    validUntil?: string;
}

export interface AppliedVoucher {
    code: string;
    discountAmount: number;
}