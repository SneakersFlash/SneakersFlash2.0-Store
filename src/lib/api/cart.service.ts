import apiClient from "./client";
import type { Cart, AddToCartDto, UpdateCartItemDto } from "@/types/cart.types";

export const cartService = {
  async getCart(): Promise<Cart> {
    const { data } = await apiClient.get<Cart>("/cart");
    return data;
  },

  // Ubah dari "/cart/items" menjadi "/cart" sesuai controller backend
  async addItem(dto: AddToCartDto): Promise<Cart> {
    const { data } = await apiClient.post<Cart>("/cart", dto);
    return data;
  },

  // Ubah "/cart/items/:id" menjadi "/cart/item/:id"
  async updateItem(itemId: string, dto: UpdateCartItemDto): Promise<Cart> {
    const { data } = await apiClient.patch<Cart>(`/cart/item/${itemId}`, dto);
    return data;
  },

  // Ubah "/cart/items/:id" menjadi "/cart/item/:id"
  async removeItem(itemId: string): Promise<Cart> {
    const { data } = await apiClient.delete<Cart>(`/cart/item/${itemId}`);
    return data;
  },

  // Ini opsional, karena di backend belum ada @Delete() untuk hapus semua
  async clearCart(): Promise<void> {
    await apiClient.delete("/cart"); 
  },
};