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
    buyNowVariantId?: string | number;
    buyNowQuantity?: number;
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

export interface TrackingManifest {
  manifest_code:        string;
  manifest_description: string;
  manifest_date:        string;
  manifest_time:        string;
  city_name:            string;
}
 
export interface TrackingResult {
  delivered: boolean;
  summary: {
    courier_code:   string;
    courier_name:   string;
    waybill_number: string;
    service_code:   string;
    waybill_date:   string;
    shipper_name:   string;
    receiver_name:  string;
    origin:         string;
    destination:    string;
    status:         string;
  };
  details:         any;
  delivery_status: {
    status:       string;
    pod_receiver: string;
    pod_date:     string;
    pod_time:     string;
  };
  manifest: TrackingManifest[]; // diurutkan terbaru di atas oleh backend
}