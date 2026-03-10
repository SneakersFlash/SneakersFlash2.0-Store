// services/brands.service.ts

import { Brand } from "@/types/brand.type";
import apiClient from "./client";

export const brandsService = {
    async getAll(): Promise<Brand[]> {
        const { data } = await apiClient.get<Brand[]>("/brands");
        return data;
    },

    async getBySlug(slug: string): Promise<Brand> {
        const { data } = await apiClient.get<Brand>(`/brands/${slug}`);
        return data;
    },
};