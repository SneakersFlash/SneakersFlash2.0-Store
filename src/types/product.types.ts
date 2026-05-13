// ─── Sort ─────────────────────────────────────────────────────────────────────

/** Dari FilterModal → langsung ke BE */
export type PriceSort = "high-to-low" | "low-to-high";

/** Dari Navbar ?sort=newest (dipetakan ke sortBy+sortOrder di productsService) */
export type NavbarSort = "newest" | "price-asc" | "price-desc" | "name";

// ─── Filters ──────────────────────────────────────────────────────────────────

export interface ProductFilters {
  // ── Pagination ──────────────────────────────────────────────────────────────
  page?:  number;
  limit?: number;

  // ── Search ──────────────────────────────────────────────────────────────────
  search?: string;

  // ── Category ────────────────────────────────────────────────────────────────
  // Dari Navbar      : ?category=shoes | running | lifestyle | apparel | ...
  // Dari FilterModal : ?category=new | deals
  // Dari subCategory tab di ProductListingClient → di-assign ke sini
  category?: string;

  // ── Brand ───────────────────────────────────────────────────────────────────
  // Dari FilterModal (multi) → dikirim ke BE sebagai comma-separated "Nike,Puma"
  brands?: string[];
  // Dari Navbar (single slug) → "nike" | "new-balance"
  brand?: string;

  // ── Gender (Navbar only) ────────────────────────────────────────────────────
  // ?gender=men | women | kids | unisex
  gender?: string;

  // ── Sort ────────────────────────────────────────────────────────────────────
  // Dari FilterModal langsung
  priceSort?: PriceSort;
  // Fallback manual / hasil mapping dari Navbar ?sort=newest
  sortBy?:    "createdAt" | "price" | "name";
  sortOrder?: "asc" | "desc";

  // ── Reserved (BE belum implement, tapi field tetap dipertahankan) ───────────
  minPrice?:          number;
  maxPrice?:          number;
  sizes?:             string[];
  excludeCategories?: string;
}

// ─── Response ─────────────────────────────────────────────────────────────────

export interface ProductMeta {
  total:       number;
  page:        number;
  limit:       number;
  lastPage:    number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ProductVariant {
  id:       string;
  sku:      string;
  price:    number;
  stock:    number;
  imageUrl: string[];
  size?:    string;
}

export interface ActiveEvent {
  eventName:    string | null;
  specialPrice: number | null;
  quotaLimit:   number | null;
  quotaSold:    number;
}

export interface Product {
  id:             string;
  name:           string;
  slug:           string;
  basePrice:      number;
  weightGrams:    number;
  brandId:        string | null;
  brand?:         { id: string; name: string };
  categories:     { id: string; name: string; slug: string }[];
  availableSizes: string[];
  totalStock:     number;
  activeEvent:    ActiveEvent | null;
  variants:       ProductVariant[];
}

export interface ProductsResponse {
  data: Product[];
  meta: ProductMeta;
}