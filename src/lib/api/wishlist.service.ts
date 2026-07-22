import apiClient from "./client";
import type {
  AddWishlistDto,
  WishlistQueryDto,
  WishlistListResponse,
  WishlistItem
} from "@/types/wishlist.types";

export const wishlistService = {
  // GET /wishlists?page=1&limit=20
  async findAll(params?: WishlistQueryDto): Promise<WishlistListResponse> {
    const { data } = await apiClient.get<WishlistListResponse>("/wishlists", { params });
    return data;
  },

  // POST /wishlists
  async add(dto: AddWishlistDto): Promise<{ data: WishlistItem }> {
    const { data } = await apiClient.post<{ data: WishlistItem }>("/wishlists", dto);
    return data;
  },

  // DELETE /wishlists/:id
  async remove(id: number | string): Promise<{ data: { id: number | string } }> {
    const { data } = await apiClient.delete<{ data: { id: number | string } }>(`/wishlists/${id}`);
    return data;
  },

  // DELETE /wishlists
  async clear(): Promise<{ data: { deletedCount: number } }> {
    const { data } = await apiClient.delete<{ data: { deletedCount: number } }>("/wishlists");
    return data;
  }
};