export interface ShippingCostQuery {
    subdistrictId: number;
    weight: number; // dalam gram
    courier?: string; // contoh: 'jne', 'sicepat'
    itemValue?: number; // Opsional
    isCod?: boolean; // Opsional
}

// Response dari backend calculateShippingCost
export interface ShippingOption {
    courier: string;
    courier_name: string;
    service: string;
    description: string;
    cost: number;
    etd: string;
    cashback: number;
    is_cod_available: boolean;
}

export interface LocationArea {
    id: number;
    name: string;
    postal_code?: string;
    zip_code?: string;
}