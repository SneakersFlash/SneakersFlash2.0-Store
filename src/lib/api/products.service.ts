import apiClient from "./client";
import type {
  Product,
  ProductsResponse,
  ProductFilters,
} from "@/types/product.types";

export const productsService = {
  async getProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
    const { data } = await apiClient.get<ProductsResponse>("/products", {
      params: {
        // ── Pagination ─────────────────────────────────────────────────────────
        page:  filters.page  ?? 1,
        limit: filters.limit ?? 12,

        // ── Search ─────────────────────────────────────────────────────────────
        ...(filters.search && { search: filters.search }),

        // ── Category ───────────────────────────────────────────────────────────
        // "new" | "deals" dari FilterModal, atau nama kategori dari Navbar/tab
        ...(filters.category && { category: filters.category }),

        // ── Categories (multi OR) ──────────────────────────────────────────────
        ...(filters.categories?.length && { categories: filters.categories.join(',') }),

        // ── Daftar kode artikel pilihan tangan (home page) ─────────────────────
        // Urutan array dipertahankan backend sebagai urutan tayang.
        ...(filters.skus?.length && { skus: filters.skus.join(',') }),


        // ── Brand ──────────────────────────────────────────────────────────────
        // Multi (FilterModal): brands[] → join jadi "Nike,Puma"
        ...(filters.brands?.length && { brands: filters.brands.join(",") }),
        // Single (Navbar): slug langsung — hanya jika brands tidak ada
        ...(!filters.brands?.length && filters.brand && { brand: filters.brand }),

        // ── Gender (Navbar) ────────────────────────────────────────────────────
        ...(filters.gender && { gender: filters.gender }),

        // ── Product Type facet (AND) — mis. "Footwear" untuk highlight sepatu ──
        ...(filters.type && { type: filters.type }),

        // ── Kurasi home page ───────────────────────────────────────────────────
        // Backend mendahulukan model hype (NB 2002R, Samba, Dunk, dst) daripada
        // sekadar produk hasil sync terbaru.
        ...(filters.curated && { curated: true }),

        // ── Sort ───────────────────────────────────────────────────────────────
        ...(filters.priceSort && { priceSort: filters.priceSort }),
        ...(filters.sortBy    && { sortBy:    filters.sortBy    }),
        ...(filters.sortOrder && { sortOrder: filters.sortOrder }),

        // ── Reserved ───────────────────────────────────────────────────────────
        ...(filters.minPrice          && { minPrice:          filters.minPrice          }),
        ...(filters.maxPrice          && { maxPrice:          filters.maxPrice          }),
        ...(filters.sizes?.length     && { sizes:             filters.sizes.join(",")   }),
        ...(filters.excludeCategories && { excludeCategories: filters.excludeCategories }),
      },
    });
    return data;
  },

  async getProduct(slug: string): Promise<Product> {
    const { data } = await apiClient.get<Product>(`/products/slug/${slug}`);
    return data;
  },

  async getFeatured(limit = 8): Promise<ProductsResponse> {
    const { data } = await apiClient.get<ProductsResponse>("/products", {
      params: { sortBy: "createdAt", sortOrder: "desc", limit },
    });
    return data;
  },

  async search(query: string, limit = 8): Promise<ProductsResponse> {
    const { data } = await apiClient.get<ProductsResponse>("/products", {
      params: { search: query, limit },
    });
    return data;
  },

  async getSitemapSlugs(): Promise<{ slug: string; updatedAt: string }[]> {
    const { data } = await apiClient.get<{ slug: string; updatedAt: string }[]>(
      "/products/sitemap"
    );
    return data;
  },
};  