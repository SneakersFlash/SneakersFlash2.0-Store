import apiClient from "./client";
import type { CheckoutPayload, CheckoutResponse } from "@/types/order.types";

export const ordersService = {
  // 1. Proses Checkout
  checkout: async (payload: CheckoutPayload): Promise<CheckoutResponse> => {
    const response = await apiClient.post('/orders/checkout', payload);
    return response.data;
  },

  // 2. Ambil Riwayat Pesanan
  getMyOrders: async () => {
    const response = await apiClient.get('/orders/my-orders');
    return response.data;
  },

  // 3. Detail Pesanan (opsional jika sudah ada)
  getOrderDetails: async (id: string) => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  }
};