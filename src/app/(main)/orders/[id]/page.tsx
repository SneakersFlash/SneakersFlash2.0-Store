"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  Copy, CheckCircle2, 
  ArrowLeft, RefreshCw, AlertCircle, 
  ChevronDown, ChevronUp, Wallet
} from "lucide-react";
import { formatPrice } from "@/lib/utils/formatPrice";
import { ordersService } from "@/lib/api/orders.service";

export default function OrderPaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // States untuk UI
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  const [copiedField, setCopiedField] = useState<"va" | "amount" | "order" | null>(null);
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 1. Fetch Order Data
  const fetchOrderDetails = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const data = await ordersService.getOrderDetails(resolvedParams.id);
      setOrder(data);

      if (data.status === "paid" || data.status === "processing") {
        router.push(`/orders/${resolvedParams.id}/success`);
        return; 
      }

    } catch (err: any) {
      setError(err?.response?.data?.message || "Gagal memuat detail pesanan.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [resolvedParams.id]);

  // 2. Countdown Timer Logic
  useEffect(() => {
    if (!order || order.status !== "waiting_payment" && order.status !== "pending") return;

    const expiryDate = order.expireTime 
      ? new Date(order.expireTime).getTime() 
      : new Date(order.createdAt).getTime() + (1 * 60 * 60 * 1000);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = expiryDate - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft(null);
      } else {
        setTimeLeft({
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [order]);

  // 3. Copy Handler
  const handleCopy = (text: string, field: "va" | "amount" | "order") => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // --- RENDERING STATES ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <RefreshCw className="w-8 h-8 animate-spin text-[#E05600]" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F5F5] p-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-lg font-bold">Gagal Memuat Pesanan</h2>
        <p className="text-gray-500 mt-2">{error}</p>
        <button onClick={() => router.push('/orders')} className="mt-6 text-[#E05600] font-bold">Kembali ke Pesanan Saya</button>
      </div>
    );
  }

  const isQris = order.paymentMethod === 'qris';
  const paymentMethodName = order.paymentMethod.replace('_va', ' Bank Transfer').toUpperCase();

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans text-gray-900 pb-24 lg:pb-16">
      
      {/* HEADER (Sticky di semua device) */}
      <header className="bg-white px-4 lg:px-8 py-4 flex items-center gap-4 sticky top-0 z-30 shadow-sm border-b border-gray-100">
        <button 
          onClick={() => router.back()} 
          className="flex items-center justify-center hover:bg-gray-50 p-1.5 -ml-1.5 rounded-full transition-colors"
        >
          <ArrowLeft size={22} className="text-black" />
        </button>
        <p className="text-[18px] font-bold text-black">Payment Status</p>
      </header>

      {/* MAIN CONTAINER (Max-width dibatasi agar rapi di layar ultra-wide) */}
      <main className="max-w-5xl mx-auto w-full p-0 sm:p-4 lg:p-6 flex flex-col lg:flex-row items-start gap-4 lg:gap-8 mt-0 lg:mt-4">
        
        {/* =========================================================================
            KOLOM KIRI (Timer & Metode Pembayaran)
            Di mobile ini muncul pertama, di desktop ada di sebelah kiri.
            ========================================================================= */}
        <div className="flex-1 w-full flex flex-col gap-2 sm:gap-4">
          
          {/* ORANGE BANNER TIMER */}
          <div className="bg-[#E05600] text-white px-5 py-4 sm:rounded-xl shadow-sm flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2">
            <span className="text-[14px] font-medium">Let's complete your order</span>
            {timeLeft ? (
              <span className="font-bold text-[15px] bg-white/20 px-3 py-1 rounded-lg">
                {timeLeft.hours > 0 ? `${timeLeft.hours}h ` : ''}
                {timeLeft.minutes}m : {timeLeft.seconds}s
              </span>
            ) : (
              <span className="font-bold text-[15px] bg-white/20 px-3 py-1 rounded-lg">Waktu Habis</span>
            )}
          </div>

          {/* PAYMENT INSTRUCTION CARD */}
          <div className="bg-white sm:rounded-xl shadow-sm border-y sm:border border-gray-100 overflow-hidden">
            {/* Header Cara Pembayaran */}
            <div className="px-5 py-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="px-3 py-1.5 bg-blue-50 border border-blue-100 text-blue-700 font-black italic text-[11px] rounded uppercase tracking-wide">
                  {isQris ? 'QRIS' : paymentMethodName.split(' ')[0]}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-[15px]">{paymentMethodName}</span>
                </div>
              </div>
              <button 
                onClick={() => setIsInstructionOpen(!isInstructionOpen)}
                className="text-gray-400 hover:text-gray-700 transition-colors bg-gray-50 p-2 rounded-full"
              >
                {isInstructionOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>

            {/* Konten Accordion */}
            {isInstructionOpen && (
              <div className="px-5 py-5 bg-gray-50/50 border-t border-gray-100 text-[14px] text-gray-600 leading-relaxed">
                <p className="font-bold text-gray-800 mb-3">Cara Pembayaran:</p>
                {isQris ? (
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Buka aplikasi m-Banking atau e-Wallet Anda.</li>
                    <li>Pilih menu <strong>Scan QR</strong>.</li>
                    <li>Scan QR Code yang tampil di layar ini.</li>
                    <li>Periksa detail pembayaran dan pastikan nominal sesuai.</li>
                    <li>Masukkan PIN Anda untuk menyelesaikan pembayaran.</li>
                  </ol>
                ) : (
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Buka m-Banking, Internet Banking, atau ATM.</li>
                    <li>Pilih menu <strong>Transfer</strong> &gt; <strong>Virtual Account</strong>.</li>
                    <li>Masukkan Nomor Virtual Account: <strong className="text-black">{order.vaNumber}</strong>.</li>
                    <li>Pastikan jumlah tagihan persis sebesar <strong className="text-[#E05600]">{formatPrice(order.total)}</strong>.</li>
                    <li>Selesaikan pembayaran.</li>
                  </ol>
                )}
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            KOLOM KANAN (Kartu Tagihan Utama & Tombol)
            Di desktop, bagian ini dibuat STICKY agar tidak hilang saat scroll ke bawah.
            ========================================================================= */}
        <div className="w-full lg:w-[380px] xl:w-[420px] flex-shrink-0 flex flex-col gap-4 lg:sticky lg:top-24 px-4 sm:px-0">
          
          {/* MAIN PAYMENT CARD */}
          <div className="bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-5">
            
            {/* Header Mini */}
            <div className="flex items-center gap-2 mb-2 font-bold text-[13px] text-gray-800 uppercase tracking-wide">
              <Wallet size={18} className="text-[#E05600]" /> <span>Rincian Tagihan</span>
            </div>

            {/* Order No */}
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-gray-500">Order No.</span>
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-bold">{order.orderNumber || order.id || "-"}</span>
                <button onClick={() => handleCopy(order.orderNumber || order.id || "", "order")} className="text-gray-400 hover:text-[#E05600] transition">
                  {copiedField === "order" ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            <hr className="border-gray-100 border-dashed" />

            {/* Total Payment */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] text-gray-500">Total Payment</span>
                <button onClick={() => handleCopy(order.total.toString(), "amount")} className="text-gray-400 hover:text-[#E05600] transition">
                  {copiedField === "amount" ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
              </div>
              <p className="text-[28px] font-black text-black tracking-tight mt-1">
                {formatPrice(order.total)}
              </p>
            </div>

            <hr className="border-gray-100 border-dashed" />

            {/* KONDISIONAL: QRIS / VA Section */}
            {isQris ? (
              <div className="flex flex-col items-center justify-center py-2">
                <p className="text-[13px] text-gray-500 mb-4">Scan QR Code di bawah ini</p>
                <div className="w-56 h-56 relative border border-gray-200 rounded-2xl overflow-hidden p-2 bg-white shadow-inner">
                  {order.qrCodeUrl ? (
                    <Image src={order.qrCodeUrl} alt="QRIS Code" fill className="object-contain p-2 mix-blend-multiply" />
                  ) : (
                    <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-400 text-[12px] text-center px-4">QR Code tidak tersedia</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] text-gray-500">Virtual Account Number</span>
                  <button onClick={() => handleCopy(order.vaNumber || "", "va")} className="text-gray-400 hover:text-[#E05600] transition bg-white p-1.5 rounded-md shadow-sm border border-gray-200">
                    {copiedField === "va" ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
                  </button>
                </div>
                <p className="text-[18px] font-bold text-black tracking-widest">{order.vaNumber || "-"}</p>
                <p className="text-[12px] text-gray-500 mt-1 font-medium">Atas Nama: Sneaker Flash</p>
              </div>
            )}
          </div>
          
          {/* BOTTOM BUTTON */}
          <button 
            onClick={() => { setIsRefreshing(true); fetchOrderDetails(false); }}
            disabled={isRefreshing}
            className="w-full bg-[#1C1C1C] text-white hover:bg-black active:scale-[0.98] font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70"
          >
            {isRefreshing ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Check Payment Status"}
          </button>

        </div>

      </main>
    </div>
  );
}