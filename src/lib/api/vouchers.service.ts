import { apiClient } from "./client";
import type { Voucher } from "@/types/voucher.types";

export const vouchersService = {
    getAvailableVouchers: async (): Promise<Voucher[]> => {
        const res = await apiClient.get("/vouchers?activeOnly=true");
        return res.data;
    },

    getClaimableVouchers: async (): Promise<Voucher[]> => {
        const res = await apiClient.get("/vouchers/claimable");
        return res.data;
    },

    getMyWallet: async (): Promise<Voucher[]> => {
        const res = await apiClient.get("/vouchers/wallet");
        return res.data;
    },

    checkVoucherValidity: async (code: string, amount: number) => {
        const res = await apiClient.get("/vouchers/check", {
            params: { code, amount },
        });
        return res.data;
    },

    claimVoucher: async (voucherId: string) => {
        const res = await apiClient.post("/vouchers/claim", { voucherId });
        return res.data;
    }
};