"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  Copy, CheckCircle2, ChevronDown, ChevronUp, 
  Clock, ArrowLeft, RefreshCw, AlertCircle 
} from "lucide-react";
import { formatPrice } from "@/lib/utils/formatPrice";
import { ordersService } from "@/lib/api/orders.service";
import { cn } from "@/lib/utils/cn";

export default function OrderPaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // States untuk UI
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  const [copiedField, setCopiedField] = useState<"va" | "amount" | null>(null);
  const [isInstructionOpen, setIsInstructionOpen] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 1. Fetch Order Data
  const fetchOrderDetails = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const data = await ordersService.getOrderDetails(resolvedParams.id);
      setOrder(data);
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
    if (!order || order.status !== "pending") return;

    // Gunakan expireTime dari API, jika tidak ada fallback ke 24 jam setelah createdAt
    const expiryDate = order.expireTime 
      ? new Date(order.expireTime).getTime() 
      : new Date(order.createdAt).getTime() + (24 * 60 * 60 * 1000);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = expiryDate - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft(null);
        // Opsi: Auto-refresh saat waktu habis untuk update status jadi 'expired' / 'cancelled'
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
  const handleCopy = (text: string, field: "va" | "amount") => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // --- RENDERING STATES ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <RefreshCw className="w-8 h-8 animate-spin text-[#FF6B00]" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-lg font-bold">Gagal Memuat Pesanan</h2>
        <p className="text-gray-500 mt-2">{error}</p>
        <button onClick={() => router.push('/orders')} className="mt-6 text-[#FF6B00] font-bold">Kembali ke Pesanan Saya</button>
      </div>
    );
  }

  // Jika sudah dibayar, tampilkan layar sukses
  if (order.status === "paid" || order.status === "processing") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-10 sm:pt-20 px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-xl font-black text-gray-900 mb-2">Yay! Pembayaran Berhasil</h1>
          <p className="text-gray-500 text-sm mb-6">Pesanan Anda {order.orderNumber} sedang kami proses.</p>
          <button onClick={() => router.push(`/orders/${order.id}/detail`)} className="w-full bg-[#1C1C1C] text-white font-bold py-3.5 rounded-xl">
            Lihat Detail Pesanan
          </button>
        </div>
      </div>
    );
  }

  const isQris = order.paymentMethod === 'qris';
  const paymentMethodName = order.paymentMethod.replace('_va', ' Virtual Account').toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 sm:py-10">
      <div className="w-full max-w-md mx-auto bg-white min-h-screen sm:min-h-fit sm:rounded-2xl sm:shadow-lg sm:border sm:border-gray-200 overflow-hidden flex flex-col">
        
        {/* HEADER */}
        <header className="px-4 py-4 flex items-center gap-4 border-b border-gray-100 bg-white sticky top-0 z-10">
          <button onClick={() => router.back()} className="p-1 -ml-1 hover:bg-gray-100 rounded-full">
            <ArrowLeft size={24} className="text-gray-900" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Pembayaran</h1>
        </header>

        <div className="flex-1 overflow-y-auto">
          {/* TIMER SECTION */}
          <div className="p-5 flex flex-col items-center border-b border-gray-100 bg-white">
            <p className="text-sm font-medium text-gray-500 mb-3">Batas Akhir Pembayaran</p>
            {timeLeft ? (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 px-6 py-2.5 rounded-full font-black text-lg">
                <Clock size={20} />
                <span>
                  {String(timeLeft.hours).padStart(2, '0')} : {String(timeLeft.minutes).padStart(2, '0')} : {String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </div>
            ) : (
              <div className="text-red-600 font-bold bg-red-50 px-6 py-2 rounded-full">Waktu Habis</div>
            )}
          </div>

          {/* PAYMENT DETAILS */}
          <div className="p-5 space-y-6 bg-white">
            {/* Nama Bank / Metode */}
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-900 text-sm">{paymentMethodName}</span>
              {/* Tempat logo Bank/QRIS (Opsional: bisa disesuaikan dengan image statis) */}
              <div className="px-3 py-1 bg-blue-50 text-blue-800 font-black italic text-xs rounded">
                {isQris ? 'QRIS' : paymentMethodName.split(' ')[0]}
              </div>
            </div>

            <hr className="border-dashed border-gray-200" />

            {/* KONDISIONAL: VA vs QRIS */}
            {isQris ? (
              <div className="flex flex-col items-center justify-center py-4">
                <p className="text-sm text-gray-500 mb-4">Scan QR Code di bawah ini</p>
                <div className="w-64 h-64 relative border border-gray-200 rounded-xl overflow-hidden p-2 bg-white shadow-sm">
                  {order.qrCodeUrl ? (
                    <Image src={order.qrCodeUrl} alt="QRIS Code" fill className="object-contain p-2" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">QR Code tidak tersedia</div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1.5">Nomor Virtual Account</p>
                <div className="flex items-center justify-between">
                  <p className="text-xl font-black text-gray-900 tracking-wide">{order.vaNumber || "-"}</p>
                  <button 
                    onClick={() => handleCopy(order.vaNumber || "", "va")}
                    className="flex items-center gap-1.5 text-[#FF6B00] font-bold text-sm bg-orange-50 px-3 py-1.5 rounded-lg hover:bg-orange-100 transition"
                  >
                    {copiedField === "va" ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                    {copiedField === "va" ? "Tersalin" : "Salin"}
                  </button>
                </div>
              </div>
            )}

            {/* TOTAL PEMBAYARAN */}
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1.5">Total Pembayaran</p>
              <div className="flex items-center justify-between">
                <p className="text-xl font-black text-gray-900">{formatPrice(order.total)}</p>
                <button 
                  onClick={() => handleCopy(order.total.toString(), "amount")}
                  className="flex items-center gap-1.5 text-[#FF6B00] font-bold text-sm bg-orange-50 px-3 py-1.5 rounded-lg hover:bg-orange-100 transition"
                >
                  {copiedField === "amount" ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                  {copiedField === "amount" ? "Tersalin" : "Salin"}
                </button>
              </div>
            </div>
          </div>

          <div className="h-2 bg-gray-50"></div> {/* Spacer */}

          {/* ACCORDION CARA PEMBAYARAN */}
          <div className="bg-white">
            <button 
              onClick={() => setIsInstructionOpen(!isInstructionOpen)}
              className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition"
            >
              <span className="font-bold text-gray-900 text-sm">Cara Pembayaran</span>
              {isInstructionOpen ? <ChevronUp size={20} className="text-gray-500"/> : <ChevronDown size={20} className="text-gray-500"/>}
            </button>
            
            {isInstructionOpen && (
              <div className="px-5 pb-5 text-sm text-gray-600 space-y-4">
                {isQris ? (
                  <ol className="list-decimal pl-4 space-y-2">
                    <li>Buka aplikasi m-Banking atau e-Wallet Anda (Gopay, OVO, Dana, dll).</li>
                    <li>Pilih menu <strong>Scan QR</strong>.</li>
                    <li>Scan QR Code yang tampil di layar ini.</li>
                    <li>Periksa detail pembayaran dan pastikan nominal sesuai.</li>
                    <li>Masukkan PIN Anda untuk menyelesaikan pembayaran.</li>
                  </ol>
                ) : (
                  <ol className="list-decimal pl-4 space-y-2">
                    <li>Buka m-Banking, Internet Banking, atau ATM {paymentMethodName.split(' ')[0]}.</li>
                    <li>Pilih menu <strong>Transfer</strong> &gt; <strong>Virtual Account</strong>.</li>
                    <li>Masukkan Nomor Virtual Account: <strong className="text-black">{order.vaNumber}</strong>.</li>
                    <li>Pastikan jumlah tagihan persis sebesar <strong className="text-black">{formatPrice(order.total)}</strong>.</li>
                    <li>Selesaikan pembayaran.</li>
                  </ol>
                )}
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM ACTION BUTTONS */}
        <div className="p-4 border-t border-gray-100 bg-white grid gap-3 pb-safe">
          <button 
            onClick={() => { setIsRefreshing(true); fetchOrderDetails(false); }}
            disabled={isRefreshing}
            className="w-full border-2 border-[#1C1C1C] text-[#1C1C1C] hover:bg-gray-50 font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2"
          >
            {isRefreshing ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Cek Status Pembayaran"}
          </button>
          <button 
            onClick={() => router.push("/")}
            className="w-full bg-[#1C1C1C] text-white hover:bg-black font-bold py-3.5 rounded-xl transition"
          >
            Kembali ke Beranda
          </button>
        </div>

      </div>
    </div>
  );
}