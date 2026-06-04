"use client";

import { useState, useRef, useEffect } from "react";
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

const formatRp = (value: number) => {
  if (value >= 1_000_000) return `Rp${value / 1_000_000}jt`;
  if (value >= 1_000)     return `Rp${value / 1_000}rb`;
  return `Rp${value.toLocaleString("id-ID")}`;
};

const MOCK_FIRSTSTEP_VOUCHER = {
  id: "__mock_firststep__",
  code: "FIRSTSTEP-••••",
  name: "Registration Bonus",
  description: "Khusus member baru! Daftar sekarang dan dapatkan voucher ini.",
  discountType: "FIXED" as DiscountType,
  discountValue: 100000,
  minPurchaseAmount: 1000000,
  maxDiscountAmount: null,
  expiresAt: "2030-12-31T23:59:59.000Z",
  isMock: true,
};

export default function VoucherClaimSection() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { isAuthenticated } = useAuthStore();

  const [vouchers, setVouchers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimedVouchers, setClaimedVouchers] = useState<string[]>([]);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        setIsLoading(true);
        const data = isAuthenticated
          ? await vouchersService.getClaimableVouchers()
          : await vouchersService.getAvailableVouchers();
        setVouchers(data);
      } catch (error) {
        console.error("Gagal memuat daftar voucher:", error);
        toast.error("Gagal memuat daftar voucher promo.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchVouchers();
  }, [isAuthenticated]);

  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-40px" });

  const handleClaim = async (id: string, isMock?: boolean) => {
    if (!isAuthenticated || isMock) {
      toast.error("Daftar sekarang untuk mendapatkan voucher selamat datang!");
      router.push(`/register`);
      return;
    }

    try {
      setClaimingId(id);
      const response = await vouchersService.claimVoucher(id);
      toast.success(response.message || "Voucher berhasil diklaim!");
      setClaimedVouchers((prev) => [...prev, id]);
    } catch (error: any) {
      const msg = error.response?.data?.message || "Gagal mengklaim voucher.";
      toast.error(msg);
    } finally {
      setClaimingId(null);
    }
  };

  const listVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, x: 40, scale: 0.95 },
    visible: {
      opacity: 1, x: 0, scale: 1,
      transition: { type: "spring", stiffness: 260, damping: 20 },
    },
  };

  const isFirstStep = (v: any) =>
  v.code?.toUpperCase().includes("FIRSTSTEP") ||
  v.name?.toUpperCase().includes("FIRST STEP") ||
  v.name?.toUpperCase().includes("FIRSTSTEP");

  const displayVouchers = !isAuthenticated
    ? [MOCK_FIRSTSTEP_VOUCHER, ...vouchers.filter(v => !isFirstStep(v))]
    : vouchers;

  return (
    <section className="w-full bg-[#F5F5F5] pb-4 pt-2 md:py-6" ref={containerRef}>
      <div className="container px-1 max-w-7xl">
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
          {isLoading ? (
            <div className="w-full text-center text-sm text-gray-500 py-4">Memuat voucher...</div>
          ) : displayVouchers.length === 0 ? (
            <div className="w-full text-center text-sm text-gray-500 py-4">
              Belum ada voucher promo saat ini.
            </div>
          ) : (
            displayVouchers.map((voucher) => {
              const isMock = (voucher as any).isMock === true;
              const isClaimed = !isMock && (voucher.isClaimed || claimedVouchers.includes(voucher.id));
              const isClaimingThis = claimingId === voucher.id;

              // Warna: merah untuk mock, orange (primary) untuk reguler
              const accentStrip  = isMock ? "bg-red-500"              : "bg-primary";
              const buttonClass  = isMock
                ? "bg-red-500 text-white hover:bg-red-600 shadow-sm shadow-red-200"
                : isClaimed
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : isClaimingThis
                    ? "bg-primary/70 text-white cursor-wait"
                    : "bg-primary text-white hover:bg-primary/90 shadow-sm shadow-orange-200";

              return (
                <motion.div
                  key={voucher.id}
                  variants={cardVariants}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="snap-start shrink-0"
                >
                  {/* ── Card — struktur & ukuran identik, beda warna strip ── */}
                  <div className="w-[260px] md:w-[320px] bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 flex relative overflow-hidden h-[90px] md:h-[100px] hover:shadow-lg transition-shadow duration-300">

                    {/* Left color strip */}
                    <div className={cn("w-2 h-full shrink-0", accentStrip)} />

                    {/* Main info */}
                    <div className="flex-1 px-1 md:px-4 py-2.5 flex flex-col justify-center border-r-2 border-dashed border-gray-200 relative min-w-0">
                      {/* Ticket notch top & bottom */}
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-[#F5F5F5] rounded-full border-b border-l border-gray-100" />
                      <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-[#F5F5F5] rounded-full border-t border-l border-gray-100" />

                      {/* Badge "Member Baru" hanya di mock */}
                      {isMock && (
                        <span className="self-start text-[8px] font-black bg-red-50 text-red-500 border border-red-100 rounded-full px-2 py-0.5 uppercase tracking-wider mb-1">
                          Member Baru
                        </span>
                      )}

                      <h4 className="font-bold text-[13px] md:text-[15px] text-gray-900 leading-tight mb-1 truncate">
                        {voucher.name}
                      </h4>

                      <p className="text-[10px] md:text-[11px] text-gray-500 font-medium">
                        Min. Blnj {formatRp(voucher.minPurchaseAmount)}
                        {voucher.maxDiscountAmount ? ` • S/d ${formatRp(voucher.maxDiscountAmount)}` : ""}
                      </p>

                      {/* Blurred code teaser untuk mock, expired date untuk reguler */}
                      {isMock ? (
                        <>
                        </>
                      ) : (
                        <p className="text-[9px] md:text-[10px] text-gray-400 mt-auto flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Berakhir {new Date(voucher.expiresAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                        </p>
                      )}
                    </div>

                    {/* Right action */}
                    <div className="w-[80px] md:w-[90px] bg-white flex flex-col items-center justify-center px-2 z-10">
                      <p className="text-[13px] md:text-[15px] font-black text-gray-900 mb-1.5">
                        {formatRp(voucher.discountValue)}
                      </p>
                      <motion.button
                        whileTap={isClaimed || isClaimingThis ? {} : { scale: 0.9 }}
                        onClick={() => handleClaim(voucher.id, isMock || undefined)}
                        disabled={isClaimed || isClaimingThis}
                        className={cn(
                          "w-full py-1.5 md:py-2 rounded-full text-[10px] md:text-[11px] font-bold transition-all duration-300 shadow-lg",
                          buttonClass
                        )}
                      >
                        {isClaimingThis ? "..." : isClaimed ? "Diklaim" : isMock ? "Daftar" : "Klaim"}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </div>
    </section>
  );
}