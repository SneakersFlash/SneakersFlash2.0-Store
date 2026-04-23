"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw, AlertCircle, Ticket, Clock, Copy, Scissors } from "lucide-react";
import { vouchersService } from "@/lib/api/vouchers.service";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import Image from "next/image";

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
              <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
                  <div className="relative w-[50px] h-[50px]">
                  <Image
                      src="/images/petir.svg"
                      alt="Loading"
                      fill
                      className="object-contain animate-bounce text-yellow-300"
                  />
                  </div>
              </div>
          );
      }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA] p-6 text-center">
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
    <div className="min-h-screen bg-[#F8F9FA] pb-24 md:pb-0 md:py-10 text-gray-900 font-sans">
      {/* CONTAINER: Max width 5xl, seragam dengan halaman Address/Orders */}
      <div className="w-full max-w-5xl mx-auto min-h-screen md:min-h-fit md:rounded-2xl md:border md:border-gray-200 flex flex-col md:overflow-hidden md:bg-white md:shadow-sm">
        
        {/* HEADER BLOCK: Sticky di mobile, static di desktop */}
        <div className="bg-white sticky top-0 z-10 shadow-sm md:shadow-none md:static border-b border-gray-100">
          <header className="flex px-4 py-4 md:px-8 md:py-6 items-center gap-4">
            <button 
              onClick={() => router.back()} 
              className="flex md:hidden w-10 h-10 items-center justify-center -ml-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Kembali"
            >
              <ArrowLeft size={22} className="text-gray-900" />
            </button>
            
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-gray-900 leading-none">Dompet Voucher</h1>
              <p className="text-sm text-gray-400 mt-2 hidden md:block">
                Kelola dan gunakan voucher promosi yang kamu miliki
              </p>
            </div>
          </header>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 p-4 md:p-6 lg:p-8 flex flex-col">
          {vouchers.length === 0 ? (
            /* EMPTY STATE: Card style di mobile, menyatu dengan container di desktop */
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-gray-100 shadow-sm md:border-none md:shadow-none">
              <div className="w-16 h-16 bg-[#FFF0E6] rounded-full flex items-center justify-center mb-6 text-[#FF6B00]">
                <Scissors className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Dompet Kosong</h3>
              <p className="text-sm text-gray-500 mt-2 mb-8 max-w-xs mx-auto">
                Kamu belum memiliki voucher. Yuk klaim promo menarik sekarang!
              </p>
              <button 
                onClick={() => router.push("/#vouchers")}
                className="bg-[#1C1C1C] text-white hover:bg-black transition-all px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-gray-200 active:scale-95"
              >
                Cari Promo
              </button>
            </div>
          ) : (
            /* LIST VOUCHER: Grid layout di desktop agar optimal dengan max-w-5xl */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {vouchers.map((voucher) => {
                const isExpiringSoon = new Date(voucher.expiresAt).getTime() - new Date().getTime() < 86400000;

                return (
                  <div key={voucher.id} className="bg-white border border-gray-100 rounded-xl flex relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    {/* Pita Warna */}
                    <div className="w-2 md:w-3 bg-gradient-to-b from-[#FF6B00] to-[#FF8E3C] shrink-0" />
                    
                    {/* Info Voucher */}
                    <div className="p-4 md:p-5 flex-1 flex flex-col justify-center border-r-2 border-dashed border-gray-100 relative">
                      <div className="absolute -top-3 -right-3 w-6 h-6 bg-[#F8F9FA] md:bg-white rounded-full border-b border-l border-gray-100" />
                      <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-[#F8F9FA] md:bg-white rounded-full border-t border-l border-gray-100" />

                      <div className="flex items-center gap-2 mb-1.5">
                        <Ticket className="w-4 h-4 text-[#FF6B00]" />
                        <h4 className="text-sm md:text-base font-bold text-gray-900 leading-tight line-clamp-1">
                          {voucher.name}
                        </h4>
                      </div>
                      
                      <p className="text-xs md:text-sm text-gray-500 font-medium mb-3">
                        Min. Belanja {formatRp(voucher.minPurchaseAmount)}
                        {voucher.maxDiscountAmount ? ` • S/d ${formatRp(voucher.maxDiscountAmount)}` : ""}
                      </p>
                      
                      <div className={cn(
                        "mt-auto flex items-center gap-1.5 text-[10px] md:text-xs font-bold uppercase tracking-wide w-fit px-2 py-1 rounded-md",
                        isExpiringSoon ? "bg-red-50 text-red-600" : "bg-[#FFF0E6] text-[#FF6B00]"
                      )}>
                        <Clock size={12} />
                        Berlaku s/d {new Date(voucher.expiresAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>

                    {/* Area Kode & Action */}
                    <div className="w-[110px] md:w-[130px] bg-gray-50 flex flex-col items-center justify-center p-3 gap-3 shrink-0 z-10">
                      <div className="w-full">
                        <p className="text-[10px] text-gray-400 font-medium text-center mb-1">KODE VOUCHER</p>
                        <div className="w-full bg-white border border-gray-200 py-1.5 px-2 rounded flex justify-center shadow-inner">
                          <span className="text-xs md:text-sm font-mono font-bold text-gray-800 truncate">
                            {voucher.code}
                          </span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handleCopyCode(voucher.code)}
                        className="w-full py-2 flex items-center justify-center gap-1.5 text-xs md:text-sm font-bold text-white bg-[#1C1C1C] rounded-lg hover:bg-black transition-colors active:scale-95"
                      >
                        <Copy size={14} /> Salin
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}