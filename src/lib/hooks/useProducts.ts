import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { productsService } from "@/lib/api/products.service";
import type { ProductFilters } from "@/types/product.types";

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters: ProductFilters) => [...productKeys.lists(), filters] as const,
  featured: (limit?: number) => [...productKeys.all, "featured", limit] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (slug: string) => [...productKeys.details(), slug] as const,
  search: (q: string) => [...productKeys.all, "search", q] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Paginated product list with filters.
 */
export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => productsService.getProducts(filters),
    placeholderData: (prev) => prev, // keep previous data while loading
    staleTime: 1000 * 60 * 3, // 3 min
  });
}

/**
 * Infinite scroll version — used for "load more" UX.
 */
export function useInfiniteProducts(filters: Omit<ProductFilters, "page"> = {}) {
  return useInfiniteQuery({
    queryKey: [...productKeys.lists(), "infinite", filters],
    queryFn: ({ pageParam = 1 }) =>
      productsService.getProducts({ ...filters, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const hasMore = lastPage.page < lastPage.totalPages;
      return hasMore ? lastPage.page + 1 : undefined;
    },
    staleTime: 1000 * 60 * 3,
  });
}

/**
 * Featured products for home page.
 */
export function useFeaturedProducts(limit = 8) {
  return useQuery({
    queryKey: productKeys.featured(limit),
    queryFn: () => productsService.getFeatured(limit),
    staleTime: 1000 * 60 * 10, // 10 min — changes less often
  });
}

/**
 * Single product by slug — for detail page.
 */
export function useProduct(slug: string) {
  return useQuery({
    queryKey: productKeys.detail(slug),
    queryFn: () => productsService.getProduct(slug),
    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Search — enabled only when query length > 1.
 */
export function useProductSearch(query: string, limit = 8) {
  return useQuery({
    queryKey: productKeys.search(query),
    queryFn: () => productsService.search(query, limit),
    enabled: query.trim().length > 1,
    staleTime: 1000 * 30,
  });
}
