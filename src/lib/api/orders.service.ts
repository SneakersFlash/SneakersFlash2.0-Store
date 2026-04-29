import apiClient from "./client";
import type { CheckoutPayload, CheckoutResponse, TrackingResult } from "@/types/order.types";

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

  cancelOrder: async (id: string) => {
    const response = await apiClient.patch(`/orders/${id}/cancel`);
    return response.data;
  },

  async trackShipment(
    awb: string,
    courier: string,
    lastPhone?: string,
  ): Promise<TrackingResult> {
    const params: Record<string, string> = { courier };
    if (lastPhone) {
      params.last_phone = lastPhone.replace(/\D/g, '').slice(-5);
    }
    const { data } = await apiClient.get<TrackingResult>(`/logistics/track/${awb}`, { params });
    return data;
  },
};