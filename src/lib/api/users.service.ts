// src/lib/api/users.service.ts
import { apiClient } from "./client";
import type { UserProfile, UserAddress, CreateUserAddressDto, UpdateUserAddressDto } from "@/types/user.types";

export const usersService = {
  // --- Profile ---
  getMyProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get('/users/me');
    return response.data;
  },

  updateMyProfile: async (data: { name?: string; phone?: string }): Promise<UserProfile> => {
    const response = await apiClient.patch('/users/me', data);
    return response.data;
  },

  // --- Addresses ---
  getMyAddresses: async (): Promise<UserAddress[]> => {
    const response = await apiClient.get('/users/me/addresses');
    return response.data;
  },

  getMyAddress: async (id: number): Promise<UserAddress> => {
    const response = await apiClient.get(`/users/me/addresses/${id}`);
    return response.data;
  },

  addMyAddress: async (data: CreateUserAddressDto): Promise<UserAddress> => {
    const response = await apiClient.post('/users/me/addresses', data);
    return response.data;
  },

  updateMyAddress: async (id: number, data: UpdateUserAddressDto): Promise<UserAddress> => {
    const response = await apiClient.patch(`/users/me/addresses/${id}`, data);
    return response.data;
  },

  deleteMyAddress: async (id: number): Promise<void> => {
    await apiClient.delete(`/users/me/addresses/${id}`);
  },
};