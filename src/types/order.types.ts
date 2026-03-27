export interface CheckoutAddress {
    recipientName: string;
    phone: string;
    addressLine: string;
    subdistrictId: number | null;
    city: string;
    postalCode: string;
}

export interface CheckoutCourier {
    name: string;
    service: string;
    cost: number;
}

// Payload untuk POST /orders/checkout
export interface CheckoutPayload {
    cartItemIds: string[]; // Array ID barang di keranjang
    address: CheckoutAddress;
    courier: CheckoutCourier;
    paymentMethod: string;
    voucherCode?: string;
}

// Response dari POST /orders/checkout
export interface CheckoutResponse {
    id: string;
    userId: string;
    orderNumber: string;
    status: string;
    finalAmount: number;
    snapToken: string | null;
    discountTotal: number;
}