import { apiClient } from "./client";
import type { Voucher } from "@/types/voucher.types";

export const vouchersService = {
    getAvailableVouchers: async (): Promise<Voucher[]> => {
        const res = await apiClient.get("/vouchers?activeOnly=true");
        return res.data;
    },

    checkVoucherValidity: async (code: string, amount: number) => {
        const res = await apiClient.get("/vouchers/check", {
        params: { code, amount },
        });
        return res.data;
    },
};