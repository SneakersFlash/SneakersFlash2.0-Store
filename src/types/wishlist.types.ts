import type { Product } from "./product.types";

export interface AddWishlistDto {
  productId: number;
  productVariantId?: number;
}

export interface WishlistQueryDto {
  page?: number;
  limit?: number;
}

// Menyesuaikan bentuk response "productSelect" dan "variantSelect" dari backend
export interface WishlistItem {
  id: number | string;
  createdAt: string;
  product: Partial<Product>; 
  variant?: any; // Bisa disesuaikan dengan interface Variant Anda
}

export interface WishlistListResponse {
  data: WishlistItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CheckWishlistResponse {
  wishlisted: boolean;
  wishlistId: number | null;
}