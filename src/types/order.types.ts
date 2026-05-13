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
// Format disesuaikan dengan response /v3/stt/track Lion Parcel
export interface LionParcelTrackingEvent {
  date:        string;
  time:        string;
  status:      string;
  description: string;
  location:    string;
}

export interface LionParcelTrackingResult {
  provider:       'LION_PARCEL';
  stt_number:     string;
  status:         string;           // e.g. "ON PROCESS", "DELIVERED"
  delivered:      boolean;
  origin:         string;
  destination:    string;
  service:        string;
  shipper_name:   string;
  receiver_name:  string;
  weight:         number;
  events:         LionParcelTrackingEvent[];
}

export type AnyTrackingResult = TrackingResult | LionParcelTrackingResult;