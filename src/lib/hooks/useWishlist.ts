import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { wishlistService } from "@/lib/api/wishlist.service";
import type { AddWishlistDto, WishlistQueryDto } from "@/types/wishlist.types";

export const wishlistKeys = {
  all: ["wishlists"] as const,
  list: (params: WishlistQueryDto) => [...wishlistKeys.all, "list", params] as const,
  check: (productId: number) => [...wishlistKeys.all, "check", productId] as const,
};

// ── Queries ──

export function useWishlists(params: WishlistQueryDto = {}) {
  return useQuery({
    queryKey: wishlistKeys.list(params),
    queryFn: () => wishlistService.findAll(params),
  });
}

export function useCheckWishlist(productId: number, variantId?: number) {
  return useQuery({
    queryKey: wishlistKeys.check(productId),
    queryFn: () => wishlistService.check(productId, variantId),
    enabled: !!productId, // Hanya fetch jika productId ada
  });
}

// ── Mutations ──

export function useAddWishlist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (dto: AddWishlistDto) => wishlistService.add(dto),
    onSuccess: (_, variables) => {
      // Refresh status check untuk produk ini dan refresh daftar wishlist
      queryClient.invalidateQueries({ queryKey: wishlistKeys.check(variables.productId) });
      queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
    },
  });
}

export function useRemoveWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    // Butuh productId di lempar saat mutate hanya untuk invalidate cache UI nya
    mutationFn: ({ id }: { id: number | string, productId: number }) => wishlistService.remove(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: wishlistKeys.check(variables.productId) });
      queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
    },
  });
}

export function useClearWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => wishlistService.clear(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
    },
  });
}