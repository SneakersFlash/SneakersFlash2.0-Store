export interface CheckoutAddress {
    recipientName: string;
    phone: string;
    addressLine: string;
    subdistrictId: number | null;
    city: string;
    postalCode: string;
    district?: string;   // [TAMBAH] nama kecamatan, untuk Lion Parcel
    latitude?: number;
    longitude?: number;
}

export interface CheckoutCourier {
    name: string;
    service: string;
    cost: number;
    cashback?: number;   // [BARU] dipakai untuk shippingCashback di backend
}

// Payload untuk POST /orders/checkout
export interface CheckoutPayload {
    cartItemIds: string[];
    address: CheckoutAddress;
    courier: CheckoutCourier;
    paymentMethod: string;
    voucherCode?: string;
    buyNowVariantId?: string | number;
    buyNowQuantity?: number;
    usePoints?: boolean;
    pointsToRedeem?: number;
}

// Response dari POST /orders/checkout
export interface CheckoutResponse {
  id:            string;
  orderNumber:   string;
  status:        string;
  finalAmount:   number;
  discountTotal: number;
  pointsRedeemed:number;
  paymentMethod: string;
  vaNumber:      string | null;  // BNI/BRI/Permata VA, atau "billerCode|billKey" utk Mandiri
  qrCodeUrl:     string | null;  // QRIS & GoPay desktop
  deeplinkUrl:   string | null;  // GoPay mobile, ShopeePay, Akulaku, credit_card 3DS
  expireTime:    string | null;
}

// ─── Shipping Provider ─────────────────────────────────────────────────────────
// [BARU] Tipe untuk membedakan provider pengiriman
export type ShippingProvider = 'LION_PARCEL' | 'KOMERCE' | null;

// ─── Tracking ─────────────────────────────────────────────────────────────────

export interface TrackingManifest {
  manifest_code:        string;
  manifest_description: string;
  manifest_date:        string;
  manifest_time:        string;
  city_name:            string;
}

// Tracking via RajaOngkir (Komerce — untuk kurir instant/same day)
export interface TrackingResult {
  delivered: boolean;
  trackingPending?: boolean;
  message?: string;
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
  manifest: TrackingManifest[];
}

// [BARU] Tracking via Lion Parcel (untuk kurir reguler)
// Shape disesuaikan dengan response backend /logistics/track-lion/:stt
export interface LionParcelHistoryItem {
  row:              number;
  datetime:         string;   // ISO: "2026-05-08T11:28:54+07:00"
  status_code:      string;   // "BKD", "DLV", "POD", dll
  current_status:   string;
  location:         string;   // kode kota: "CGK"
  city:             string;   // nama kota: "JAKARTA"
  remarks:          string;
  stt_journey_type: string;
  proof?: {
    name:     string;
    relation: string;
  };
}

export interface LionParcelTrackingResult {
  provider:       'LION_PARCEL';
  stt_no:         string;          // "99LP1778214534665"
  sender_name:    string;
  recipient_name: string;
  origin:         string;          // "KEBON JERUK, JAKARTA BARAT"
  destination:    string;
  current_status: string;          // "BKD", "DLV", dll
  status_code:    string;
  product_type:   string;          // "REGPACK", "JAGOPACK", dll
  gross_weight:   number;
  history:        LionParcelHistoryItem[];
}

export type AnyTrackingResult = TrackingResult | LionParcelTrackingResult;

// ─── Order entity (response dari GET /orders/:id) ──────────────────────────────

export interface Order {
  id:             string;
  orderNumber:    string;
  status:         string;
  paymentMethod:  string;
  finalAmount?:   number;
  total?:         number;
  subtotal:       number;
  shippingCost:   number;
  discountAmount: number;
  createdAt:      string;
  paidAt?:        string | null;

  // ─── Shipping provider fields ────────────────────────────────────────────
  komerceOrderId?:    string | null;
  lionParcelSttId?:   string | null;
  shippingProvider?:  ShippingProvider;
  awb?:               string | null;
  trackingNumber?:    string | null;
  pointsRedeemed?:    number;

  courierName?:    string;
  courierService?: string;
  courier?: {
    name:           string;
    service:        string;
    cost:           number;
    trackingNumber?: string;
  };
  address?: {
    recipientName: string;
    phone:         string;
    street?:       string;
    city:          string;
    province?:     string;
    postalCode:    string;
  };
  user?: {
    name:   string;
    email:  string;
    phone?: string;
  } | null;
  items?: Array<{
    id:          string;
    productName: string;
    quantity:    number;
    unitPrice:   number;
    subtotal:    number;
    imageUrl?:   string | string[] | null;
  }>;
}
