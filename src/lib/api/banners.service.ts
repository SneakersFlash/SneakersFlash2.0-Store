import apiClient from "./client";

export interface Banner {
    id: string | number;
    title: string;
    imageDesktopUrl: string;
    imageMobileUrl: string;
    targetUrl: string;
    position?: string;
    sortOrder?: number;
    isActive?: boolean;
}

export const bannersService = {
  // Mengambil banner berdasarkan posisi (opsional)
    async getBanners(position?: string): Promise<Banner[]> {
        const { data } = await apiClient.get<Banner[]>("/banners", {
        params: position ? { position } : undefined, // otomatis jadi ?position=home_top
        });
        return data;
    },

    // Jika nanti butuh get by ID
    async getById(id: string | number): Promise<Banner> {
        const { data } = await apiClient.get<Banner>(`/banners/${id}`);
        return data;
    }
};