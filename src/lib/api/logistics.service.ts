import apiClient from "./client";
import type { ShippingOption, LocationArea } from "@/types/logistics.types";

export const logisticsService = {
  // 1. Hitung Ongkir
  calculateShipping: async (payload: {
    destinationSubdistrictId: number;
    weightGrams: number;
    courier?: string;
    itemValue?: number;
    isCod?: string | boolean;
    originPinPoint?: string;
    destinationPinPoint?: string;
    destinationText?: string;
  }): Promise<ShippingOption[] & {
    options?: ShippingOption[];
    // Field berikut hanya ada kalau request-nya terautentikasi.
    pointsBalance?: number;
    customerTier?: string;
    /** Rate perolehan poin sesuai tier, mis. 0.025 untuk advance. */
    pointsEarnRate?: number;
  }> => {
    const response = await apiClient.post('/logistics/calculate', payload);
    return response.data;
  },

  // 2. Ambil Data Provinsi
  getProvinces: async (): Promise<LocationArea[]> => {
    const response = await apiClient.get('/logistics/provinces');
    return response.data;
  },

  // 3. Ambil Kota
  getCities: async (provinceId: number): Promise<LocationArea[]> => {
    const response = await apiClient.get(`/logistics/cities/${provinceId}`);
    return response.data;
  },

  // 4. Ambil Kecamatan
  getDistricts: async (cityId: number): Promise<LocationArea[]> => {
    const response = await apiClient.get(`/logistics/districts/${cityId}`);
    return response.data;
  },

  // 5. Ambil Kelurahan/Subdistrict
  getSubdistricts: async (districtId: number): Promise<LocationArea[]> => {
    const response = await apiClient.get(`/logistics/subdistricts/${districtId}`);
    return response.data;
  },
};