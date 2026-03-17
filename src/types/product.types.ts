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
  weightGrams?: number;
  sku: string;
  isActive: boolean;
  isFeatured: boolean;
  brand: Brand;
  categories: Category[];
  images: ProductImage[];
  variants: ProductVariant[];
  ratingAvg?: string;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Meta {
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}
export interface ProductListResponse {
  data: Product[];
  meta: Meta
}

export interface ProductFilters {
  categoryName?: string;
  category?: string;
  brandName?: string;
  subCategory?: string;
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