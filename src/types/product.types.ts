// ─── Brand ────────────────────────────────────────────────────────────────────

export interface Brand {
  id: string;
  name: string;
  slug: string;
  isActive?: boolean;
  logoUrl?: string;
}

// ─── Category ─────────────────────────────────────────────────────────────────

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

// ─── Variant & Image ──────────────────────────────────────────────────────────

export interface ProductVariant {
  id: string;
  sku: string;
  size: string;
  price: number;
  stock: number;
  imageUrl: string[];
  isFlashSale?: boolean;
  specialPrice?: number;
  eventQuotaLimit?: number;
  eventQuotaSold?: number;
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  order: number;
}

// ─── Active Event ─────────────────────────────────────────────────────────────

export interface ActiveEvent {
  eventName: string | null;
  specialPrice: number | null;
  quotaLimit: number | null;
  quotaSold: number;
}

// ─── Product ──────────────────────────────────────────────────────────────────

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
  brandId?: string | null;
  categories: Category[];
  images: ProductImage[];
  variants: ProductVariant[];
  activeEvent: ActiveEvent | null;
  wishlists: any[];
  availableSizes?: string[];
  totalStock?: number;
  ratingAvg?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface Meta {
  total: number;
  page: number;
  limit: number;
  lastPage: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export interface ProductListResponse {
  data: Product[];
  meta: Meta;
}

// Alias — dipakai di productsService & useProducts
export type ProductsResponse = ProductListResponse;

// ─── Sort ─────────────────────────────────────────────────────────────────────

/**
 * Dari FilterModal → dikirim langsung ke BE sebagai ?priceSort=...
 */
export type PriceSort = "high-to-low" | "low-to-high";

/**
 * Dari Navbar links → dipetakan ke sortBy+sortOrder di productsService
 * sebelum dikirim ke BE.
 */
export type NavbarSort = "newest" | "price-asc" | "price-desc" | "name";

// ─── Filters ──────────────────────────────────────────────────────────────────

export interface ProductFilters {
  // ── Pagination ──────────────────────────────────────────────────────────────
  page?: number;
  limit?: number;

  // ── Search ──────────────────────────────────────────────────────────────────
  search?: string;

  // ── Category ────────────────────────────────────────────────────────────────
  // Dari Navbar      : ?category=shoes | running | lifestyle | apparel | ...
  // Dari FilterModal : ?category=new | deals
  // Dari subCategory tab : slug di-assign ke sini
  category?: string;

  // ── Brand ───────────────────────────────────────────────────────────────────
  // Dari FilterModal (multi) → brands[] → dikirim ke BE sebagai "Nike,Puma"
  brands?: string[];
  // Dari Navbar (single slug) → "nike" | "new-balance"
  brand?: string;

  // ── Gender (Navbar only) ────────────────────────────────────────────────────
  gender?: string;

  // ── Sort ────────────────────────────────────────────────────────────────────
  // Dari FilterModal
  priceSort?: PriceSort;
  // Fallback manual / hasil mapping Navbar ?sort=newest
  sortBy?: "createdAt" | "price" | "name";
  sortOrder?: "asc" | "desc";

  // ── Reserved (BE belum implement) ───────────────────────────────────────────
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  excludeCategories?: string;
}