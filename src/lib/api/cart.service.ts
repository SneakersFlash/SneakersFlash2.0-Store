import apiClient from "./client";
import type { Cart, AddToCartDto, UpdateCartItemDto } from "@/types/cart.types";

export const cartService = {
  async getCart(): Promise<Cart> {
    const { data } = await apiClient.get<Cart>("/cart");
    return data;
  },

  async addItem(dto: AddToCartDto): Promise<Cart> {
    const { data } = await apiClient.post<Cart>("/cart/items", dto);
    return data;
  },

  async updateItem(itemId: string, dto: UpdateCartItemDto): Promise<Cart> {
    const { data } = await apiClient.patch<Cart>(`/cart/items/${itemId}`, dto);
    return data;
  },

  async removeItem(itemId: string): Promise<Cart> {
    const { data } = await apiClient.delete<Cart>(`/cart/items/${itemId}`);
    return data;
  },

  async clearCart(): Promise<void> {
    await apiClient.delete("/cart");
  },
};
