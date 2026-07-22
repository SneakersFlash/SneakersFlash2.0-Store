import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { wishlistService } from "@/lib/api/wishlist.service";
import { useAuthStore } from "@/lib/store/authStore";
import type {
  AddWishlistDto,
  WishlistQueryDto,
  CheckWishlistResponse,
} from "@/types/wishlist.types";

// Backend nge-cap limit wishlist di 100 item per halaman (wishlist.service.ts).
const STATUS_MAP_LIMIT = 100;

export const wishlistKeys = {
  all: ["wishlists"] as const,
  list: (params: WishlistQueryDto) => [...wishlistKeys.all, "list", params] as const,
  check: (productId: number) => [...wishlistKeys.all, "check", productId] as const,
  statusMap: () => [...wishlistKeys.all, "status-map"] as const,
};

// ── Queries ──

export function useWishlists(params: WishlistQueryDto = {}) {
  return useQuery({
    queryKey: wishlistKeys.list(params),
    queryFn: () => wishlistService.findAll(params),
  });
}

// Satu query dipakai bareng semua kartu produk di halaman — React Query nge-dedupe
// lewat queryKey, jadi 20 kartu tetap cuma 1 request. Sebelumnya tiap kartu nembak
// /wishlists/check/:id sendiri-sendiri, dan buat visitor yang belum login semuanya
// balik 401 sampai kena rate limit nginx.
function useWishlistStatusMap() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: wishlistKeys.statusMap(),
    queryFn: async () => {
      const res = await wishlistService.findAll({ page: 1, limit: STATUS_MAP_LIMIT });

      const map = new Map<number, number>();
      for (const item of res.data) {
        // Semua id di backend BigInt, jadi kekirim sebagai string di JSON.
        const productId = Number(item.product?.id);
        const wishlistId = Number(item.id);
        if (Number.isFinite(productId) && Number.isFinite(wishlistId)) {
          map.set(productId, wishlistId);
        }
      }
      return map;
    },
    enabled: isAuthenticated, // Jangan pernah nembak API kalau belum login
  });
}

export function useCheckWishlist(productId: number) {
  const { data: statusMap, isLoading } = useWishlistStatusMap();

  const wishlistId = statusMap?.get(Number(productId)) ?? null;
  const data: CheckWishlistResponse = { wishlisted: wishlistId !== null, wishlistId };

  return { data, isLoading };
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