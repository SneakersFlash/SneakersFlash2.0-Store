"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw, AlertCircle, Ticket, Clock, Copy, Scissors } from "lucide-react";
import { vouchersService } from "@/lib/api/vouchers.service";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner"; // Pastikan sudah install sonner

const formatRp = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

export default function MyVouchersContent() {
  const router = useRouter();
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        // Asumsi kamu sudah menambahkan getMyWallet di vouchersService
        const data: any = await vouchersService.getMyWallet();
        setVouchers(Array.isArray(data) ? data : data?.data || []);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Gagal memuat dompet voucher.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWallet();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Kode ${code} disalin ke clipboard!`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2F2F2]">
        <RefreshCw className="w-8 h-8 animate-spin text-[#FF6B00]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F2F2F2] p-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-lg font-bold text-gray-900">Gagal Memuat Data</h2>
        <p className="text-gray-500 mt-2">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-6 text-[#FF6B00] font-bold hover:underline">
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F2F2] sm:py-10">
      <div className="w-full max-w-2xl mx-auto min-h-screen sm:min-h-fit sm:rounded-2xl sm:shadow-sm sm:border sm:border-gray-200 flex flex-col overflow-hidden bg-[#F2F2F2]">
        
        {/* HEADER */}
        <header className="px-4 py-3 sm:py-4 flex items-center gap-3 bg-white/95 backdrop-blur-sm sticky top-0 z-20 border-b border-gray-100 sm:rounded-t-2xl">
          <button 
            onClick={() => router.back()} 
            className="w-9 h-9 flex items-center justify-center -ml-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Kembali"
          >
            <ArrowLeft size={20} className="text-gray-900" />
          </button>
          <h1 className="text-base font-semibold text-gray-900">Dompet Voucher</h1>
        </header>

        {/* CONTENT */}
        <div className="flex-1 p-4 sm:p-5 flex flex-col gap-4">
          {vouchers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4 text-[#FF6B00]">
                <Scissors className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Dompet Kosong</h3>
              <p className="text-sm text-gray-500 mt-2 mb-6 max-w-[250px]">
                Kamu belum memiliki voucher. Yuk klaim promo menarik sekarang!
              </p>
              <button 
                onClick={() => router.push("/#vouchers")} // Arahkan ke section klaim voucher
                className="bg-[#1C1C1C] text-white hover:bg-black transition-colors px-6 py-3 rounded-xl font-bold shadow-md"
              >
                Cari Promo
              </button>
            </div>
          ) : (
            vouchers.map((voucher) => {
              const isExpiringSoon = new Date(voucher.expiresAt).getTime() - new Date().getTime() < 86400000; // < 24 Jam

              return (
                <div key={voucher.id} className="bg-white border border-gray-100 rounded-xl flex relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {/* Pita Warna Sebelah Kiri */}
                  <div className="w-2 sm:w-3 bg-gradient-to-b from-[#FF6B00] to-[#FF8E3C] shrink-0" />
                  
                  {/* Info Voucher (Kiri) */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-center border-r-2 border-dashed border-gray-100 relative">
                    {/* Lingkaran Bolong ala Tiket */}
                    <div className="absolute -top-3 -right-3 w-6 h-6 bg-[#F2F2F2] rounded-full border-b border-l border-gray-100" />
                    <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-[#F2F2F2] rounded-full border-t border-l border-gray-100" />

                    <div className="flex items-center gap-2 mb-1.5">
                      <Ticket className="w-4 h-4 text-[#FF6B00]" />
                      <h4 className="text-sm sm:text-base font-bold text-gray-900 leading-tight">
                        {voucher.name}
                      </h4>
                    </div>
                    
                    <p className="text-xs sm:text-sm text-gray-500 font-medium mb-3">
                      Min. Belanja {formatRp(voucher.minPurchaseAmount)}
                      {voucher.maxDiscountAmount ? ` • S/d ${formatRp(voucher.maxDiscountAmount)}` : ""}
                    </p>
                    
                    <div className={cn(
                      "mt-auto flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wide w-fit px-2 py-1 rounded-md",
                      isExpiringSoon ? "bg-red-50 text-red-600" : "bg-orange-50 text-[#FF6B00]"
                    )}>
                      <Clock size={12} />
                      Berlaku s/d {new Date(voucher.expiresAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </div>

                  {/* Area Kode & Action (Kanan) */}
                  <div className="w-[100px] sm:w-[130px] bg-gray-50 flex flex-col items-center justify-center p-3 gap-3 shrink-0 z-10">
                    <div className="w-full">
                      <p className="text-[10px] text-gray-400 font-medium text-center mb-1">KODE VOUCHER</p>
                      <div className="w-full bg-white border border-gray-200 py-1.5 px-2 rounded flex justify-center shadow-inner">
                        <span className="text-xs sm:text-sm font-mono font-bold text-gray-800 truncate">
                          {voucher.code}
                        </span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleCopyCode(voucher.code)}
                      className="w-full py-2 flex items-center justify-center gap-1.5 text-xs sm:text-sm font-bold text-white bg-[#1C1C1C] rounded-lg hover:bg-[#FF6B00] transition-colors active:scale-95"
                    >
                      <Copy size={14} /> Salin
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}