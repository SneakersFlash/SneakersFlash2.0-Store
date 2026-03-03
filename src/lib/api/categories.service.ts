import apiClient from "./client";
import type { Category } from "@/types/product.types";
import type { ProductListResponse } from "@/types/product.types";

export const categoriesService = {
  async getAll(): Promise<Category[]> {
    const { data } = await apiClient.get<Category[]>("/categories");
    return data;
  },

  async getBySlug(slug: string): Promise<Category> {
    const { data } = await apiClient.get<Category>(`/categories/${slug}`);
    return data;
  },

  async getProducts(
    slug: string,
    page = 1,
    limit = 20
  ): Promise<ProductListResponse> {
    const { data } = await apiClient.get<ProductListResponse>(
      `/categories/${slug}/products`,
      { params: { page, limit } }
    );
    return data;
  },
};
