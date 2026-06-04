import apiClient from "./client";
import type {
  CheckoutPayload,
  CheckoutResponse,
  TrackingResult,
  LionParcelTrackingResult,
  ShippingProvider,
} from "@/types/order.types";
 
export const ordersService = {
  checkout: async (payload: CheckoutPayload): Promise<CheckoutResponse> => {
    const response = await apiClient.post('/orders/checkout', payload);
    return response.data;
  },
 
  getMyOrders: async () => {
    const response = await apiClient.get('/orders/my-orders');
    return response.data;
  },
 
  getOrderDetails: async (id: string) => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },
 
  cancelOrder: async (id: string, reason?: string) => {
    const response = await apiClient.patch(`/orders/${id}/cancel`, { reason });
    return response.data;
  },
 
  async trackShipment(awb: string, courier: string, lastPhone?: string): Promise<TrackingResult> {
    const params: Record<string, string> = { courier };
    if (lastPhone) params.last_phone = lastPhone.replace(/\D/g, '').slice(-5);
    const { data } = await apiClient.get<TrackingResult>(`/logistics/track/${awb}`, { params });
    return data;
  },
 
  async trackLionParcelShipment(stt: string): Promise<LionParcelTrackingResult> {
    const { data } = await apiClient.get<LionParcelTrackingResult>(`/logistics/track-lion/${stt}`);
    return data;
  },
 
  async trackAny(params: {
    awb: string;
    courier: string;
    shippingProvider?: ShippingProvider;
    lastPhone?: string;
  }) {
    const { awb, courier, lastPhone } = params;
    // LION_PARCEL disabled — backend belum siap, pakai Raja Ongkir dulu
    // if (shippingProvider === 'LION_PARCEL') return this.trackLionParcelShipment(awb);
    return this.trackShipment(awb, courier, lastPhone);
  },
};