"use client";

import { useState, useEffect } from "react";
import { Ticket, ChevronDown, ChevronUp, Loader2, CheckCircle2, X, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { vouchersService } from "@/lib/api/vouchers.service";
import { formatPrice } from "@/lib/utils/formatPrice";
import { cn } from "@/lib/utils/cn";
import type { Voucher, AppliedVoucher } from "@/types/voucher.types";

interface VoucherSelectorProps {
  subtotal: number;
  appliedVoucher: AppliedVoucher | null;
  onApply: (voucher: AppliedVoucher) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export default function VoucherSelector({ subtotal, appliedVoucher, onApply, onRemove, disabled }: VoucherSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [vouchers, setVouchers] = useState<any[]>([]); // Menggunakan any[] sementara untuk menampung properti tambahan
  const [isLoadingList, setIsLoadingList] = useState(false);
  
  const [manualCode, setManualCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && vouchers.length === 0) {
      setIsLoadingList(true);
      vouchersService.getMyWallet()
        .then((data) => setVouchers(data))
        .catch((err) => console.error("Gagal memuat voucher:", err))
        .finally(() => setIsLoadingList(false));
    }
  }, [isOpen, vouchers.length]);

  const handleApplyCode = async (codeToApply: string) => {
    if (!codeToApply.trim()) return;
    
    setIsApplying(true);
    setManualCode(codeToApply); // Set manual code agar spinner loading spesifik muncul
    setErrorMsg(null);
    try {
      const result = await vouchersService.checkVoucherValidity(codeToApply, subtotal);
      const discount = result.discountAmount || result.discount || 0; 
      
      onApply({ code: codeToApply.toUpperCase(), discountAmount: discount, name: result.name });
      setIsOpen(false);
      setManualCode("");
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Voucher tidak valid atau syarat tidak terpenuhi.");
    } finally {
      setIsApplying(false);
    }
  };

  if (disabled) {
    return (
      <div className="w-full flex items-center justify-between p-4 opacity-50 cursor-not-allowed">
        <div className="flex items-center gap-3">
          <Ticket size={18} className="text-gray-400" />
          <div className="text-left">
            <span className="text-sm font-medium text-gray-400">Voucher tidak tersedia</span>
            <p className="text-xs text-gray-400 mt-0.5">Produk event tidak dapat menggunakan voucher</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Tombol Header (Trigger) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Ticket size={18} className={appliedVoucher ? "text-gray-900" : "text-gray-500"} />
          <div className="text-left">
            {appliedVoucher ? (
              <>
                <p className="text-sm font-bold text-[#F70000]">Voucher Dipakai: {appliedVoucher.code}</p>
                <p className="text-xs text-emerald-600 font-medium">Hemat {formatPrice(appliedVoucher.discountAmount || 0)}</p>
              </>
            ) : (
              <span className="text-[12px] font-semibold text-gray-700">Makin hemat pakai promo</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {appliedVoucher && (
            <span
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="text-xs text-gray-400 hover:text-red-500 bg-gray-100 hover:bg-red-50 px-2 py-1 rounded-md"
            >
              Hapus
            </span>
          )}
          {isOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
        </div>
      </button>

      {/* Area Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: "auto", opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }} 
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 space-y-4">
              
              {/* Input Manual */}
              <div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Masukkan Kode Voucher" 
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                    className="flex-1 p-2.5 border border-gray-300 rounded-lg text-base font-bold uppercase focus:border-primary outline-none"
                  />
                  <button 
                    disabled={isApplying || !manualCode}
                    onClick={() => handleApplyCode(manualCode)}
                    className="bg-gray-900 text-white font-bold px-5 rounded-lg text-sm hover:bg-black disabled:bg-gray-300 transition-colors flex items-center justify-center min-w-[80px]"
                  >
                    {isApplying && !vouchers.some(v => v.code === manualCode) ? <Loader2 size={16} className="animate-spin" /> : "Apply"}
                  </button>
                </div>
                {errorMsg && <p className="text-xs text-red-500 mt-2 font-medium">{errorMsg}</p>}
              </div>

              <hr className="border-gray-100" />

              {/* Daftar Voucher Tersedia */}
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Voucher Spesial Untukmu</p>
                
                {isLoadingList ? (
                  <div className="flex justify-center py-4"><Loader2 className="animate-spin text-gray-300" /></div>
                ) : vouchers.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-2">Belum ada voucher yang tersedia saat ini.</p>
                ) : (
                  <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar pb-2">
                    {vouchers.map((v) => {
                      const isSelected = appliedVoucher?.code === v.code;
                      const disabled = subtotal < (v.minPurchase || 0);

                      // Buat label diskon dinamis
                      let discountLabel = v.description || "Promo Khusus";
                      if (v.discountType === "percentage") {
                        discountLabel = `Diskon ${v.discountValue}%`;
                        if (v.maxDiscountAmount) discountLabel += ` maks. ${formatPrice(v.maxDiscountAmount)}`;
                      } else if (v.discountType === "fixed_amount") {
                        discountLabel = `Hemat ${formatPrice(v.discountValue)}`;
                      }

                      return (
                        <div 
                          key={v.id || v.code} 
                          onClick={() => !disabled && !isSelected && handleApplyCode(v.code)}
                          className={cn(
                            "w-full bg-white rounded-xl border flex relative overflow-hidden h-[90px] transition-shadow duration-300",
                            isSelected
                              ? "border-primary shadow-md shadow-orange-100 bg-primary"
                              : disabled
                              ? "border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] opacity-60 bg-gray-50 cursor-not-allowed"
                              : "border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md cursor-pointer"
                          )}
                        >
                          {/* Left strip (Garis penanda di kiri tiket) */}
                          <div className={cn("w-2 h-full shrink-0", isSelected ? "bg-primary" : "bg-primary")} />

                          {/* Main info (Bagian tengah tiket) */}
                          <div className="flex-1 px-3 py-2.5 flex flex-col justify-center border-r-2 border-dashed border-gray-200 relative min-w-0">
                            {/* Notch top & bottom (Sobekan desain tiket) */}
                            <div className="absolute -top-2 -right-2 w-4 h-4 bg-white rounded-full border-b border-l border-gray-100" />
                            <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-white rounded-full border-t border-l border-gray-100" />

                            <h4 className="font-bold text-[13px] text-gray-900 leading-tight truncate">
                              {v.name || v.code}
                            </h4>

                            <p className="text-[10px] text-gray-500 font-medium mt-0.5 line-clamp-1">
                              {discountLabel}
                            </p>

                            {!disabled && (
                              <p className="text-[10px] font-bold text-[#F70000] mt-0.5">
                                Klik untuk pakai
                              </p>
                            )}

                            {disabled && (
                              <p className="text-[10px] text-amber-500 font-medium mt-0.5">
                                Min. belanja {formatPrice(v.minPurchase || 0)}
                              </p>
                            )}

                            {v.expiresAt && (
                              <p className="text-[9px] text-gray-400 mt-auto flex items-center gap-1">
                                <Clock size={9} />
                                Berakhir{" "}
                                {new Date(v.expiresAt).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                })}
                              </p>
                            )}
                          </div>

                          {/* Action (Tombol kanan) */}
                          <div className="w-[76px] shrink-0 flex flex-col items-center justify-center px-2 z-10">
                            {isApplying && manualCode === v.code ? (
                              <Loader2 size={18} className="animate-spin text-primary" />
                            ) : (
                              <motion.button
                                whileTap={isSelected || disabled ? {} : { scale: 0.9 }}
                                disabled={disabled || isSelected}
                                onClick={(e) => {
                                  e.stopPropagation(); 
                                  if (!disabled && !isSelected) handleApplyCode(v.code);
                                }}
                                className={cn(
                                  "w-full py-1.5 rounded-full text-[10px] font-bold transition-all duration-200",
                                  isSelected
                                    ? "bg-primary cursor-default"
                                    : disabled
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-primary/10 hover:bg-primary hover:text-white shadow-sm shadow-orange-100 active:scale-95"
                                )}
                              >
                                {isSelected ? "✓ Dipakai" : "Pakai"}
                              </motion.button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}