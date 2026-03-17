import apiClient from "./client";
import type { ShippingOption, LocationArea } from "@/types/logistics.types";

export const logisticsService = {
  // 1. Hitung Ongkir (Sekarang menggunakan POST sesuai backend)
  calculateShipping: async (payload: { 
    destinationSubdistrictId: number, 
    weightGrams: number, 
    courier?: string,
    extraOptions?: { 
      itemValue?: number; 
      isCod?: boolean;
      originPinPoint?: string;      // Format: "lat,long" (contoh: "-7.455, 109.287")
      destinationPinPoint?: string; // Format: "lat,long"
    }
  }): Promise<ShippingOption[]> => {
    const response = await apiClient.post('/logistics/calculate', payload);
    return response.data;
  },

  // 2. Ambil Data Provinsi
  getProvinces: async (): Promise<LocationArea[]> => {
    const response = await apiClient.get('/logistics/provinces');
    return response.data;
  },

  // 3. Ambil Kota (Menggunakan Path Param /:provinceId)
  getCities: async (provinceId: number): Promise<LocationArea[]> => {
    const response = await apiClient.get(`/logistics/cities/${provinceId}`);
    return response.data;
  },

  // 4. Ambil Kecamatan (Menggunakan Path Param /:cityId)
  getDistricts: async (cityId: number): Promise<LocationArea[]> => {
    const response = await apiClient.get(`/logistics/districts/${cityId}`);
    return response.data;
  },

  // 5. Ambil Kelurahan/Subdistrict (Menggunakan Path Param /:districtId)
  getSubdistricts: async (districtId: number): Promise<LocationArea[]> => {
    const response = await apiClient.get(`/logistics/subdistricts/${districtId}`);
    return response.data;
  }
};