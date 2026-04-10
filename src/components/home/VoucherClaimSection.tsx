"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import { vouchersService } from "@/lib/api/vouchers.service";
import { useAuthStore } from "@/lib/store/authStore";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export type DiscountType = "PERCENTAGE" | "FIXED";

export interface Voucher {
  id: string; 
  campaignId: string;
  userId?: string | null;
  code: string;
  name: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount?: number | null;
  minPurchaseAmount: number;
  usageLimitTotal?: number | null;
  usageLimitPerUser: number;
  startAt: string;
  expiresAt: string;
  isActive: boolean;
}

// Dummy Data Sementara (Nanti bisa diganti dengan fetch dari API)
const DUMMY_VOUCHERS: Voucher[] = [
  {
    id: "1",
    campaignId: "101",
    code: "SNKRSNEW20",
    name: "Diskon 20% Pengguna Baru",
    description: "Khusus untuk transaksi pertama kamu di SneakersFlash.",
    discountType: "PERCENTAGE",
    discountValue: 20,
    maxDiscountAmount: 50000,
    minPurchaseAmount: 200000,
    usageLimitPerUser: 1,
    startAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
  },
  {
    id: "2",
    campaignId: "102",
    code: "HEMAT50K",
    name: "Potongan Langsung 50RB",
    description: "Berlaku untuk semua produk pilihan.",
    discountType: "FIXED",
    discountValue: 50000,
    minPurchaseAmount: 500000,
    usageLimitPerUser: 1,
    startAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
  },
  {
    id: "3",
    campaignId: "103",
    code: "FREESHIPX",
    name: "Cashback Spesial 10%",
    description: "Cashback points untuk pembelian sepatu lari.",
    discountType: "PERCENTAGE",
    discountValue: 10,
    maxDiscountAmount: 100000,
    minPurchaseAmount: 750000,
    usageLimitPerUser: 1,
    startAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
  },
];

const formatRp = (value: number) => {
  if (value >= 1000) {
    return `Rp${value / 1000}rb`;
  }
  return `Rp${value.toLocaleString("id-ID")}`;
};

export function VoucherClaimSection() {
  const [claimedVouchers, setClaimedVouchers] = useState<string[]>([]);
  const [claimingId, setClaimingId] = useState<string | null>(null); // State untuk tombol loading
  
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-40px" });

  // Setup Auth & Router untuk lempar user ke Login jika belum login
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  const currentPath = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname;

  const handleClaim = async (id: string) => {
    // 1. Cek apakah user sudah login
    if (!isAuthenticated) {
      toast.error("Silakan login terlebih dahulu untuk klaim voucher");
      router.push(`/login?callbackUrl=${encodeURIComponent(currentPath)}`);
      return;
    }

    // 2. Cegah spam klik
    if (claimedVouchers.includes(id) || claimingId === id) return;

    // 3. Proses Klaim
    setClaimingId(id);
    try {
      // *Jika nanti data tidak dummy, gunakan id asli. 
      // Untuk tes dengan dummy, mungkin API akan error 404 karena ID 1, 2, 3 belum ada di DB.
      const response = await vouchersService.claimVoucher(id);
      
      if (response.success) {
        setClaimedVouchers((prev) => [...prev, id]);
        toast.success(response.message || "Voucher berhasil diklaim!");
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Gagal mengklaim voucher. Kuota habis atau sudah diklaim.";
      toast.error(errorMsg);
    } finally {
      setClaimingId(null);
    }
  };

  if (!DUMMY_VOUCHERS || DUMMY_VOUCHERS.length === 0) return null;

  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, x: 40, scale: 0.95 },
    visible: { 
      opacity: 1, x: 0, scale: 1,
      transition: { type: "spring", stiffness: 260, damping: 20 }
    },
  };

  return (
    <section className="w-full bg-[#F5F5F5] py-4 md:py-6" ref={containerRef}>
      <div className="container mx-auto px-4 max-w-7xl">
        
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center justify-between mb-3 md:mb-4"
        >
          <p className="text-[18px] md:text-[22px] font-black tracking-tight text-gray-900">
            Klaim Voucher Belanja
          </p>
        </motion.div>

        <motion.div 
          variants={listVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex gap-3 lg:gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none pb-4 pt-2 -my-2 px-1"
        >
          {DUMMY_VOUCHERS.map((voucher) => {
            const isClaimed = claimedVouchers.includes(voucher.id);
            const isClaimingThis = claimingId === voucher.id;

            const titleDisplay = voucher.discountType === "PERCENTAGE" 
              ? `Diskon ${voucher.discountValue}%` 
              : `Diskon ${formatRp(voucher.discountValue)}`;

            return (
              <motion.div
                key={voucher.id}
                variants={cardVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="snap-start shrink-0"
              >
                <div className="w-[260px] md:w-[320px] bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 flex relative overflow-hidden h-[90px] md:h-[100px] hover:shadow-lg transition-shadow duration-300">
                  
                  <div className="w-2 h-full bg-gradient-to-b from-[#FF6B00] to-[#FF8E3C]" />

                  <div className="flex-1 px-3 md:px-4 py-2.5 flex flex-col justify-center border-r-2 border-dashed border-gray-200 relative">
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-[#F5F5F5] rounded-full border-b border-l border-gray-100" />
                    <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-[#F5F5F5] rounded-full border-t border-l border-gray-100" />

                    <h4 className="font-bold text-[13px] md:text-[15px] text-gray-900 leading-tight mb-1 truncate">
                      {titleDisplay}
                    </h4>
                    
                    <p className="text-[10px] md:text-[11px] text-gray-500 font-medium">
                      Min. Blnj {formatRp(voucher.minPurchaseAmount)}
                      {voucher.maxDiscountAmount ? ` • S/d ${formatRp(voucher.maxDiscountAmount)}` : ""}
                    </p>
                    
                    <p className="text-[9px] md:text-[10px] text-gray-400 mt-auto flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Berakhir {new Date(voucher.expiresAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                    </p>
                  </div>

                  <div className="w-[80px] md:w-[90px] bg-[#FFF8F3] flex flex-col items-center justify-center px-2 z-10">
                    <motion.button
                      whileTap={isClaimed || isClaimingThis ? {} : { scale: 0.9 }}
                      onClick={() => handleClaim(voucher.id)}
                      disabled={isClaimed || isClaimingThis}
                      className={cn(
                        "w-full py-1.5 md:py-2 rounded-full text-[10px] md:text-[11px] font-bold transition-all duration-300",
                        isClaimed 
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed" 
                          : isClaimingThis
                          ? "bg-[#FF6B00]/70 text-white cursor-wait"
                          : "bg-[#FF6B00] text-white hover:bg-[#E65A00] shadow-sm shadow-orange-200"
                      )}
                    >
                      {isClaimingThis ? "..." : isClaimed ? "Diklaim" : "Klaim"}
                    </motion.button>
                  </div>

                </div>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}