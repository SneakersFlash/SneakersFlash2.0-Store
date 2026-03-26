// src/lib/hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersService } from "@/lib/api/users.service";
import type { CreateUserAddressDto, UpdateUserAddressDto } from "@/types/user.types";

export const userKeys = {
  all: ["user"] as const,
  profile: () => [...userKeys.all, "profile"] as const,
  addresses: () => [...userKeys.all, "addresses"] as const,
};

// --- Queries ---

export function useMyProfile() {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: () => usersService.getMyProfile(),
  });
}

export function useMyAddresses() {
  return useQuery({
    queryKey: userKeys.addresses(),
    queryFn: () => usersService.getMyAddresses(),
  });
}

// --- Mutations ---

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name?: string; phone?: string }) => usersService.updateMyProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
    },
  });
}

export function useAddAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserAddressDto) => usersService.addMyAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.addresses() });
      queryClient.invalidateQueries({ queryKey: userKeys.profile() }); // Refresh default address in profile
    },
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserAddressDto }) => usersService.updateMyAddress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.addresses() });
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => usersService.deleteMyAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.addresses() });
    },
  });
}