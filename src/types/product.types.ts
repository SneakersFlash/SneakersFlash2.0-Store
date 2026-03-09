// ─── Product Types ────────────────────────────────────────────────────────────

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  description?: string;
  parentId?: string;
  children?: Category[];
  _count?: { products: number };
}

export interface ProductVariant {
  id: string;
  size: string;
  price: number;
  stock: number;
  sku: string;
  imageUrl: string[]
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  salePrice?: number;
  sku: string;
  isActive: boolean;
  isFeatured: boolean;
  brand: Brand;
  category: Category;
  images: ProductImage[];
  variants: ProductVariant[];
  ratingAvg?: string;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductFilters {
  categoryName?: string;
  brandName?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  sort?: ProductSortOption;
  page?: number;
  limit?: number;
  q?: string;
}

export type ProductSortOption =
  | "newest"
  | "price_asc"
  | "price_desc"
  | "popular"
  | "name_asc";