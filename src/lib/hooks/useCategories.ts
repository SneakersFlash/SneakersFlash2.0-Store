import { useQuery } from "@tanstack/react-query";
import { categoriesService } from "@/lib/api/categories.service";

export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  detail: (slug: string) => [...categoryKeys.all, "detail", slug] as const,
};

/**
 * All categories — used in navbar, home page category grid.
 */
export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: categoriesService.getAll,
    staleTime: 1000 * 60 * 15, // 15 min — rarely changes
    gcTime: 1000 * 60 * 30,
  });
}

/**
 * Single category by slug.
 */
export function useCategory(slug: string) {
  return useQuery({
    queryKey: categoryKeys.detail(slug),
    queryFn: () => categoriesService.getBySlug(slug),
    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 10,
  });
}
