"use client";

import { useState, useEffect } from "react";
import { Ticket, ChevronDown, ChevronUp, Loader2, CheckCircle2, X } from "lucide-react";
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
}

export default function VoucherSelector({ subtotal, appliedVoucher, onApply, onRemove }: VoucherSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  
  const [manualCode, setManualCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch daftar voucher saat komponen dibuka pertama kali
  useEffect(() => {
    if (isOpen && vouchers.length === 0) {
      setIsLoadingList(true);
      vouchersService.getAvailableVouchers()
        .then((data) => setVouchers(data))
        .catch((err) => console.error("Gagal memuat voucher:", err))
        .finally(() => setIsLoadingList(false));
    }
  }, [isOpen, vouchers.length]);

  const handleApplyCode = async (codeToApply: string) => {
    if (!codeToApply.trim()) return;
    
    setIsApplying(true);
    setErrorMsg(null);
    try {
      // Panggil API Check Voucher sesuai controller backend Anda
      const result = await vouchersService.checkVoucherValidity(codeToApply, subtotal);
      
      // Asumsi backend mengembalikan { discountAmount: ... } saat sukses
      // Sesuaikan result.discountAmount dengan response actual dari NestJS Anda
      const discount = result.discountAmount || result.discount || 0; 
      
      onApply({ code: codeToApply.toUpperCase(), discountAmount: discount });
      setIsOpen(false);
      setManualCode("");
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Voucher tidak valid atau syarat tidak terpenuhi.");
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="w-full">
      {/* Tombol Header (Trigger) */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Ticket size={18} className={appliedVoucher ? "text-[#FF6B00]" : "text-gray-500"} />
          <div className="text-left">
            {appliedVoucher ? (
              <>
                <p className="text-sm font-bold text-[#FF6B00]">Voucher Dipakai: {appliedVoucher.code}</p>
                <p className="text-xs text-emerald-600 font-medium">Hemat {formatPrice(appliedVoucher.discountAmount)}</p>
              </>
            ) : (
              <span className="text-sm font-medium text-gray-700">Makin hemat pakai promo</span>
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

      {/* Area Dropdown (Manual Input & List) */}
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
                    className="flex-1 p-2.5 border border-gray-300 rounded-lg text-sm font-bold uppercase tracking-widest focus:border-[#FF6B00] outline-none"
                  />
                  <button 
                    disabled={isApplying || !manualCode}
                    onClick={() => handleApplyCode(manualCode)}
                    className="bg-gray-900 text-white font-bold px-5 rounded-lg text-sm hover:bg-black disabled:bg-gray-300 transition-colors flex items-center justify-center min-w-[80px]"
                  >
                    {isApplying ? <Loader2 size={16} className="animate-spin" /> : "Apply"}
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
                  <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
                    {vouchers.map((v) => {
                      const isSelected = appliedVoucher?.code === v.code;
                      const disabled = subtotal < (v.minPurchase || 0);

                      return (
                        <div 
                          key={v.id} 
                          onClick={() => !disabled && !isSelected && handleApplyCode(v.code)}
                          className={cn(
                            "relative border rounded-xl p-3 flex items-center justify-between transition-all",
                            disabled ? "opacity-50 bg-gray-50 cursor-not-allowed border-gray-200" :
                            isSelected ? "border-[#FF6B00] bg-orange-50/30" : "border-gray-200 hover:border-[#FF6B00] cursor-pointer bg-white shadow-sm"
                          )}
                        >
                          {/* Garis Sobekan Tiket Visual */}
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-1.5 w-3 h-3 bg-white border-r border-gray-200 rounded-full" />
                          
                          <div className="pl-2">
                            <p className="font-bold text-sm text-gray-900">{v.code}</p>
                            {v.description && <p className="text-xs text-gray-500 mt-0.5">{v.description}</p>}
                            {v.minPurchase ? (
                              <p className="text-[10px] text-gray-400 mt-1">Min. belanja {formatPrice(v.minPurchase)}</p>
                            ) : null}
                          </div>

                          <div className="shrink-0 pl-3">
                            {isApplying && manualCode === v.code ? (
                              <Loader2 size={18} className="animate-spin text-[#FF6B00]" />
                            ) : isSelected ? (
                              <CheckCircle2 size={20} className="text-[#FF6B00]" />
                            ) : disabled ? (
                              <span className="text-[10px] text-gray-400 font-semibold bg-gray-100 px-2 py-1 rounded">Belum memenuhi</span>
                            ) : (
                              <span className="text-xs font-bold text-[#FF6B00]">Pakai</span>
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