// types/brand.types.ts

export interface Brand {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    sortOrder: number;
    isActive: boolean;
    createdAt: string;
    gineeBrandId: string | null;
}