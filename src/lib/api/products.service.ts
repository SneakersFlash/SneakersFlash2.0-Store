import apiClient from "./client";
import type {
  Product,
  ProductListResponse,
  ProductFilters,
} from "@/types/product.types";

export const productsService = {
  async getProducts(filters: ProductFilters = {}): Promise<ProductListResponse> {
    const { data } = await apiClient.get<ProductListResponse>("/products", {
      params: {
        page: filters.page ?? 1,
        limit: filters.limit ?? 20,
        ...(filters.categorySlug && { category: filters.categorySlug }),
        ...(filters.brandId && { brand: filters.brandId }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        ...(filters.sizes?.length && { sizes: filters.sizes.join(",") }),
        ...(filters.sort && { sort: filters.sort }),
        ...(filters.q && { q: filters.q }),
      },
    });
    return data;
  },

  async getProduct(slug: string): Promise<Product> {
    const { data } = await apiClient.get<Product>(`/products/${slug}`);
    return data;
  },

  async getFeatured(limit = 8): Promise<Product[]> {
    const { data } = await apiClient.get<Product[]>("/products/featured", {
      params: { limit },
    });
    return data;
  },

  async search(query: string, limit = 10): Promise<Product[]> {
    const { data } = await apiClient.get<Product[]>("/products/search", {
      params: { q: query, limit },
    });
    return data;
  },
};
